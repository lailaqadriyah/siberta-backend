'use strict';

const currentTimestamp = Sequelize => ({
  type: Sequelize.DATE,
  defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
});

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tugas_akhir', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      judul: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      penulis: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      tahun: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      created_at: currentTimestamp(Sequelize),
      updated_at: currentTimestamp(Sequelize)
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tugas_akhir');
  }
};
