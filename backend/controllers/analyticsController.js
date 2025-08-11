const { Product, ProductViews, sequelize } = require("../models");
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
 * @description Mengambil produk yang paling sering dilihat berdasarkan periode waktu.
 * @route GET /api/analytics/top-products?period=7d&limit=10
 * @access Public
 */
exports.getTopProducts = async (req, res) => {
  const { period = "7d", limit = 10, page = 1 } = req.query;

  let intervalValue;
  let intervalUnit = "DAY";

  switch (period) {
    case "24h":
      intervalValue = 1;
      break;
    case "3d":
      intervalValue = 3;
      break;
    case "7d":
      intervalValue = 7;
      break;
    case "30d":
      intervalValue = 30;
      break;
    default:
      return res.status(400).json({
        message: "Invalid period. Use one of: 24h, 3d, 7d, 30d.",
      });
  }

  const limitNum = parseInt(limit, 10);
  const pageNum = parseInt(page, 10);
  const offset = (pageNum - 1) * limitNum;

  try {
    // Gunakan findAndCountAll untuk mendapatkan data dan total group untuk paginasi
    const { count, rows: topProductViews } = await ProductViews.findAndCountAll(
      {
        attributes: [
          "product_id",
          [
            sequelize.fn("COUNT", sequelize.col("ProductViews.id")),
            "view_count",
          ],
        ],
        where: {
          viewed_at: {
            [Op.gte]: sequelize.literal(
              `NOW() - INTERVAL ${intervalValue} ${intervalUnit}`
            ),
          },
        },
        include: [{ model: Product, as: "Product", required: true }],
        group: ["Product.product_id"],
        order: [[sequelize.col("view_count"), "DESC"]],
        limit: limitNum,
        offset: offset,
        distinct: true,
      }
    );

    const results = topProductViews.map((view) => ({
      ...parseProductJSONFields(view.Product),
      view_count: parseInt(view.get("view_count"), 10),
    }));

    res.status(200).json({
      data: results,
      totalPages: Math.ceil(count.length / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error("Error fetching top products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
