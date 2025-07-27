const { CartItem, User, Product, Category } = require("../models");
const { getToken } = require("next-auth/jwt");

// Helper untuk mendapatkan user dari token dengan aman
const getUserFromToken = async (req) => {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });
  if (!token || !token.email) return null;
  return await User.findOne({ where: { user_email: token.email } });
};

exports.getCart = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const cartItems = await CartItem.findAll({
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

    res.status(200).json(cartItems);
  } catch (error) {
    console.error("Error getting cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  try {
    const user = await getUserFromToken(req);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Cek stok sebelum menambah ke keranjang
    if (product.product_stock < quantity) {
      return res.status(400).json({ message: "Stok produk tidak mencukupi." });
    }

    const [cartItem, created] = await CartItem.findOrCreate({
      where: { user_id: user.user_id, product_id: productId },
      defaults: { user_id: user.user_id, product_id: productId, quantity },
    });

    if (!created) {
      // Jika item sudah ada, cek stok sebelum menambah kuantitas
      if (product.product_stock < cartItem.quantity + quantity) {
        return res
          .status(400)
          .json({ message: "Stok produk tidak mencukupi." });
      }
      // Jika item sudah ada, tambahkan kuantitasnya
      cartItem.quantity += quantity;
      await cartItem.save();
    }

    res.status(201).json({ message: "Product added to cart", cartItem });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateCartItem = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (typeof quantity !== "number" || quantity < 0) {
    return res.status(400).json({ message: "Invalid quantity" });
  }

  try {
    const user = await getUserFromToken(req);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    // Ambil produk untuk cek stok
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan." });
    }

    if (quantity > product.product_stock) {
      return res
        .status(400)
        .json({ message: `Stok hanya tersisa ${product.product_stock}.` });
    }

    if (quantity === 0) {
      // Jika kuantitas 0, hapus item dari keranjang
      await CartItem.destroy({
        where: { user_id: user.user_id, product_id: productId },
      });
      return res.status(200).json({ message: "Product removed from cart" });
    } else {
      const [updated] = await CartItem.update(
        { quantity },
        { where: { user_id: user.user_id, product_id: productId } }
      );

      if (updated) {
        return res.status(200).json({ message: "Cart updated successfully" });
      }
      return res.status(404).json({ message: "Item not found in cart" });
    }
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.removeFromCart = async (req, res) => {
  const { productId } = req.params;

  try {
    const user = await getUserFromToken(req);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const destroyed = await CartItem.destroy({
      where: { user_id: user.user_id, product_id: productId },
    });

    if (!destroyed) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    res.status(200).json({ message: "Product removed from cart" });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    await CartItem.destroy({
      where: { user_id: user.user_id },
    });

    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
