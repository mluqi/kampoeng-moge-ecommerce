"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ProductViews extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ProductViews.belongsTo(models.Product, {
        foreignKey: "product_id",
        as: "Product",
      });
      ProductViews.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "User",
      });
    }
  }
  ProductViews.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      product_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "Products",
          key: "product_id",
        },
      },
      viewed_at: DataTypes.DATE,
      user_id: DataTypes.INTEGER, 
    },
    {
      sequelize,
      modelName: "ProductViews",
      tableName: "ProductViews",
      timestamps: false,
    }
  );
  return ProductViews;
};
