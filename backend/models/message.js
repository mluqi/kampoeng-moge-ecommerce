"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Message.belongsTo(models.Conversation, { foreignKey: "conversationId" });
      Message.belongsTo(models.User, { foreignKey: "senderId", as: "sender" });
      Message.belongsTo(models.Product, { foreignKey: "product_id", as: "product" });
    }
  }
  Message.init(
    {
      conversationId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Conversation",
          key: "id",
        },
      },
      senderId: { type: DataTypes.INTEGER, allowNull: false },
      sender_role: { type: DataTypes.STRING, allowNull: false },
      content: { type: DataTypes.TEXT, allowNull: false },
      image_url: { type: DataTypes.TEXT, allowNull: true },
      product_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: { model: "Product", key: "product_id" },
      },
      isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      sequelize,
      modelName: "Message",
      tableName: "Message",
    }
  );
  return Message;
};
