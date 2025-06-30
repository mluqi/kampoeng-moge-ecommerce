"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Addresses extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Addresses.belongsTo(models.User, {
        foreignKey: "address_user",
        as: "user",
      });
    }
  }
  Addresses.init(
    {
      address_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      address_user: DataTypes.INTEGER,
      address_full_name: DataTypes.STRING,
      address_phone: DataTypes.INTEGER,
      address_pincode: DataTypes.STRING,
      address_area: DataTypes.STRING,
      address_city: DataTypes.STRING,
      address_state: DataTypes.STRING,
      address_country: DataTypes.STRING,
      address_label: DataTypes.STRING,
      address_is_default: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Addresses",
      timestamps: false,
    }
  );
  return Addresses;
};
