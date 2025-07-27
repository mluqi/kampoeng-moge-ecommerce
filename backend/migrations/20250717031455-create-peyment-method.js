"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Peyment_method", {
      wlpay_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      wlpay_code: {
        type: Sequelize.STRING,
      },
      wlpay_nama: {
        type: Sequelize.STRING,
      },
      wlpay_logo: {
        type: Sequelize.TEXT,
      },
      wlpay_type: {
        type: Sequelize.STRING,
      },
      wlpay_merchant: {
        type: Sequelize.STRING,
      },
      admin_fee: {
        type: Sequelize.DOUBLE,
      },
      transaction_fee_cc: {
        type: Sequelize.DOUBLE,
      },
      transaction_fee_va: {
        type: Sequelize.DOUBLE,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Peyment_method");
  },
};
