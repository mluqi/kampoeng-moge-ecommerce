"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Addresses, {
        foreignKey: "address_user",
        as: "addresses",
      });
      User.hasMany(models.Wishlist, { foreignKey: "user_id" });
      User.hasMany(models.CartItem, { foreignKey: "user_id" });
      User.hasMany(models.Order, { foreignKey: "user_id" });
      User.hasMany(models.Review, { foreignKey: "user_id", as: "reviews" });
    }
  }
  User.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_name: DataTypes.STRING,
      user_email: DataTypes.STRING,
      user_google_id: DataTypes.STRING,
      user_photo: DataTypes.STRING,
      user_address: DataTypes.STRING,
      user_phone: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users",
    }
  );
  return User;
};
