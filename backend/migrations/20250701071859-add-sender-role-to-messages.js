"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Message", "sender_role", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "user",
      after: "senderId",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Message", "sender_role");
  },
};
