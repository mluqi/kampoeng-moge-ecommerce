"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Product.belongsTo(models.Category, {
        foreignKey: "product_category",
        as: "category",
      });
    }
  }
  Product.init(
    {
      product_id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING,
      },
      product_name: DataTypes.STRING,
      product_description: DataTypes.TEXT,
      product_sku: DataTypes.STRING,
      product_price: DataTypes.BIGINT,
      product_stock: DataTypes.INTEGER,
      product_min_order: DataTypes.INTEGER,
      product_condition: DataTypes.STRING,
      product_status: DataTypes.STRING,
      product_category: {
        type: DataTypes.STRING,
        references: {
          model: "Categories",
          key: "category_id",
        },
      },
      product_weight: DataTypes.FLOAT,
      product_dimensions: DataTypes.JSON,
      product_pictures: DataTypes.JSON,
      product_wholesale_prices: DataTypes.JSON,
      product_logistics: DataTypes.JSON,
      product_annotations: DataTypes.JSON,
      product_is_must_insurance: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Product",
      tableName: "Products",
    }
  );
  return Product;
};
