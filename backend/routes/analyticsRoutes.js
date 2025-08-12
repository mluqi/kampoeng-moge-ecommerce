const express = require("express");
const router = express.Router();
const {
  getTopProducts,
  getAllCartItems,
  getCartAnalyticsSummary,
} = require("../controllers/analyticsController");
const authMiddleware = require("../middlewares/authMiddleware");

// Endpoint ini bisa bersifat publik atau diproteksi dengan authMiddleware sesuai kebutuhan.
router.get("/top-products", getTopProducts);

// Admin-only routes
router.get("/cart-items", authMiddleware, getAllCartItems);
router.get("/cart-summary", authMiddleware, getCartAnalyticsSummary);

module.exports = router;
