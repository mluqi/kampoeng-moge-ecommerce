'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class site_content extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  site_content.init({
    content_key: DataTypes.STRING,
    content_title: DataTypes.STRING,
    content_value: DataTypes.TEXT,
    description: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'site_content',
    tableName: 'site_contents',
  });
  return site_content;
};