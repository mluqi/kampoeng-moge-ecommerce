const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  adminSignin,
  adminLogout,
  changePassword,
  resetPassword,
  googleAuthCallback,
  getProfile,
  getAdminProfile,
  editProfile,
  addAddress,
  editAddress,
  deleteAddress,
  setDefaultAddress,
} = require("../controllers/authController");

router.post("/google-callback", googleAuthCallback);
router.get("/profile", getProfile);
router.put("/profile", editProfile);

router.post("/address", addAddress);
router.put("/address/:id", editAddress);
router.delete("/address/:id", deleteAddress);
router.patch("/address/:id/default", setDefaultAddress);

router.post("/admin/signin", adminSignin);
router.get("/admin/me", authMiddleware, getAdminProfile);
router.post("/admin/logout", authMiddleware, adminLogout);
router.post("/admin/change-password", authMiddleware, changePassword);
router.post("/admin/reset-password", authMiddleware, resetPassword);

module.exports = router;
