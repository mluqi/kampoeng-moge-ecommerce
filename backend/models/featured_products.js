'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class featured_products extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  featured_products.init({
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    image_url: DataTypes.TEXT,
    button_text: DataTypes.STRING,
    button_link: DataTypes.STRING,
    display_order: DataTypes.INTEGER,
    is_active: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'featured_products',
  });
  return featured_products;
};