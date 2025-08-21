const {
  getJnePrice,
  generateAirwayBill,
  trackingOrder,
} = require("../services/jne");
const {
  Order,
  OrderItem,
  Product,
  list_dest,
  User,
  sequelize,
  Setting,
} = require("../models");
const { getToken } = require("next-auth/jwt");

const getUserFromToken = async (req) => {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });
  if (!token || !token.email) return null;
  return await User.findOne({ where: { user_email: token.email } });
};

const findTariffCode = async (zipCode) => {
  if (!zipCode) {
    return null;
  }

  try {
    // Since one zip code can map to multiple subdistricts, we find the first one.
    // JNE pricing is usually based on a larger area (district/city), so this should be sufficient.
    const location = await list_dest.findOne({
      where: {
        ZIP_CODE: zipCode,
      },
      attributes: ["TARIFF_CODE"],
      raw: true,
    });

    return location ? location.TARIFF_CODE : null;
  } catch (error) {
    console.error("Error finding tariff code by zip code:", error);
    return null;
  }
};

exports.getShippingRates = async (req, res) => {
  const { origin, destination, weight } = req.body;

  const user = await getUserFromToken(req);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  //   if (order.shipping_number) {
  //     console.log(
  //       `AWB already exists for order ${order.order_id}. Skipping generation.`
  //     );
  //     return;
  //   }

  if (!origin || !destination?.zipCode || !weight || !Number(weight) > 0) {
    return res.status(400).json({
      message: "Origin, destination zip code, and a valid weight are required.",
    });
  }

  try {
    const fromTariffCode = origin;

    const thruTariffCode = await findTariffCode(destination.zipCode);

    if (!fromTariffCode || !thruTariffCode) {
      return res.status(404).json({
        message:
          "Could not find tariff code for the specified origin or destination.",
        details: {
          originFound: !!fromTariffCode,
          destinationFound: !!thruTariffCode,
        },
      });
    }

    const jneResponse = await getJnePrice({
      from: fromTariffCode,
      thru: thruTariffCode,
      weight: parseFloat(weight),
    });

    if (jneResponse?.price?.length > 0) {
      // Ambil layanan JNE yang aktif dari Settings
      const activeServicesSetting = await Setting.findOne({
        where: { key: "shipping_jne_active_services" },
      });

      // Default ke array kosong jika setting tidak ditemukan atau value-nya kosong
      let activeServices = [];
      if (activeServicesSetting?.value) {
        try {
          // Parse string JSON dari database menjadi array
          activeServices = JSON.parse(activeServicesSetting.value);
        } catch (e) {
          console.error("Failed to parse JNE active services setting:", e);
          // Biarkan activeServices array kosong jika parsing gagal
        }
      }

      // Filter harga berdasarkan layanan yang aktif.
      // Jika tidak ada setting, tidak ada layanan yang akan ditampilkan.
      const filteredPrices = jneResponse.price.filter((p) =>
        activeServices.includes(p.service_display)
      );

      res.status(200).json(filteredPrices);
    } else {
      res.status(404).json({
        message: "No shipping options found for the given locations from JNE.",
        jneResponse: jneResponse,
      });
    }
  } catch (error) {
    console.error("Error getting shipping rates:", error);
    res.status(500).json({ message: "Failed to get shipping rates." });
  }
};

/**
 * Generates an AWB for a given order and updates its status.
 * This function is intended to be called internally after a payment is confirmed.
 * @param {Order} order - The Sequelize order object, pre-fetched with items and products.
 * @param {import('sequelize').Transaction} transaction - The database transaction.
 */
