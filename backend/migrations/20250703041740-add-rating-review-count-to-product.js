"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Products", "product_average_rating", {
      type: Sequelize.DECIMAL(3, 2),
      allowNull: true,
      defaultValue: null,
      after: "product_brand",
    });
    await queryInterface.addColumn("Products", "product_review_count", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      after: "product_average_rating",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Products", "product_average_rating");
    await queryInterface.removeColumn("Products", "product_review_count");
  },
};
