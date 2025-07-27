const express = require("express");
const router = express.Router();
const {
  getAllPaymentMethods,
} = require("../controllers/paymentMethodController");

// Endpoint ini akan digunakan oleh frontend untuk menampilkan pilihan pembayaran.
// Karena bersifat publik, tidak memerlukan middleware otentikasi.
router.get("/", getAllPaymentMethods);

// Di sini Anda bisa menambahkan route lain untuk admin di kemudian hari,
// misalnya untuk mengedit biaya admin.

module.exports = router;
