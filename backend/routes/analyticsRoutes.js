const express = require("express");
const router = express.Router();
const { getTopProducts } = require("../controllers/analyticsController");

// Endpoint ini bisa bersifat publik atau diproteksi dengan authMiddleware sesuai kebutuhan.
router.get("/top-products", getTopProducts);

module.exports = router;
