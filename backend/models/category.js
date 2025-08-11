"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Category.hasMany(models.Product, {
        foreignKey: "product_category",
        as: "products",
      });
    }
  }
  Category.init(
    {
      category_id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING,
      },
      category_name: DataTypes.STRING,
      category_image: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Category",
      tableName: "Categories",
      timestamps: false,
    }
  );
  return Category;
};
