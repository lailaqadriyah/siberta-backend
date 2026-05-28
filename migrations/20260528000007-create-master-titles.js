'use strict';

const currentTimestamp = Sequelize => ({
  type: Sequelize.DATE,
  defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
});

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('master_titles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      source: {
        type: Sequelize.STRING(255)
      },
      notes: {
        type: Sequelize.TEXT
      },
      created_by: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      created_at: currentTimestamp(Sequelize)
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('master_titles');
  }
};
