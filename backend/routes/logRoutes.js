const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getActivityLogs,
  getAccessLogs,
  getApiLogs,
  getAdminsForFilter,
} = require("../controllers/logController");

// Middleware to validate if the user is a superadmin
const validateSuperAdmin = (req, res, next) => {
  // The authMiddleware should have populated req.user with admin details
  // including the email.
  if (req.user && req.user.email === "superadmin@kampoengmoge.com") {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Access denied. Superadmin privilege required." });
  }
};

// Endpoint untuk log aktivitas (CUD)
router.get("/activity", authMiddleware, validateSuperAdmin, getActivityLogs);

// Endpoint untuk log akses (login)
router.get("/access", authMiddleware, validateSuperAdmin, getAccessLogs);

// Endpoint untuk log API
router.get("/api", authMiddleware, validateSuperAdmin, getApiLogs);

// Endpoint untuk mendapatkan daftar admin untuk filter
router.get("/admins", authMiddleware, validateSuperAdmin, getAdminsForFilter);

module.exports = router;
