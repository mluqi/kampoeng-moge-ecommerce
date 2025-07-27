'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class integration_tokens extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  integration_tokens.init({
    shop_cipher: DataTypes.STRING,
    access_token: DataTypes.STRING,
    refresh_token: DataTypes.STRING,
    expires_at: DataTypes.DATE,
    refresh_expires_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'integration_tokens',
  });
  return integration_tokens;
};