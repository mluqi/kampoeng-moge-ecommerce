"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class login_banner extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  login_banner.init(
    {
      images: DataTypes.TEXT,
      display_order: DataTypes.INTEGER,
      is_active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "login_banner",
      tableName: "login_banners",
      timestamps: false,
    }
  );
  return login_banner;
};
