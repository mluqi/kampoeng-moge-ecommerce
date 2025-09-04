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
    await queryInterface.addColumn("Products", "product_discount_start_date", {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
      after: "product_discount_price",
    });
    await queryInterface.addColumn("Products", "product_discount_end_date", {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
      after: "product_discount_start_date",
    });
    await queryInterface.addColumn("Products", "product_discount_status", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      after: "product_discount_end_date",
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn(
      "Products",
      "product_discount_start_date"
    );
    await queryInterface.removeColumn("Products", "product_discount_end_date");
    await queryInterface.removeColumn("Products", "product_discount_status");
  },
};
