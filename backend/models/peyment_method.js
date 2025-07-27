"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Peyment_method extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Peyment_method.init(
    {
      wlpay_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      wlpay_code: DataTypes.STRING,
      wlpay_nama: DataTypes.STRING,
      wlpay_logo: DataTypes.TEXT,
      wlpay_type: DataTypes.STRING,
      wlpay_merchant: DataTypes.STRING,
      admin_fee: DataTypes.DOUBLE,
      transaction_fee_cc: DataTypes.DOUBLE,
      transaction_fee_va: DataTypes.DOUBLE,
      is_active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Peyment_method",
      tableName: "Peyment_method",
      timestamps: false,
    }
  );
  return Peyment_method;
};
