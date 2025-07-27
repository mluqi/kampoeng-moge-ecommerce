const express = require("express");
const router = express.Router();
const { saveInitialToken } = require("../controllers/tiktokController");

// Endpoint untuk menyimpan token awal dari TikTok.
// Diproteksi dengan middleware admin.
router.post("/save-token", saveInitialToken);

module.exports = router;
