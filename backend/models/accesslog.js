"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AccessLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      AccessLog.belongsTo(models.admin_akses, {
        foreignKey: "admin_id",
        as: "admin",
      });
    }
  }
  AccessLog.init(
    {
      admin_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "admin_akses",
          key: "id",
        },
      },
      email: { type: DataTypes.STRING, allowNull: false },
      ip_address: DataTypes.STRING,
      user_agent: DataTypes.STRING,
      status: DataTypes.ENUM("SUCCESS", "FAILED"),
    },
    {
      sequelize,
      modelName: "AccessLog",
      tableName: "access_logs",
      timestamps: true,
      updatedAt: false,
    }
  );
  return AccessLog;
};
