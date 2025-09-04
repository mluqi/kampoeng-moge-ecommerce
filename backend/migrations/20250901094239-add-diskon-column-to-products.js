"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.removeColumn("Products", "product_wholesale_prices");
    await queryInterface.addColumn("Products", "product_is_discount", {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      after: "product_pictures",
    });
    await queryInterface.addColumn("Products", "product_discount_percentage", {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      after: "product_is_discount",
    });
    await queryInterface.addColumn("Products", "product_discount_price", {
      type: Sequelize.BIGINT,
      allowNull: true,
      defaultValue: 0,
      after: "product_discount_percentage",
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.addColumn("Products", "product_wholesale_prices", {
      type: Sequelize.BIGINT,
      allowNull: true,
      defaultValue: null,
      after: "product_pictures",
    });
    await queryInterface.removeColumn("Products", "product_is_discount");
    await queryInterface.removeColumn(
      "Products",
      "product_discount_percentage"
    );
    await queryInterface.removeColumn("Products", "product_discount_price");
  },
};
