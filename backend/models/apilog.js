"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ApiLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ApiLog.init(
    {
      service_name: DataTypes.ENUM("JNE", "TIKTOK_SHOP", "XENDIT"),
      endpoint: DataTypes.STRING,
      request_payload: DataTypes.TEXT,
      response_payload: DataTypes.TEXT,
      status: DataTypes.ENUM("SUCCESS", "FAILED"),
      error_message: DataTypes.TEXT,
      duration_ms: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "ApiLog",
      tableName: "api_logs",
      timestamps: true,
      updatedAt: false,
    }
  );
  return ApiLog;
};
