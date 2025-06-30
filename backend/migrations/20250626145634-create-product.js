'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Products', {
      product_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      product_name: {
        type: Sequelize.STRING
      },
      product_description: {
        type: Sequelize.TEXT
      },
      product_sku: {
        type: Sequelize.STRING
      },
      product_price: {
        type: Sequelize.BIGINT
      },
      product_stock: {
        type: Sequelize.INTEGER
      },
      product_min_order: {
        type: Sequelize.INTEGER
      },
      product_condition: {
        type: Sequelize.STRING
      },
      product_status: {
        type: Sequelize.STRING
      },
      product_category: {
        type: Sequelize.STRING
      },
      product_weight: {
        type: Sequelize.FLOAT
      },
      product_dimensions: {
        type: Sequelize.JSON
      },
      product_pictures: {
        type: Sequelize.JSON
      },
      product_wholesale_prices: {
        type: Sequelize.JSON
      },
      product_logistics: {
        type: Sequelize.JSON
      },
      product_annotations: {
        type: Sequelize.JSON
      },
      product_is_must_insurance: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Products');
  }
};