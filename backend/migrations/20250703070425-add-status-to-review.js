"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Reviews", "status", {
      type: Sequelize.ENUM("show", "hide"),
      defaultValue: "show",
      after: "comment",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Reviews", "status");
  },
};
