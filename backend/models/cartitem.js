"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CartItem.belongsTo(models.User, { foreignKey: "user_id" });
      CartItem.belongsTo(models.Product, {
        foreignKey: "product_id",
        as: "product",
      });
    }
  }
  CartItem.init(
    {
      user_id: DataTypes.INTEGER,
      product_id: DataTypes.STRING,
      quantity: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "CartItem",
      tableName: "CartItem",
    }
  );
  return CartItem;
};
