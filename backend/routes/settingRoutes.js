const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getAllSettings,
  updateSettings,
  updateActiveShippingServices,
  updateCategoryColour,
  getSettingByKey,
} = require("../controllers/settingController");
const multer = require("multer");
const fs = require("fs");

const settingStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = "uploads/settings";
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, "_")}`);
  },
});
const uploadLogo = multer({ storage: settingStorage });

router.get("/:key", getSettingByKey);
router.get("/", getAllSettings);
router.put("/", authMiddleware, uploadLogo.single("logo"), updateSettings);

router.put("/shipping-services", authMiddleware, updateActiveShippingServices);
router.put("/category-colour", authMiddleware, updateCategoryColour)

module.exports = router;
