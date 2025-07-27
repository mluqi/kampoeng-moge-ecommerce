const express = require("express");
const router = express.Router();
const {
  getShippingRates,
  generateAwbForOrder,
  trackOrder,
} = require("../controllers/shippingController");

router.post("/rates", getShippingRates);
router.post("/awb", generateAwbForOrder);
router.post("/track/:orderId", trackOrder);

module.exports = router;
