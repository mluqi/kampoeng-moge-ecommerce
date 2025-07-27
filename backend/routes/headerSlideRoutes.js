const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const {
  getActiveHeaderSlides,
  getAllHeaderSlides,
  createHeaderSlide,
  updateHeaderSlide,
  deleteHeaderSlide,
} = require("../controllers/headerSlideController");
const authMiddleware = require("../middlewares/authMiddleware");

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = "uploads/slides";
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
router.get("/", getActiveHeaderSlides);

// --- Admin Routes ---
router.get("/all", authMiddleware, getAllHeaderSlides);
router.post("/", authMiddleware, upload.single("image"), createHeaderSlide);
router.put("/:id", authMiddleware, upload.single("image"), updateHeaderSlide);
router.delete("/:id", authMiddleware, deleteHeaderSlide);

module.exports = router;
