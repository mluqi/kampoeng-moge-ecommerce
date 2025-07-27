"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("OrderItem", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      order_id: {
        type: Sequelize.STRING,
        references: {
          model: "Order",
          key: "order_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      product_id: {
        type: Sequelize.STRING,
        references: {
          model: "Products",
          key: "product_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      product_name: {
        type: Sequelize.STRING,
      },
      price: {
        type: Sequelize.BIGINT,
      },
      quantity: {
        type: Sequelize.INTEGER,
      },
      subtotal: {
        type: Sequelize.BIGINT,
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
    await queryInterface.dropTable("OrderItem");
  },
};
