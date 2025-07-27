"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("list_dest", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      COUNTRY_NAME: {
        type: Sequelize.STRING,
      },
      PROVINCE_NAME: {
        type: Sequelize.STRING,
      },
      CITY_NAME: {
        type: Sequelize.STRING,
      },
      DISTRICT_NAME: {
        type: Sequelize.STRING,
      },
      SUBDISTRICT_NAME: {
        type: Sequelize.STRING,
      },
      ZIP_CODE: {
        type: Sequelize.STRING,
      },
      TARIFF_CODE: {
        type: Sequelize.STRING,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("list_dest");
  },
};
