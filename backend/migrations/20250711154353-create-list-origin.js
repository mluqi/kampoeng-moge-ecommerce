"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("list_origins", {
      origin_code: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      origin_name: {
        type: Sequelize.STRING,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("list_origins");
  },
};
