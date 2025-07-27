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
    title: DataTypes.STRING,
    offer_text: DataTypes.STRING,
    image_url: DataTypes.TEXT,
    button1_text: DataTypes.STRING,
    button1_link: DataTypes.STRING,
    button2_text: DataTypes.STRING,
    button2_link: DataTypes.STRING,
    display_order: DataTypes.INTEGER,
    is_active: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'header_slides',
  });
  return header_slides;
};