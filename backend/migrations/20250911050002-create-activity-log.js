"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("activity_logs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      admin_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "admin_akses",
          key: "id",
        },
      },
      admin_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      action_type: {
        type: Sequelize.ENUM(
          "CREATE",
          "UPDATE",
          "DELETE",
          "UPDATE_STATUS",
          "APPROVE_CANCELLATION",
          "REJECT_CANCELLATION"
        ),
      },
      entity_type: {
        type: Sequelize.STRING,
      },
      entity_id: {
        type: Sequelize.STRING,
      },
      details: {
        type: Sequelize.TEXT,
      },
      ip_address: {
        type: Sequelize.STRING,
      },
      user_agent: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("activity_logs");
  },
};
