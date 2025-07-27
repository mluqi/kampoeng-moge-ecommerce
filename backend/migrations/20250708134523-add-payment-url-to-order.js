"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.addColumn("Order", "payment_invoice_url", {
      type: Sequelize.STRING,
      allowNull: true,
      after: "payment_invoice_id",
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn("Order", "payment_invoice_url");
  },
};
