const { Order, User, OrderItem, Product, sequelize } = require("../models");
const { Op } = require("sequelize");

exports.getStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Buat klausa where untuk filter tanggal
    const dateWhereClause = {};
    if (startDate && endDate) {
      dateWhereClause.createdAt = {
        [Op.between]: [
          new Date(startDate),
          new Date(new Date(endDate).setHours(23, 59, 59, 999)),
        ],
      };
    }

    // 1. Total Revenue (from completed orders)
    const totalRevenue = await Order.sum("total_amount", {
      where: { status: "completed", ...dateWhereClause },
    });

    // 2. Total Orders
    const totalOrders = await Order.count({ where: dateWhereClause });

    // 3. New Orders Today
    const newOrdersToday = await Order.count({
      where: {
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      },
    });

    // 4. New Users Today
    const newUsersToday = await User.count({
      where: {
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      },
    });

    // 5. Recent Orders
    const recentOrders = await Order.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      include: [{ model: User, attributes: ["user_name"] }],
    });

    // 6. Produk terlaris 5 teratas
    const bestSellingProducts = await OrderItem.findAll({
      attributes: [
        "product_id",
        [sequelize.fn("SUM", sequelize.col("quantity")), "totalQuantity"],
      ],
      group: ["product_id"],
      order: [[sequelize.col("totalQuantity"), "DESC"]],
      limit: 5,
      include: [
        { model: Product, attributes: ["product_name"], as: "product" },
      ],
    });

    //7. Favorite Metode Pmebayaran
    const favoritePaymentMethods = await Order.findAll({
      attributes: [
        "payment_method",
        [sequelize.fn("COUNT", sequelize.col("payment_method")), "count"],
      ],
      group: ["payment_method"],
      order: [[sequelize.col("count"), "DESC"]],
    });

    //8. Total jenis product yang sudah terjual
    const totalProductSold = await OrderItem.count({
      distinct: true,
      col: "product_id",
      include: [
        {
          model: Order,
          where: { status: "completed", ...dateWhereClause },
          attributes: [],
        },
      ],
    });

    //9. total user
    const totalUser = await User.count();

    res.status(200).json({
      totalRevenue: totalRevenue || 0,
      totalOrders: totalOrders || 0,
      newOrdersToday: newOrdersToday || 0,
      newUsersToday: newUsersToday || 0,
      recentOrders: recentOrders || [],
      bestSellingProducts: bestSellingProducts || [],
      favoritePaymentMethods: favoritePaymentMethods || [],
      totalProductSold: totalProductSold || 0,
      totalCustomers: totalUser || 0,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getSalesChartData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Tentukan rentang tanggal untuk query
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        [Op.between]: [
          new Date(startDate),
          new Date(new Date(endDate).setHours(23, 59, 59, 999)),
        ],
      };
    } else {
      // Default 7 hari terakhir jika tidak ada rentang tanggal
      dateFilter.createdAt = {
        [Op.gte]: new Date(new Date() - 7 * 24 * 60 * 60 * 1000),
      };
    }

    const salesData = await Order.findAll({
      attributes: [
        [sequelize.fn("DATE", sequelize.col("createdAt")), "date"],
        [sequelize.fn("SUM", sequelize.col("total_amount")), "totalSales"],
      ],
      where: { status: "processing", ...dateFilter },
      group: [sequelize.fn("DATE", sequelize.col("createdAt"))],
      order: [[sequelize.fn("DATE", sequelize.col("createdAt")), "ASC"]],
      raw: true,
    });

    // Buat array tanggal untuk rentang yang dipilih (atau default 7 hari)
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(new Date().getDate() - 6));
    const end = endDate ? new Date(endDate) : new Date();
    const daysInRange = [];
    for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
      daysInRange.push(new Date(dt).toISOString().split("T")[0]);
    }

    const chartData = daysInRange.map((day) => {
      const sale = salesData.find((s) => s.date === day);
      return {
        name: new Date(day).toLocaleDateString("id-ID", {
          weekday: "short",
          day: "numeric",
        }),
        Pendapatan: sale ? parseFloat(sale.totalSales) : 0,
      };
    });

    res.status(200).json(chartData);
  } catch (error) {
    console.error("Error fetching sales chart data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