exports.generateAwbForOrder = async (order, transaction) => {
  if (order.shipping_number) {
    console.log(
      `AWB already exists for order ${order.order_id}. Skipping generation.`
    );
    return;
  }

  const shippingAddress = JSON.parse(order.shipping_address);
  const destinationCode = await findTariffCode(shippingAddress.address_pincode);

  if (!destinationCode) {
    throw new Error(
      `Could not find JNE destination code for the address in order ${order.order_id}.`
    );
  }

  const totalQuantity = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalWeight = order.items.reduce(
    (sum, item) => sum + (item.product.product_weight || 0.5) * item.quantity,
    0
  );
  const goodsDescription = order.items
    .map((item) => `${item.product_name} (Qty: ${item.quantity})`)
    .join(", ")
    .substring(0, 60); // Max 60 chars

  const awbData = {
    orderId: order.order_id,
    receiverName: shippingAddress.address_full_name,
    receiverAddr1: shippingAddress.address_area,
    receiverCity: shippingAddress.address_city,
    receiverZip: shippingAddress.address_pincode,
    receiverPhone: shippingAddress.address_phone,
    quantity: totalQuantity,
    weight: Math.max(1, totalWeight),
    goodsDescription: goodsDescription,
    goodsValue: order.subtotal,
    useInsurance: "N",
    destinationCode: destinationCode,
    serviceCode: order.shipping_method.split(" ")[0], // e.g., 'JTR' from 'JTR (3-4 hari)'
    useCOD: order.payment_method === "cod" ? "YES" : "N",
    codAmount: order.payment_method === "cod" ? order.total_amount : 0,
  };

  const jneResponse = await generateAirwayBill(awbData);
  const cnoteNo = jneResponse?.detail?.[0]?.cnote_no;

  if (!cnoteNo) {
    throw new Error("Failed to get AWB number from JNE response.");
  }

  order.shipping_number = cnoteNo;
  await order.save({ transaction });

  console.log(
    `Order ${order.order_id} updated with AWB ${cnoteNo}. Status remains "${order.status}".`
  );
};

exports.trackOrder = async (req, res) => {
  const user = await getUserFromToken(req);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const { orderId } = req.params;
  const t = await sequelize.transaction();

  try {
    const order = await Order.findOne({
      where: { order_id: orderId, user_id: user.user_id }, // Ensure user can only track their own order
      transaction: t,
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: "Order not found." });
    }

    if (!order.shipping_number) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "No AWB number found for this order." });
    }

    const trackingData = await trackingOrder(order.shipping_number);

    // Check the last status in the history to update the order.
    // JNE status 'DELIVERED' usually means the package has arrived.
    const history = trackingData?.history || trackingData?.detail?.[0]?.history;
    if (Array.isArray(history) && history.length > 0) {
      const lastStatus = history[history.length - 1];
      const isDelivered = lastStatus?.desc?.toUpperCase().includes("DELIVERED");

      if (isDelivered && order.status !== "completed") {
        order.status = "completed";
        await order.save({ transaction: t });
        console.log(`Order ${orderId} status updated to completed.`);
      } else if (order.status === "processing" && history.length > 0) {
        // If status is still 'processing', update to 'shipped' once there's tracking history.
        order.status = "shipped";
        await order.save({ transaction: t });
        console.log(`Order ${orderId} status updated to shipped.`);
      }
    }

    await t.commit();

    res.status(200).json({
      message: "Tracking information retrieved successfully.",
      trackingData,
      orderStatus: order.status,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error tracking order:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to track order." });
  }
};

exports.trackByAwb = async (req, res) => {
  const { awb } = req.params;
  if (!awb) {
    return res.status(400).json({ message: "Nomor resi (AWB) diperlukan." });
  }

  try {
    const trackingData = await trackingOrder(awb);

    res.status(200).json(trackingData);
  } catch (error) {
    console.error("Error tracking order by AWB:", error);
    res
      .status(500)
      .json({ message: error.message || "Gagal melacak pesanan." });
  }
};

// ADMIN
// idenya untuk menampilkan service jne apa saja yang akan ditampilkan di dropdown saatcheckout ada jtr, reg, dan yes
// exports.changeServiceToShow = async (req, res) => {
//   const { orderId } = req.params;
//   const
// }
