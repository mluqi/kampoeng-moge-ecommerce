"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Wishlist extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Wishlist.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
      Wishlist.belongsTo(models.Product, { foreignKey: "product_id", as: "product" });
    }
  }
  Wishlist.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "Users",
          key: "user_id",
        },
      },
      product_id: {
        type: DataTypes.STRING,
        references: {
          model: "Products",
          key: "product_id",
        },
      },
    },
    {
      sequelize,
      modelName: "Wishlist",
      tableName: "Wishlist",
    }
  );
  return Wishlist;
};
