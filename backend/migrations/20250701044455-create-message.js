"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Message", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      conversationId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Conversation",
          key: "id",
        },
      },
      senderId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "user_id",
        },
      },
      content: {
        type: Sequelize.TEXT,
      },
      isRead: {
        type: Sequelize.BOOLEAN,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Message");
  },
};
