"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.removeColumn("header_slides", "title");
    await queryInterface.removeColumn("header_slides", "offer_text");
    await queryInterface.removeColumn("header_slides", "image_url");
    await queryInterface.removeColumn("header_slides", "button1_text");
    await queryInterface.removeColumn("header_slides", "button1_link");
    await queryInterface.removeColumn("header_slides", "button2_text");
    await queryInterface.removeColumn("header_slides", "button2_link");

    await queryInterface.addColumn("header_slides", "link", {
      type: Sequelize.STRING,
      allowNull: true,
      after: "id",
    });

    await queryInterface.addColumn("header_slides", "image_url_desktop", {
      type: Sequelize.TEXT,
      allowNull: true,
      after: "link",
    });

    await queryInterface.addColumn("header_slides", "image_url_mobile", {
      type: Sequelize.TEXT,
      allowNull: true,
      after: "image_url_desktop",
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("header_slides", "link");
    await queryInterface.removeColumn("header_slides", "image_url_desktop");
    await queryInterface.removeColumn("header_slides", "image_url_mobile");

    await queryInterface.addColumn("header_slides", "title", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("header_slides", "offer_text", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("header_slides", "image_url", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn("header_slides", "button1_text", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("header_slides", "button1_link", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("header_slides", "button2_text", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("header_slides", "button2_link", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
