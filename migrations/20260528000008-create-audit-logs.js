'use strict';

const currentTimestamp = Sequelize => ({
  type: Sequelize.DATE,
  defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
});

module.exports = {
  async up(queryInterface, Sequelize) {
    const jsonType = queryInterface.sequelize.getDialect() === 'postgres'
      ? Sequelize.JSONB
      : Sequelize.JSON;

    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      action: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      details: {
        type: jsonType
      },
      created_at: currentTimestamp(Sequelize)
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('audit_logs');
  }
};
