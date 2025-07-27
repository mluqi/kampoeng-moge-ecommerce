'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class promo_banners extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  promo_banners.init({
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    button_text: DataTypes.STRING,
    button_link: DataTypes.STRING,
    image_left_url: DataTypes.STRING,
    image_right_url: DataTypes.STRING,
    image_mobile_url: DataTypes.STRING,
    is_active: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'promo_banners',
  });
  return promo_banners;
};