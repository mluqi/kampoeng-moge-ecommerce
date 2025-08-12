const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getOrders,
  createOrder,
  getOrderById,
  cancelOrder,
  getAllOrdersAdmin,
  getOrderByIdAdmin,
  updateOrderStatus,
  approveCancelOrder,
  rejectCancelOrder,
  getTiktokOrders,
  getTiktokOrderById,
} = require("../controllers/orderController");

// --- USER ROUTES ---
router.get("/", getOrders);
router.post("/", createOrder);
router.get("/:id", getOrderById);
router.put("/:id/cancel", cancelOrder);

// --- ADMIN ROUTES ---
router.get("/admin/all", authMiddleware, getAllOrdersAdmin);
router.get("/admin/:id", authMiddleware, getOrderByIdAdmin);
router.put("/admin/:id/status", authMiddleware, updateOrderStatus);

router.put("/admin/:id/approve-cancel", authMiddleware, approveCancelOrder);
router.put("/admin/:id/reject-cancel", authMiddleware, rejectCancelOrder);

// --- ADMIN TIKTOK ROUTES ---
router.post("/admin/tiktok/search", authMiddleware, getTiktokOrders);
router.get("/admin/tiktok/:id", authMiddleware, getTiktokOrderById);

module.exports = router;
