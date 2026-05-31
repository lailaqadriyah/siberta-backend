'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('pengajuan', 'tema', {
      type: Sequelize.STRING(16),
      allowNull: true,
      after: 'abstract'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('pengajuan', 'tema');
  }
};
