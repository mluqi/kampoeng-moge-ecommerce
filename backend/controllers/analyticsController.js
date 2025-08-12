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

// Admin: Get all cart items to make analytics
exports.getAllCartItems = async (req, res) => {
  const { limit = 10, page = 1 } = req.query;

  const limitNum = parseInt(limit, 10);
  const pageNum = parseInt(page, 10);
  const offset = (pageNum - 1) * limitNum;

  if (isNaN(limitNum) || isNaN(pageNum) || limitNum <= 0 || pageNum <= 0) {
    return res.status(400).json({ message: "Invalid limit or page number." });
  }

  try {
    const { count, rows: cartItems } = await CartItem.findAndCountAll({
      include: [
        {
          model: User,
          as: "User",
          attributes: ["user_id", "user_email", "user_name"],
        },
        {
          model: Product,
          as: "product",
          include: [{ model: Category, as: "category" }],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: limitNum,
      offset: offset,
      distinct: true,
    });

    const responseData = cartItems.map((item) => {
      const plainItem = item.toJSON();
      if (item.product) {
        plainItem.product = parseProductJSONFields(item.product);
        // Remap the eager-loaded association from 'User' (as defined in the model)
        // to 'user' (as expected by the frontend).
        if (plainItem.User) {
          plainItem.user = plainItem.User;
          delete plainItem.User;
        }
      }
      // Remap the eager-loaded association from 'User' (as defined in the model)
      // to 'user' (as expected by the frontend).
      if (plainItem.User) {
        plainItem.user = plainItem.User;
        delete plainItem.User;
      }
      return plainItem;
    });

    res.status(200).json({
      data: responseData,
      totalItems: count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error("Error getting all cart items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @description Mengambil ringkasan data analitik untuk keranjang belanja.
 * @route GET /api/analytics/cart-summary
 * @access Admin
 */
exports.getCartAnalyticsSummary = async (req, res) => {
  try {
    const totalActiveCarts = await CartItem.count({
      distinct: true,
      col: "user_id",
    });

    const totalItemsInCart = await CartItem.sum("quantity");

    const totalValueResult = await CartItem.findAll({
      attributes: [
        "quantity",
        [sequelize.col("product.product_price"), "price"],
      ],
      include: [
        {
          model: Product,
          as: "product",
          attributes: [],
          required: true,
        },
      ],
      raw: true,
    });
    const totalValueInCart = totalValueResult.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    const topProductsByFrequency = await CartItem.findAll({
      attributes: [
        "product_id",
        [
          sequelize.fn("COUNT", sequelize.col("CartItem.product_id")),
          "frequency",
        ],
      ],
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["product_id", "product_name", "product_pictures"],
        },
      ],
      group: ["CartItem.product_id", "product.product_id"],
      order: [[sequelize.col("frequency"), "DESC"]],
      limit: 5,
    });

    const parseTopProducts = (items, countKey) =>
      items.map((item) => {
        const plainItem = item.toJSON();
        return {
          ...parseProductJSONFields(plainItem.product),
          [countKey]: parseInt(plainItem[countKey], 10),
        };
      });

    res.status(200).json({
      totalActiveCarts,
      totalItemsInCart: totalItemsInCart || 0,
      totalValueInCart,
      topProductsByFrequency: parseTopProducts(
        topProductsByFrequency,
        "frequency"
      ),
    });
  } catch (error) {
    console.error("Error fetching cart analytics summary:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
