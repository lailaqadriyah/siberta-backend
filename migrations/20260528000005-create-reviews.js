'use strict';

const currentTimestamp = Sequelize => ({
  type: Sequelize.DATE,
  defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
});

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reviews', {
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
      reviewer_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      decision: {
        type: Sequelize.STRING(16),
        allowNull: false
      },
      comment: {
        type: Sequelize.TEXT
      },
      score: {
        type: Sequelize.DOUBLE
      },
      created_at: currentTimestamp(Sequelize)
    });

    await queryInterface.addIndex('reviews', ['submission_id'], {
      name: 'idx_reviews_submission'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('reviews', 'idx_reviews_submission');
    await queryInterface.dropTable('reviews');
  }
};
