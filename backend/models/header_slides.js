'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class header_slides extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  header_slides.init({
    link: DataTypes.TEXT,
    image_url_desktop: DataTypes.TEXT,
    image_url_mobile: DataTypes.TEXT,
    display_order: DataTypes.INTEGER,
    is_active: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'header_slides',
  });
  return header_slides;
};