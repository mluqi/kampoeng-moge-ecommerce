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
    await queryInterface.addColumn("Products", "product_categories_tiktok", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
      after: "product_category",
    });
    await queryInterface.addColumn("Products", "product_attributes_tiktok", {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: null,
      after: "product_categories_tiktok",
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("Products", "product_categories_tiktok");
    await queryInterface.removeColumn("Products", "product_attributes_tiktok");
  },
};
