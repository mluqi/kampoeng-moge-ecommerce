const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { getStats, getSalesChartData } = require("../controllers/dashboardController");

router.get("/stats", authMiddleware, getStats);

router.get("/sales-chart", authMiddleware, getSalesChartData);

module.exports = router;
