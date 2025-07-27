"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Peyment_method",
      [
        {
          wlpay_code: "BRI",
          wlpay_nama: "VA BRI",
          wlpay_logo: "VA_BRI.svg",
          wlpay_type: "virtual",
          wlpay_merchant: "xendit",
          admin_fee: 0.0,
          transaction_fee_cc: 0.0,
          transaction_fee_va: 0.0,
          is_active: true,
        },
        {
          wlpay_code: "BNI",
          wlpay_nama: "VA BNI",
          wlpay_logo: "VA_BNI.svg",
          wlpay_type: "virtual",
          wlpay_merchant: "xendit",
          admin_fee: 0.0,
          transaction_fee_cc: 0.0,
          transaction_fee_va: 0.0,
          is_active: true,
        },
        {
          wlpay_code: "MANDIRI",
          wlpay_nama: "VA MANDIRI",
          wlpay_logo: "VA_MANDIRI.svg",
          wlpay_type: "virtual",
          wlpay_merchant: "xendit",
          admin_fee: 0.0,
          transaction_fee_cc: 0.0,
          transaction_fee_va: 0.0,
          is_active: true,
        },
        {
          wlpay_code: "BJB",
          wlpay_nama: "VA BJB",
          wlpay_logo: "VA_BJB.svg",
          wlpay_type: "virtual",
          wlpay_merchant: "xendit",
          admin_fee: 0.0,
          transaction_fee_cc: 0.0,
          transaction_fee_va: 0.0,
          is_active: true,
        },
        {
          wlpay_code: "PERMATA",
          wlpay_nama: "VA PERMATA",
          wlpay_logo: "VA_PERMATA.svg",
          wlpay_type: "virtual",
          wlpay_merchant: "xendit",
          admin_fee: 0.0,
          transaction_fee_cc: 0.0,
          transaction_fee_va: 0.0,
          is_active: true,
        },
        {
          wlpay_code: "BSI",
          wlpay_nama: "VA BSI",
          wlpay_logo: "VA_BSI.svg",
          wlpay_type: "virtual",
          wlpay_merchant: "xendit",
          admin_fee: 0.0,
          transaction_fee_cc: 0.0,
          transaction_fee_va: 0.0,
          is_active: true,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "Peyment_method",
      {
        wlpay_code: {
          [Sequelize.Op.in]: ["BRI", "BNI", "MANDIRI", "BJB", "PERMATA", "BSI"],
        },
      },
      {}
    );
  },
};
