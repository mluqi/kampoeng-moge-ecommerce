"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.addColumn("Order", "payment_invoice_id", {
      type: Sequelize.STRING,
      allowNull: true,
      after: "shipping_address",
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn("Order", "payment_invoice_id");
  },
};
