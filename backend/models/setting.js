"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Setting extends Model {
    static associate(models) {
      // define association here
    }
  }
  Setting.init(
    {
      key: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      value: DataTypes.TEXT,
      group: DataTypes.STRING,
    },
    { sequelize, modelName: "Setting", tableName: "Setting", timestamps: false }
  );
  return Setting;
};
