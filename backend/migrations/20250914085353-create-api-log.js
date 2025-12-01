'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('api_logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      service_name: {
        type: Sequelize.ENUM('JNE', 'TIKTOK_SHOP')
      },
      endpoint: {
        type: Sequelize.STRING
      },
      request_payload: {
        type: Sequelize.TEXT
      },
      response_payload: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.ENUM('SUCCESS', 'FAILED')
      },
      error_message: {
        type: Sequelize.TEXT
      },
      duration_ms: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('api_logs');
  }
};