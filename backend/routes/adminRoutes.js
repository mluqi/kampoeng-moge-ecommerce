const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdminInfo,
  updateAdminPassword,
  deleteAdmin,
} = require("../controllers/adminController");

//validate only user with email superadmin@kampoengmoge.com can access
const validateSuperAdmin = (req, res, next) => {
  if (req.user && req.user.email === "superadmin@kampoengmoge.com") {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Access denied. Superadmin privilege required." });
  }
};

router.get("/", authMiddleware, validateSuperAdmin, getAllAdmins);
router.get("/:id", authMiddleware, validateSuperAdmin, getAdminById);
router.post("/", authMiddleware, validateSuperAdmin, createAdmin);
router.put("/:id", authMiddleware, validateSuperAdmin, updateAdminInfo);
router.put(
  "/:id/password",
  authMiddleware,
  validateSuperAdmin,
  updateAdminPassword
);
router.delete("/:id", authMiddleware, validateSuperAdmin, deleteAdmin);

module.exports = router;
