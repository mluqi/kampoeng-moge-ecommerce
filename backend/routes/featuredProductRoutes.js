const express = require("express");
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const {
  getActiveFeaturedProducts,
  getAllFeaturedProducts,
  createFeaturedProduct,
  updateFeaturedProduct,
  deleteFeaturedProduct,
} = require("../controllers/featuredProductController");
const authMiddleware = require("../middlewares/authMiddleware");

// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = 'uploads/featured';
        fs.mkdirSync(dest, { recursive: true }); // Pastikan direktori ada
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

// --- Public Route ---
router.get("/", getActiveFeaturedProducts);

// --- Admin Routes ---
router.get("/all", authMiddleware, getAllFeaturedProducts);
router.post("/", authMiddleware, upload.single('image'), createFeaturedProduct);
router.put("/:id", authMiddleware, upload.single('image'), updateFeaturedProduct);
router.delete("/:id", authMiddleware, deleteFeaturedProduct);

module.exports = router;
