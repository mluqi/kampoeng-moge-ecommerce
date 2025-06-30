"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("admin_akses", "token", {
      type: Sequelize.TEXT,
      allowNull: true,
      after: "password", // urutkan setelah kolom password (opsional, tergantung DB)
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("admin_akses", "token");
  },
};
