'use strict';

const currentTimestamp = Sequelize => ({
  type: Sequelize.DATE,
  defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
});

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nama: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      username: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      role: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'mahasiswa'
      },
      created_at: currentTimestamp(Sequelize),
      updated_at: currentTimestamp(Sequelize)
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  }
};
