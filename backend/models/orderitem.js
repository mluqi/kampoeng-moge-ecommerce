"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      OrderItem.belongsTo(models.Order, { foreignKey: "order_id" });
      OrderItem.belongsTo(models.Product, { foreignKey: "product_id", as: "product" });
      OrderItem.hasOne(models.Review, { foreignKey: "order_item_id", as: "reviews" });
    }
  }
  OrderItem.init(
    {
      order_id: {
        type: DataTypes.STRING,
        references: {
          model: "Order",
          key: "order_id",
        },
      },
      product_id: {
        type: DataTypes.STRING,
        references: {
          model: "Products",
          key: "product_id",
        },
      },
      product_name: DataTypes.STRING,
      price: DataTypes.BIGINT,
      quantity: DataTypes.INTEGER,
      subtotal: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: "OrderItem",
      tableName: "OrderItem",
    }
  );
  return OrderItem;
};
