'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'email', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    await queryInterface.addColumn('users', 'nim', {
      type: Sequelize.STRING(50),
      allowNull: true
    });

    await queryInterface.addColumn('users', 'prodi', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    await queryInterface.addColumn('users', 'angkatan', {
      type: Sequelize.STRING(10),
      allowNull: true
    });

    await queryInterface.addColumn('users', 'pembimbing', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    await queryInterface.addColumn('users', 'status', {
      type: Sequelize.STRING(50),
      allowNull: true
    });

    await queryInterface.addColumn('users', 'avatar', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'avatar');
    await queryInterface.removeColumn('users', 'status');
    await queryInterface.removeColumn('users', 'pembimbing');
    await queryInterface.removeColumn('users', 'angkatan');
    await queryInterface.removeColumn('users', 'prodi');
    await queryInterface.removeColumn('users', 'nim');
    await queryInterface.removeColumn('users', 'email');
  }
};
