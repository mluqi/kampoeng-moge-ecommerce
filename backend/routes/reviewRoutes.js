const express = require("express");
const router = express.Router();
const {
  createReview,
  getReviewsForProduct,
  getAllReviews,
  updateReviewStatus,
} = require("../controllers/reviewController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", createReview);
router.get("/product/:productId", getReviewsForProduct);

router.get("/admin/all", authMiddleware, getAllReviews);
router.patch("/admin/:id/status", authMiddleware, updateReviewStatus);

module.exports = router;
