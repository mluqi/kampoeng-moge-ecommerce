const express = require("express");
const router = express.Router();
const {
  getShippingRates,
  generateAwbForOrder,
  trackOrder,
  trackByAwb,
} = require("../controllers/shippingController");

router.post("/rates", getShippingRates);
router.post("/awb", generateAwbForOrder);
router.get("/track-awb/:awb", trackByAwb); 
router.post("/track/:orderId", trackOrder);

module.exports = router;
