"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Order", {
      order_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      total_amount: {
        type: Sequelize.BIGINT,
      },
      subtotal: {
        type: Sequelize.BIGINT,
      },
      discount: {
        type: Sequelize.BIGINT,
      },
      shipping_cost: {
        type: Sequelize.BIGINT,
      },
      payment_method: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.STRING,
      },
      shipping_address: {
        type: Sequelize.TEXT,
      },
      note: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Order");
  },
};
