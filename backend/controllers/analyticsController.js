const {
  Product,
  ProductViews,
  CartItem,
  User,
  Category,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

// Helper function untuk mem-parsing field JSON dari objek produk.
// Sebaiknya, fungsi ini dipindahkan ke file utilitas bersama agar tidak duplikat.
const parseProductJSONFields = (productData) => {
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
        console.error(
          `Error parsing ${field.key} for product ${product.product_id}:`,
          e.message
        );
        product[field.key] = field.default;
      }
    } else if (!value) {
      product[field.key] = field.default;
    }
  }
  return product;
};

/**
 * Helper function to get consistent start and end dates from query parameters.
 * @param {object} query - The request query object.
 * @returns {{startDate: Date, endDate: Date}}
 */
const getStartAndEndDates = (query) => {
  const { period = "7d", startDate, endDate } = query;

  // Priority to custom date range
  if (startDate && endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the whole end day
    return { startDate: new Date(startDate), endDate: end };
  }

  const now = new Date();
  let start;

  if (period.endsWith("h")) {
    const hours = parseInt(period, 10);
    if (!isNaN(hours)) {
      start = new Date(now.getTime() - hours * 60 * 60 * 1000);
    }
  } else {
    // Default to days
    const days = parseInt(period, 10) || 7; // Default to 7 days if format is invalid
    start = new Date(new Date().setDate(now.getDate() - days));
  }

  return { startDate: start, endDate: new Date() };
};

/**
 * @description Mengambil produk yang paling sering dilihat berdasarkan periode waktu.
 * @route GET /api/analytics/top-products?period=7d&limit=10&page=1&sort=views|carts|combined
 * @access Public
 */
exports.getTopProducts = async (req, res) => {
  const { limit = 10, page = 1, sort = "combined" } = req.query;
  const limitNum = parseInt(limit, 10);
  const pageNum = parseInt(page, 10);
  const offset = (pageNum - 1) * limitNum;

  // Determine order based on sort parameter
  let orderClause;
  let whereClause = {};

  switch (sort) {
    case "views":
      orderClause = [
        [sequelize.literal("view_count"), "DESC"],
        ["product_name", "ASC"],
      ];
      whereClause = sequelize.literal(`(
        SELECT COUNT(DISTINCT ProductViews.id) FROM ProductViews
        WHERE ProductViews.product_id = Product.product_id AND ProductViews.viewed_at BETWEEN :startDate AND :endDate
      ) > 0`);
      break;

    case "carts":
      orderClause = [
        [sequelize.literal("cart_add_count"), "DESC"],
        ["product_name", "ASC"],
      ];
      whereClause = sequelize.literal(`(
        SELECT COUNT(DISTINCT CartItem.id) FROM CartItem
        WHERE CartItem.product_id = Product.product_id AND CartItem.updatedAt BETWEEN :startDate AND :endDate
      ) > 0`);
      break;

    case "combined":
    default:
      orderClause = [
        [sequelize.literal("view_count + cart_add_count"), "DESC"],
        ["product_name", "ASC"],
      ];
      // Filter produk yang memiliki views atau cart adds
      whereClause = {
        [Op.or]: [
          sequelize.literal(`(
            EXISTS (SELECT 1 FROM ProductViews WHERE ProductViews.product_id = Product.product_id AND ProductViews.viewed_at BETWEEN :startDate AND :endDate)
          )`),
          sequelize.literal(`(
            EXISTS (SELECT 1 FROM CartItem WHERE CartItem.product_id = Product.product_id AND CartItem.updatedAt BETWEEN :startDate AND :endDate)
          )`),
        ],
      };
      break;
  }

  try {
    const { startDate, endDate } = getStartAndEndDates(req.query);

    const { count, rows } = await Product.findAndCountAll({
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(DISTINCT ProductViews.id)
              FROM ProductViews
              WHERE ProductViews.product_id = Product.product_id
              AND ProductViews.viewed_at BETWEEN :startDate AND :endDate
            )`),
            "view_count",
          ],
          [
            sequelize.literal(`(
              SELECT COALESCE(SUM(CartItem.quantity), 0)
              FROM CartItem
              WHERE CartItem.product_id = Product.product_id
              AND CartItem.updatedAt BETWEEN :startDate AND :endDate
            )`),
            "cart_add_count",
          ],
        ],
      },
      where: whereClause,
      order: orderClause,
      limit: limitNum,
      offset: offset,
      replacements: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });

    const results = rows.map((product) => {
      const plainProduct = parseProductJSONFields(product);
      return {
        ...plainProduct,
        view_count: parseInt(plainProduct.view_count, 10) || 0,
        cart_add_count: parseInt(plainProduct.cart_add_count, 10) || 0,
      };
    });

    res.status(200).json({
      data: results,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      sort: sort,
    });
  } catch (error) {
    console.error("Error fetching top products:", error);
    res.status(500).json({ message: "Gagal mengambil data produk teratas." });
  }
};

/**
 * @description Mengambil daftar pengguna yang melihat produk tertentu.
 * @route GET /api/analytics/top-products/:productId/viewers
 * @access Admin
 */
exports.getProductViewers = async (req, res) => {
  const { productId } = req.params;
  const { startDate, endDate } = getStartAndEndDates(req.query);

  try {
    const views = await ProductViews.findAll({
      where: {
        product_id: productId,
        viewed_at: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          model: User,
          as: "User",
          attributes: ["user_id", "user_email", "user_name"],
          required: false, // Gunakan LEFT JOIN untuk menyertakan view dari guest
        },
        {
          model: Product, // Tambahkan ini jika perlu info produk di detail
          as: "Product",
          attributes: ["product_id", "product_name"],
        },
      ],
      order: [["viewed_at", "DESC"]],
    });

    const formattedViews = views.map((view) => {
      const plainView = view.get({ plain: true });
      if (!plainView.User) {
        plainView.User = {
          user_name: "Guest",
          user_email: "Pengunjung tidak login",
        };
      }
      return plainView;
    });

    res.status(200).json(formattedViews);
  } catch (error) {
    console.error("Error fetching product viewers:", error);
    res.status(500).json({ message: "Gagal mengambil data pengunjung." });
  }
};

/**
 * @description Mengambil daftar pengguna yang menambahkan produk tertentu ke keranjang.
 * @route GET /api/analytics/top-products/:productId/cart-adds
 * @access Admin
 */
exports.getProductCartAdds = async (req, res) => {
  const { productId } = req.params;
  const { startDate, endDate } = getStartAndEndDates(req.query);

  try {
    const cartAdds = await CartItem.findAll({
      where: {
        product_id: productId,
        updatedAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          model: User,
          as: "User",
          attributes: ["user_id", "user_email", "user_name"],
          required: false, // Allow cart items without users (guest checkout)
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formattedCartAdds = cartAdds.map((cartAdd) => {
      const plainCartAdd = cartAdd.get({ plain: true });
      if (!plainCartAdd.User) {
        plainCartAdd.User = {
          user_name: "Guest",
          user_email: "Pengunjung tidak login",
        };
      }
      return plainCartAdd;
    });

    res.status(200).json(formattedCartAdds);
  } catch (error) {
    console.error("Error fetching product cart adds:", error);
    res.status(500).json({ message: "Gagal mengambil data keranjang." });
  }
};
