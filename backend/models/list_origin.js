'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class list_origin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  list_origin.init({
    origin_code: DataTypes.STRING,
    origin_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'list_origin',
    tableName: 'list_origins',
    timestamps: false,
  });
  return list_origin;
};