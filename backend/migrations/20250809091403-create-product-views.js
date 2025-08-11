"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ProductViews", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      product_id: {
        type: Sequelize.STRING,
        references: {
          model: "Products",
          key: "product_id",
        },
      },
      viewed_at: {
        type: Sequelize.DATE,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "user_id",
        },
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ProductViews");
  },
};
