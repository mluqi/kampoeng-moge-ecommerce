const express = require("express");
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const {
    getActiveBanner,
    getAllBanners,
    createBanner,
    updateBanner,
    deleteBanner
} = require("../controllers/promoBannerController");
const authMiddleware = require("../middlewares/authMiddleware");

// Multer setup for banner image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = 'uploads/banners';
        fs.mkdirSync(dest, { recursive: true });
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

// --- Public Route ---
router.get("/", getActiveBanner);

// --- Admin Routes ---
router.get("/all", authMiddleware, getAllBanners);
router.post("/", authMiddleware, upload.fields([
    { name: 'image_left', maxCount: 1 },
    { name: 'image_right', maxCount: 1 },
    { name: 'image_mobile', maxCount: 1 }
]), createBanner);
router.put("/:id", authMiddleware, upload.fields([
    { name: 'image_left', maxCount: 1 },
    { name: 'image_right', maxCount: 1 },
    { name: 'image_mobile', maxCount: 1 }
]), updateBanner);
router.delete("/:id", authMiddleware, deleteBanner);

module.exports = router;
