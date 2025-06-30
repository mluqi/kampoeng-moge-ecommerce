const express = require("express");
const router = express.Router();
const passport = require("passport");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  adminSignin,
  adminLogout,
  changePassword,
  resetPassword,
  googleAuthCallback,
  getProfile,
  editProfile,
  addAddress,
  editAddress,
} = require("../controllers/authController");


// Rute ini akan menerima data pengguna dari NextAuth.js setelah Google OAuth
router.post("/google-callback", googleAuthCallback); 
router.get("/profile", getProfile);
router.put("/profile", editProfile);

router.post("/address", addAddress);
router.put("/address", editAddress);

router.post("/admin/signin", adminSignin);
router.post("/admin/logout", authMiddleware, adminLogout);
router.post("/admin/change-password", authMiddleware, changePassword);
router.post("/admin/reset-password", resetPassword);

module.exports = router;
