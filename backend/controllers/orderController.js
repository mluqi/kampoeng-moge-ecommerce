const {
  Order,
  OrderItem,
  Product,
  User,
  CartItem,
  sequelize,
  Category,
  Peyment_method,
  Review,
} = require("../models");
const { getToken } = require("next-auth/jwt");
const { Op, where } = require("sequelize");
const {
  createInvoice,
  getInvoiceById,
  getAllInvoices,
} = require("../services/xendit");
const { syncStockToTiktok } = require("./productController");
const {
  searchOrders: searchTiktokOrders,
  getOrderDetails: getTiktokOrderDetails,
} = require("../services/tiktokShop");

// Helper function to safely parse JSON fields from a product object
const parseProductJSONFields = (productData) => {
  // If it's a Sequelize instance, get the plain object. Otherwise, clone it to avoid mutation.
  const product = productData.get
    ? productData.get({ plain: true })
    : { ...productData };

  const fieldsToParse = [
    { key: "product_pictures", default: [] },
    { key: "product_dimensions", default: {} },
    { key: "product_attributes_tiktok", default: [] },
  ];

  for (const field of fieldsToParse) {
    const value = product[field.key];
    if (value && typeof value === "string") {
      try {
        product[field.key] = JSON.parse(value);
      } catch (e) {
        product[field.key] = field.default; // Fallback to default on parsing error
      }
    } else if (!value) {
      product[field.key] = field.default; // Fallback to default if null/undefined
    }
  }
  return product;
};

// Helper to parse products within a single order object
const parseOrder = (orderInstance) => {
  if (!orderInstance) return null;
  const order = orderInstance.toJSON();
  if (order.items && Array.isArray(order.items)) {
    order.items = order.items.map((item) => {
      if (item.product) {
        item.product = parseProductJSONFields(item.product);
      }
      return item;
    });
  }
  return order;
};

const getUserFromToken = async (req) => {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });
  if (!token || !token.email) return null;
  return await User.findOne({ where: { user_email: token.email } });
};

