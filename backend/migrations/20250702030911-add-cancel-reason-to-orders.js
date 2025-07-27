'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Order', 'cancel_reason', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'note',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Order', 'cancel_reason');
  },
};