const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const {
  getActiveLoginBanners,
  getAllLoginBanners,
  createLoginBanner,
  updateLoginBanner,
  deleteLoginBanner,
} = require("../controllers/loginBannerController");
const authMiddleware = require("../middlewares/authMiddleware");

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = "uploads/login_banners";
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage: storage });

// --- Public Route ---
router.get("/", getActiveLoginBanners);

// --- Admin Routes ---
router.get("/all", authMiddleware, getAllLoginBanners);
router.post("/", authMiddleware, upload.single("image"), createLoginBanner);
router.put("/:id", authMiddleware, upload.single("image"), updateLoginBanner);
router.delete("/:id", authMiddleware, deleteLoginBanner);

module.exports = router;
