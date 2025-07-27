"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class list_dest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      
    }
  }
  list_dest.init(
    {
      COUNTRY_NAME: DataTypes.STRING,
      PROVINCE_NAME: DataTypes.STRING,
      CITY_NAME: DataTypes.STRING,
      DISTRICT_NAME: DataTypes.STRING,
      SUBDISTRICT_NAME: DataTypes.STRING,
      ZIP_CODE: DataTypes.STRING,
      TARIFF_CODE: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "list_dest",
      tableName: "list_dest",
      timestamps: false,
    }
  );
  return list_dest;
};
