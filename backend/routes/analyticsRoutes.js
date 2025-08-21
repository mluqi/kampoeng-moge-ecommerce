const express = require("express");
const router = express.Router();
const {
  getTopProducts,
  getProductViewers,
  getProductCartAdds,
} = require("../controllers/analyticsController");
const authMiddleware = require("../middlewares/authMiddleware");

// Endpoint ini bisa bersifat publik atau diproteksi dengan authMiddleware sesuai kebutuhan.
// Untuk admin panel, sebaiknya diproteksi.
router.get("/top-products", authMiddleware, getTopProducts);

// Admin-only routes untuk detail akordeon
router.get(
  "/top-products/:productId/viewers",
  authMiddleware,
  getProductViewers
);
router.get(
  "/top-products/:productId/cart-adds",
  authMiddleware,
  getProductCartAdds
);

module.exports = router;
