const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { getAllSettings, updateSettings, updateActiveShippingServices, getSettingByKey } = require("../controllers/settingController");

// Endpoint untuk mengambil pengaturan (bisa juga dibuat publik jika perlu)
router.get("/:key", getSettingByKey);
router.get("/", getAllSettings);

// Endpoint khusus admin untuk memperbarui pengaturan
router.put("/", authMiddleware, updateSettings);

module.exports = router;

// Route untuk update service JNE yang ditampilkan
router.put("/shipping-services", authMiddleware, updateActiveShippingServices);
