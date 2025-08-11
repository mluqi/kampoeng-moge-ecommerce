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
    // Simpan gambar ke subdirektori yang sesuai berdasarkan fieldname
    const dest = path.join("uploads/slides", file.fieldname);
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      // Gunakan timestamp unik untuk nama file untuk menghindari konflik
      `${Date.now()}-${file.originalname.replace(/\s/g, "_")}`
    );
  },
});

const upload = multer({ storage: storage }).fields([
  { name: "image_desktop", maxCount: 1 },
  { name: "image_mobile", maxCount: 1 },
]);

// --- Public Route ---
router.get("/", getActiveHeaderSlides);

// --- Admin Routes ---
router.get("/all", authMiddleware, getAllHeaderSlides);
router.post("/", authMiddleware, upload, createHeaderSlide);
router.put("/:id", authMiddleware, upload, updateHeaderSlide);
router.delete("/:id", authMiddleware, deleteHeaderSlide);

module.exports = router;
