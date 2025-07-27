"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename column
    await queryInterface.renameColumn(
      "Products",
      "product_is_must_insurance",
      "product_brand"
    );
    // Change type to STRING
    await queryInterface.changeColumn("Products", "product_brand", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Change type back to BOOLEAN (or your previous type)
    await queryInterface.changeColumn("Products", "product_brand", {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    });
    // Rename column back
    await queryInterface.renameColumn(
      "Products",
      "product_brand",
      "product_is_must_insurance"
    );
  },
};
