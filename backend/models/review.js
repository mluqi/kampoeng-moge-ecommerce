"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Review.belongsTo(models.OrderItem, {
        foreignKey: "order_item_id",
        as: "orderItem",
      });
      Review.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
      Review.belongsTo(models.Product, {
        foreignKey: "product_id",
        as: "product",
      });
    }
  }
  Review.init(
    {
      order_item_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
      product_id: DataTypes.STRING,
      rating: DataTypes.INTEGER,
      comment: DataTypes.TEXT,
      status: {
        type: DataTypes.ENUM("show", "hide"),
        defaultValue: "show",
      },
    },
    {
      sequelize,
      modelName: "Review",
      tableName: "Reviews",
      timestamps: true,
    }
  );
  return Review;
};
