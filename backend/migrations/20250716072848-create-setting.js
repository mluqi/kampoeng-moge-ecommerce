"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Setting", {
      key: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
      },
      value: {
        type: Sequelize.TEXT,
      },
      group: {
        type: Sequelize.STRING,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Setting");
  },
};
