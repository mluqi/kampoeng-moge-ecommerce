"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Addresses", {
      address_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      address_user: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      address_full_name: {
        type: Sequelize.STRING,
      },
      address_phone: {
        type: Sequelize.STRING,
      },
      address_pincode: {
        type: Sequelize.INTEGER,
      },
      address_area: {
        type: Sequelize.TEXT,
      },
      address_city: {
        type: Sequelize.STRING,
      },
      address_state: {
        type: Sequelize.STRING,
      },
      address_country: {
        type: Sequelize.STRING,
      },
      address_label: {
        type: Sequelize.STRING,
      },
      address_is_default: {
        type: Sequelize.BOOLEAN,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Addresses");
  },
};
