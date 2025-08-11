const { Wishlist, User, Product, Category } = require("../models");
const { getToken } = require("next-auth/jwt");

// Helper function to safely parse JSON fields from a product object
const parseProductJSONFields = (productInstance) => {
  // Use .get({ plain: true }) to get a clean data object
  const product = productInstance.get({ plain: true });

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
exports.getWishlist = async (req, res) => {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
    });
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findOne({ where: { user_email: token.email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const wishlistItems = await Wishlist.findAll({
      where: { user_id: user.user_id },
      include: [
        {
          model: Product,
          as: "product",
          where: { product_status: "active" }, 
          include: [{ model: Category, as: "category" }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const responseData = wishlistItems.map((item) => {
      const plainItem = item.toJSON();
      // Pastikan produk ada sebelum di-parse
      if (item.product) {
        plainItem.product = parseProductJSONFields(item.product);
      }
      return plainItem;
    });

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error getting wishlist:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addToWishlist = async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
    });

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findOne({ where: { user_email: token.email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const [wishlistItem, created] = await Wishlist.findOrCreate({
      where: { user_id: user.user_id, product_id: productId },
      defaults: { user_id: user.user_id, product_id: productId },
    });

    if (!created) {
      return res
        .status(409)
        .json({ message: "Product is already in the wishlist" });
    }

    res
      .status(201)
      .json({ message: "Product added to wishlist", wishlistItem });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.removeFromWishlist = async (req, res) => {
  const { productId } = req.params;

  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
    });

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findOne({ where: { user_email: token.email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const destroyed = await Wishlist.destroy({
      where: { user_id: user.user_id, product_id: productId },
    });

    if (destroyed === 0) {
      return res.status(404).json({ message: "Product not found in wishlist" });
    }

    res.status(200).json({ message: "Product removed from wishlist" });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
