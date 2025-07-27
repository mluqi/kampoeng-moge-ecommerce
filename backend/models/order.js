"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: "user_id" });
      Order.hasMany(models.OrderItem, { foreignKey: "order_id", as: "items" });
    }
  }
  Order.init(
    {
      order_id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING,
      },
      user_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "Users",
          key: "user_id",
        },
      },
      total_amount: DataTypes.DOUBLE,
      subtotal: DataTypes.DOUBLE,
      order_fee: DataTypes.DOUBLE,
      transaction_fee: DataTypes.DOUBLE,
      app_fee: DataTypes.DOUBLE,
      tenor: DataTypes.INTEGER,
      discount: DataTypes.DOUBLE,
      shipping_cost: DataTypes.DOUBLE,
      shipping_method: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "jne",
      },
      shipping_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      payment_method: DataTypes.STRING,
      status: DataTypes.STRING,
      shipping_address: DataTypes.TEXT,
      payment_invoice_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      payment_invoice_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      note: DataTypes.TEXT,
      cancel_reason: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Order",
      tableName: "Order",
    }
  );
  return Order;
};
