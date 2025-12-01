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
      Product.hasMany(models.Wishlist, { foreignKey: "product_id" });
      Product.hasMany(models.CartItem, { foreignKey: "product_id" });
      Product.hasMany(models.Review, {
        foreignKey: "product_id",
        as: "reviews",
      });
      Product.hasMany(models.OrderItem, {
        foreignKey: "product_id",
        as: "product",
      });
      Product.hasMany(models.ProductViews, {
        foreignKey: "product_id",
        as: "views",
      });
      Product.hasMany(models.Message, {
        foreignKey: "product_id",
        as: "messages",
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
      product_price_tiktok: {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: null,
      },
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
      product_tiktok_id: DataTypes.STRING,
      product_tiktok_sku_id: DataTypes.STRING,
      product_categories_tiktok: DataTypes.STRING,
      product_attributes_tiktok: DataTypes.TEXT,
      product_weight: DataTypes.FLOAT,
      product_dimensions: DataTypes.TEXT,
      product_pictures: DataTypes.TEXT,
      product_listing_platforms: DataTypes.TEXT,
      product_is_discount: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      product_discount_percentage: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      product_discount_price: DataTypes.BIGINT,
      product_discount_start_date: DataTypes.DATE,
      product_discount_end_date: DataTypes.DATE,
      product_discount_status: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      product_logistics: DataTypes.TEXT,
      product_annotations: DataTypes.TEXT,
      product_brand: DataTypes.STRING,
      product_average_rating: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: null,
      },
      product_review_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      product_sold: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Product",
      tableName: "Products",
    }
  );
  return Product;
};
