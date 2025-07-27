const { Peyment_method } = require("../models");

/**
 * @description Mengambil semua metode pembayaran yang aktif untuk ditampilkan di frontend.
 * @route GET /api/payment-methods
 * @access Public
 */
exports.getAllPaymentMethods = async (req, res) => {
  try {
    // Ambil hanya metode pembayaran yang statusnya aktif
    const paymentMethods = await Peyment_method.findAll({
      where: { is_active: true },
      // Pilih hanya kolom yang relevan untuk frontend
      attributes: [
        "wlpay_code",
        "wlpay_nama",
        "wlpay_logo",
        "wlpay_type",
        "admin_fee",
        "transaction_fee_va",
        "transaction_fee_cc",
      ],
      order: [["wlpay_nama", "ASC"]],
    });

    res.status(200).json(paymentMethods);
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    res
      .status(500)
      .json({ message: "Gagal mengambil data metode pembayaran." });
  }
};
