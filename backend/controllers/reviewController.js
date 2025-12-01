const {
  Review,
  OrderItem,
  Order,
  Product,
  User,
  sequelize,
} = require("../models");
const { getToken } = require("next-auth/jwt");
const { createActivityLog } = require("../services/logService");

const getUserFromToken = async (req) => {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });
  if (!token || !token.email) return null;
  return await User.findOne({ where: { user_email: token.email } });
};

// Helper to update product's average rating
const updateProductRating = async (productId, transaction) => {
  const result = await Review.findOne({
    where: { product_id: productId },
    attributes: [
      [sequelize.fn("AVG", sequelize.col("rating")), "averageRating"],
      [sequelize.fn("COUNT", sequelize.col("id")), "reviewCount"],
    ],
    raw: true,
    transaction,
  });

  await Product.update(
    {
      product_average_rating: parseFloat(result.averageRating) || 0,
      product_review_count: parseInt(result.reviewCount, 10) || 0,
    },
    { where: { product_id: productId }, transaction }
  );
};

exports.createReview = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      await t.rollback();
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { order_item_id, rating, comment } = req.body;

    const orderItem = await OrderItem.findOne({
      where: { id: order_item_id },
      include: [{ model: Order, where: { user_id: user.user_id } }],
      transaction: t,
    });

    if (!orderItem) {
      await t.rollback();
      return res.status(404).json({ message: "Item pesanan tidak ditemukan." });
    }

    if (orderItem.Order.status !== "completed") {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Hanya pesanan yang selesai bisa diberi ulasan." });
    }

    const existingReview = await Review.findOne({
      where: { order_item_id },
      transaction: t,
    });
    if (existingReview) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Anda sudah memberi ulasan untuk item ini." });
    }

    const newReview = await Review.create(
      {
        user_id: user.user_id,
        product_id: orderItem.product_id,
        order_item_id,
        rating,
        comment,
      },
      { transaction: t }
    );

    await updateProductRating(orderItem.product_id, t);

    await t.commit();
    res.status(201).json({
      message: "Ulasan berhasil ditambahkan.",
      review: newReview.get({ plain: true }),
    });
  } catch (error) {
    await t.rollback();
    console.error("Error creating review:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getReviewsForProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.findAll({
      where: { product_id: productId, status: "show" },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_name", "user_photo"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error getting reviews for product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ADMIN FUNCTIONS

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_name", "user_photo"],
        },
        {
          model: Product,
          as: "product",
          attributes: ["product_name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error getting all reviews:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateReviewStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !["show", "hide"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value." });
  }

  try {
    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    const oldStatus = review.status;
    review.status = status;
    await review.save();

    // Update product rating after changing review status
    await updateProductRating(review.product_id);

    if (oldStatus !== status) {
      await createActivityLog(
        req,
        req.user,
        "UPDATE_STATUS",
        { type: "Review", id: id },
        { before: oldStatus, after: status }
      );
    }

    res.status(200).json({ message: "Review status updated successfully." });
  } catch (error) {
    console.error("Error updating review status:", error);
    await createActivityLog(
      req,
      req.user,
      "UPDATE_STATUS",
      { type: "Review", id: id },
      { error: error.message, attemptedChange: { status } },
      "FAILED"
    );
    res.status(500).json({ message: "Internal server error" });
  }
};
