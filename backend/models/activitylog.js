"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ActivityLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ActivityLog.belongsTo(models.admin_akses, {
        foreignKey: "admin_id",
        as: "admin",
      });
    }
  }
  ActivityLog.init(
    {
      admin_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "admin_akses",
          key: "id",
        },
      },
      admin_name: { type: DataTypes.STRING, allowNull: false },
      action_type: DataTypes.ENUM(
        "CREATE",
        "UPDATE",
        "DELETE",
        "UPDATE_STATUS",
        "APPROVE_CANCELLATION",
        "REJECT_CANCELLATION"
      ),
      entity_type: DataTypes.STRING,
      entity_id: DataTypes.STRING,
      details: DataTypes.TEXT,
      ip_address: DataTypes.STRING,
      user_agent: DataTypes.STRING,
      status: DataTypes.ENUM("SUCCESS", "FAILED"),
    },
    {
      sequelize,
      modelName: "ActivityLog",
      tableName: "activity_logs",
      timestamps: true,
      updatedAt: false,
    }
  );
  return ActivityLog;
};
