const express = require("express");
const router = express.Router();
const { handleXenditWebhook } = require("../controllers/paymentController");

router.post("/webhook", handleXenditWebhook);

module.exports = router;