// Helper to generate a unique order ID
const generateOrderId = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  const prefix = `ORD-${year}${month}${day}-`;

  const lastOrder = await Order.findOne({
    where: {
      order_id: {
        [Op.like]: `${prefix}%`,
      },
    },
    order: [["order_id", "DESC"]],
  });

  let nextNumber = 1;
  if (lastOrder) {
    const lastNumber = parseInt(lastOrder.order_id.split("-").pop(), 10);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(5, "0")}`;
};

exports.getOrders = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const orders = await Order.findAll({
      where: { user_id: user.user_id },
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["product_id", "product_name", "product_pictures"],
            },
            {
              model: Review,
              as: "reviews",
              required: false, // LEFT JOIN untuk menyertakan item yang belum diulas
              where: {
                user_id: user.user_id,
              },
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const parsedOrders = orders.map(parseOrder);

    res.status(200).json(parsedOrders);
  } catch (error) {
    console.error("Error getting orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getTiktokOrders = async (req, res) => {
  try {
    // page_size and page_token are query parameters
    const { page_size = 10, page_token } = req.query;
    // other filters are in the body
    const body = req.body || {};

    const queryParams = { page_size };
    if (page_token) {
      queryParams.page_token = page_token;
    }

    const tiktokResponse = await searchTiktokOrders(body, queryParams);

    res.status(200).json(tiktokResponse);
  } catch (error) {
    console.error("Error fetching TikTok Shop orders:", error);
    const statusCode =
      error.code && String(error.code).startsWith("4") ? 400 : 500;
    res.status(statusCode).json({
      message: "Gagal mengambil pesanan dari TikTok Shop.",
      details: error,
    });
  }
};

exports.getTiktokOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Order ID is required." });
    }

    // The TikTok API expects an array of IDs, even for a single lookup
    const tiktokResponse = await getTiktokOrderDetails([id]);

    // The API returns an array of orders, even for a single ID lookup.
    // We'll take the first one.
    if (tiktokResponse?.data?.orders && tiktokResponse.data.orders.length > 0) {
      res.status(200).json(tiktokResponse.data.orders[0]);
    } else {
      res.status(404).json({ message: "Order not found on TikTok Shop." });
    }
  } catch (error) {
    console.error("Error fetching TikTok Shop order details:", error);
    const statusCode =
      error.code && String(error.code).startsWith("4") ? 400 : 500;
    res.status(statusCode).json({
      message: "Gagal mengambil detail pesanan dari TikTok Shop.",
      details: error,
    });
  }
};

// tambahkan fee 1% 1/100 x total_barang
exports.createOrder = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const user = await getUserFromToken(req);
    if (!user) {
      await t.rollback();
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Validasi nomor telepon pengguna
    if (!user.user_phone) {
      await t.rollback();
      return res.status(400).json({
        message:
          "Nomor telepon wajib diisi di profil Anda untuk membuat pesanan.",
      });
    }

    const { items, shippingAddress, shippingMethod, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: "Keranjang belanja kosong." });
    }
    if (!shippingAddress || !shippingMethod || !paymentMethod) {
      await t.rollback();
      return res.status(400).json({
        message: "Informasi pengiriman dan pembayaran tidak lengkap.",
      });
    }

    // 1. Ambil detail metode pembayaran dari database
    const paymentMethodDetails = await Peyment_method.findOne({
      where: { wlpay_code: paymentMethod, is_active: true },
      transaction: t,
    });

    if (!paymentMethodDetails) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Metode pembayaran tidak valid." });
    }

    const productIds = items.map((item) => item.product_id);
    const productsInDb = await Product.findAll({
      where: { product_id: { [Op.in]: productIds } },
      transaction: t,
    });

    let calculatedSubtotal = 0;
    const orderItemsData = [];
    const productsToSync = []; // Array untuk menampung produk yang akan disinkronkan

    for (const item of items) {
      const product = productsInDb.find(
        (p) => p.product_id === item.product_id
      );

      if (!product || product.product_status !== "active") {
        await t.rollback();
        return res.status(404).json({
          message: `Produk "${
            product?.product_name || item.product_id
          }" tidak tersedia.`,
        });
      }

      if (product.product_stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({
          message: `Stok untuk produk "${product.product_name}" tidak mencukupi.`,
        });
      }

      let priceToUse = product.product_price;
      if (product.product_is_discount && product.product_discount_status) {
        const now = new Date();
        const startDate = product.product_discount_start_date
          ? new Date(product.product_discount_start_date)
          : null;
        const endDate = product.product_discount_end_date
          ? new Date(product.product_discount_end_date)
          : null;

        const isDateActive =
          (!startDate || now >= startDate) && (!endDate || now <= endDate);

        if (isDateActive) {
          priceToUse = product.product_discount_price;
        }
      }
      const itemSubtotal = priceToUse * item.quantity;

      calculatedSubtotal += itemSubtotal;

      // Kurangi stok produk di dalam transaksi
      const newStock = product.product_stock - item.quantity;
      await Product.update(
        { product_stock: newStock },
        { where: { product_id: product.product_id }, transaction: t }
      );

      // Tambahkan produk ke daftar sinkronisasi
      productsToSync.push({
        productId: product.product_id,
        newStock: newStock,
      });

      orderItemsData.push({
        product_id: product.product_id,
        product_name: product.product_name,
        price: priceToUse,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });
    }

    // 2. Hitung biaya berdasarkan metode pembayaran
    let orderFee = 0;
    let transactionFee = 0;
    const installmentTerm = paymentMethodDetails.installment_term;

    if (paymentMethodDetails.wlpay_code === "CREDIT_CARD") {
      // Biaya kartu kredit tanpa cicilan: 2.9% + 2000
      orderFee = calculatedSubtotal * 0.029 + 2000;
      // Jika ada implementasi cicilan di masa depan, tambahkan logika di sini
      // Contoh:
      if (installmentTerm === 3) {
        orderFee = calculatedSubtotal * 0.05 + 2000;
      } else if (installmentTerm === 6) {
        orderFee = calculatedSubtotal * 0.07 + 2000;
      } else if (installmentTerm === 12) {
        orderFee = calculatedSubtotal * 0.1 + 2000;
      }
      transactionFee = orderFee * 0.11; // 11% dari biaya cicilan
    } else {
      // Metode pembayaran selain kartu kredit (misal VA): hanya transaction fee
      transactionFee = parseFloat(paymentMethodDetails.transaction_fee_va) || 0;
    }

    const ppn = transactionFee * 0.11;

    const shippingCost = shippingMethod.cost || 0;

    const fee_apps = calculatedSubtotal * 0.01; // 1% dari subtotal barang

    const orderId = await generateOrderId();

    const admin_fee = (Math.ceil(transactionFee + ppn) / 1000) * 1000;

    const fees = [];
    // if (orderFee > 0) {
    //   fees.push({ type: "Biaya Kartu Kredit", value: orderFee });
    // }
    if (transactionFee > 0) {
      fees.push({
        type: "Biaya Admin",
        value: Math.ceil((admin_fee + orderFee) / 1000) * 1000,
      });
    }
    // if (ppn > 0) {
    //   fees.push({ type: "PPN (11%)", value: ppn });
    // }

    // 3. Kalkulasi total akhir yang akurat
    const totalAmount =
      Math.ceil(
        (calculatedSubtotal + orderFee + transactionFee + ppn + shippingCost) /
          1000
      ) * 1000;

    let paymentDetails = {};
    const invoiceData = {
      external_id: orderId,
      amount: totalAmount,
      description: `Pembayaran pesanan ${orderId}`,
      invoice_duration: 86400,
      currency: "IDR",
      payer_email: user.user_email,
      customer: {
        given_names: user.user_name,
        email: user.user_email,
        mobile_number: user.user_phone || "",
        addresses: [
          {
            city: shippingAddress.city || "",
            country: "Indonesia",
            postal_code: shippingAddress.postal_code || "",
            state: shippingAddress.state || "",
            street_line1: shippingAddress.street_line1 || "",
            street_line2: shippingAddress.address_area || "",
          },
        ],
      },
      items: orderItemsData
        .map((item) => ({
          name: item.product_name,
          quantity: item.quantity,
          price: item.price,
        }))
        .concat(
          shippingCost > 0
            ? [
                {
                  name: "Biaya Pengiriman",
                  quantity: 1,
                  price: shippingCost,
                },
              ]
            : []
        ),

      fees: fees,
      payment_methods: [paymentMethodDetails.wlpay_code],
      channel_properties:
        paymentMethodDetails.wlpay_code === "CREDIT_CARD"
          ? {
              cards: {
                installment_configuration: {
                  allow_installment: true,
                  allow_full_payment: true,
                  allowed_terms: [
                    {
                      issuer: "BRI",
                      terms: [3, 6, 12],
                    },
                    {
                      issuer: "BNI",
                      terms: [3, 6, 12],
                    },
                  ],
                },
              },
            }
          : undefined,
      customer_notification_preference: {
        invoice_created: ["email"],
      },
      success_redirect_url:
        process.env.XENDIT_SUCCESS_URL ||
        `${process.env.FRONTEND_URL}/order-placed`,
      failure_redirect_url:
        process.env.XENDIT_FAILURE_URL ||
        `${process.env.FRONTEND_URL}/payment-failed`,
    };
    const invoice = await createInvoice(invoiceData);
    paymentDetails = {
      invoice_id: invoice.id,
      invoice_url: invoice.invoice_url,
    };

    const newOrder = await Order.create(
      {
        order_id: orderId,
        user_id: user.user_id,
        total_amount: totalAmount,
        subtotal: calculatedSubtotal,
        order_fee: orderFee,
        transaction_fee: admin_fee,
        app_fee: fee_apps,
        tenor: installmentTerm,
        discount: 0,
        shipping_cost: shippingCost,
        shipping_method: shippingMethod.name,
        payment_method: paymentMethodDetails.wlpay_code,
        status: "pending",
        shipping_address: JSON.stringify(shippingAddress),
        payment_invoice_id: paymentDetails.invoice_id || null,
        payment_invoice_url: paymentDetails.invoice_url || null,
      },
      { transaction: t }
    );

    await OrderItem.bulkCreate(
      orderItemsData.map((item) => ({ ...item, order_id: orderId })),
      { transaction: t }
    );

    await CartItem.destroy({
      where: { user_id: user.user_id, product_id: { [Op.in]: productIds } },
      transaction: t,
    });

    await t.commit();

    // Setelah transaksi berhasil, sinkronkan stok ke TikTok
    // Proses ini berjalan di latar belakang dan tidak akan memblokir respons ke user
    for (const p of productsToSync) {
      syncStockToTiktok(p.productId, p.newStock);
    }

    const responseData = {
      message: "Pesanan berhasil dibuat.",
      order: newOrder,
    };

    if (paymentDetails.invoice_url) {
      responseData.invoice_url = paymentDetails.invoice_url;
    }

    return res.status(201).json({
      message: "Pesanan berhasil dibuat",
      order_id: orderId,
      invoice_url: paymentDetails.invoice_url,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const order = await Order.findOne({
      where: {
        order_id: req.params.id,
        user_id: user.user_id,
      },
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["product_id", "product_name", "product_pictures"],
            },
            {
              model: Review,
              as: "reviews",
              required: false, // LEFT JOIN untuk menyertakan item yang belum diulas
              where: {
                user_id: user.user_id,
              },
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan." });
    }

    res.status(200).json(parseOrder(order));
  } catch (error) {
    console.error("Error getting order by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.cancelOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      await t.rollback();
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id: orderId } = req.params;
    const { cancel_reason } = req.body;

    const order = await Order.findOne({
      where: {
        order_id: orderId,
        user_id: user.user_id,
      },
      transaction: t,
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: "Pesanan tidak ditemukan." });
    }

    if (
      [
        "processing",
        "shipped",
        "completed",
        "cancelled",
        "cancellation_requested",
      ].includes(order.status)
    ) {
      await t.rollback();
      return res.status(400).json({
        message: `Pesanan dengan status "${order.status}" tidak dapat diajukan pembatalan.`,
      });
    }

    order.status = "cancellation_requested";
    order.cancel_reason = cancel_reason;
    await order.save({ transaction: t });

    await t.commit();
    res.status(200).json({
      message: "Permintaan pembatalan telah diajukan.",
      order: parseOrder(order),
    });
  } catch (error) {
    await t.rollback();
    console.error("Error requesting order cancellation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// --- ADMIN FUNCTIONS ---

exports.getAllOrdersAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    let whereClause = {};
    if (status) whereClause.status = status;
    if (search) {
      whereClause[Op.or] = [
        { order_id: { [Op.like]: `%${search}%` } },
        // Cari berdasarkan SKU produk di dalam OrderItem
        // Tanda '$' digunakan untuk merujuk ke model yang di-include
        { "$items.product.product_sku$": { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: [
                "product_id",
                "product_name",
                "product_sku",
                "product_pictures",
              ],
            },
          ],
        },
        { model: User, attributes: ["user_name", "user_email"] },
      ],
      limit: limitNum,
      offset: offset,
      order: [["createdAt", "DESC"]],
      subQuery: false, // Penting untuk query dengan kondisi pada model yang di-include
    });

    const parsedRows = rows.map(parseOrder);

    res.status(200).json({
      data: parsedRows,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error("Error getting all orders for admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getOrderByIdAdmin = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { order_id: req.params.id },
      include: [
        { model: User, attributes: ["user_name", "user_email"] },
        {
          model: OrderItem,
          as: "items",
          include: [
            { model: Product, as: "product" },
            {
              model: Review,
              as: "reviews",
              required: false,
            },
          ],
        },
      ],
    });
    if (!order)
      return res.status(404).json({ message: "Pesanan tidak ditemukan." });
    res.status(200).json(parseOrder(order));
  } catch (error) {
    console.error("Error getting order by ID for admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const t = await sequelize.transaction();
  const { status } = req.body;
  if (!status) return res.status(400).json({ message: "Status is required." });

  try {
    const order = await Order.findOne({
      where: { order_id: req.params.id },
      include: [{ model: OrderItem, as: "items" }], // Sertakan item untuk update product_sold
      transaction: t,
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: "Pesanan tidak ditemukan." });
    }

    const oldStatus = order.status;
    order.status = status;
    await order.save({ transaction: t });

    // Jika status berubah menjadi 'completed' dari status lain, update jumlah terjual
    if (status === "completed" && oldStatus !== "completed") {
      for (const item of order.items) {
        await Product.increment("product_sold", {
          by: item.quantity,
          where: { product_id: item.product_id },
          transaction: t,
        });
      }
    }

    // Setelah menyimpan, ambil kembali data order lengkap dengan relasinya
    const updatedOrderWithItems = await Order.findOne({
      where: { order_id: req.params.id },
      include: [
        { model: User, attributes: ["user_name", "user_email"] },
        {
          model: OrderItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
      ],
      transaction: t,
    });

    await t.commit();

    res.status(200).json({
      message: "Status pesanan berhasil diperbarui.",
      order: parseOrder(updatedOrderWithItems),
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    await t.rollback();
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.approveCancelOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const order = await Order.findOne({
      where: { order_id: req.params.id },
      include: [
        {
          model: OrderItem,
          as: "items",
        },
      ],
      transaction: t,
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: "Pesanan tidak ditemukan." });
    }

    if (order.status !== "cancellation_requested") {
      await t.rollback();
      return res.status(400).json({
        message: `Pesanan dengan status "${order.status}" tidak dapat dibatalkan.`,
      });
    }

    order.status = "cancelled";
    await order.save({ transaction: t });

    const productsToSync = [];

    for (const item of order.items) {
      // Ambil produk untuk mendapatkan stok saat ini dan menambahkannya kembali
      const product = await Product.findByPk(item.product_id, {
        transaction: t,
      });
      if (product) {
        const newStock = product.product_stock + item.quantity;
        await product.update({ product_stock: newStock }, { transaction: t });

        // Tambahkan ke daftar untuk sinkronisasi
        productsToSync.push({
          productId: product.product_id,
          newStock: newStock,
        });
      }
    }

    await t.commit();

    // Setelah transaksi berhasil, sinkronkan stok kembali ke TikTok
    for (const p of productsToSync) {
      syncStockToTiktok(p.productId, p.newStock);
    }

    res.status(200).json({
      message: "Pesanan berhasil dibatalkan.",
      order: parseOrder(order),
    });
  } catch (error) {
    await t.rollback();
    console.error("Error approving cancellation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.rejectCancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { order_id: req.params.id },
    });
    if (!order) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan." });
    }

    if (order.status !== "cancellation_requested") {
      return res.status(400).json({
        message: `Pesanan dengan status "${order.status}" tidak dapat ditolak pembatalannya.`,
      });
    }

    order.status = "pending";
    order.cancel_reason = null;
    await order.save();

    res.status(200).json({
      message: "Permintaan pembatalan pesanan telah ditolak.",
      order: parseOrder(order),
    });
  } catch (error) {
    console.error("Error rejecting cancellation request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getProcessingOrdersCount = async (req, res) => {
  try {
    const count = await Order.count({
      where: { status: "processing" },
    });
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error getting processing orders count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
