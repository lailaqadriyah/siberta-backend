'use strict';

const currentTimestamp = Sequelize => ({
  type: Sequelize.DATE,
  defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
});

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('submission_files', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      submission_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'pengajuan',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      filename: {
        type: Sequelize.STRING(512),
        allowNull: false
      },
      storage_path: {
        type: Sequelize.STRING(1024),
        allowNull: false
      },
      mime: {
        type: Sequelize.STRING(128)
      },
      uploaded_by: {
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
    await queryInterface.dropTable('submission_files');
  }
};
