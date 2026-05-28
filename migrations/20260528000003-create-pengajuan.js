'use strict';

const currentTimestamp = Sequelize => ({
  type: Sequelize.DATE,
  defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
});

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pengajuan', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      judul: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      abstract: {
        type: Sequelize.TEXT
      },
      student_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      pembimbing1_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      pembimbing2_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      file_pendukung: {
        type: Sequelize.STRING(1024)
      },
      status: {
        type: Sequelize.STRING(32),
        defaultValue: 'draft'
      },
      similarity_score: {
        type: Sequelize.DOUBLE
      },
      sbert_vector_id: {
        type: Sequelize.STRING(255)
      },
      komentar: {
        type: Sequelize.TEXT
      },
      created_at: currentTimestamp(Sequelize),
      updated_at: currentTimestamp(Sequelize)
    });

    await queryInterface.addIndex('pengajuan', ['student_id'], {
      name: 'idx_pengajuan_student'
    });
    await queryInterface.addIndex('pengajuan', ['status'], {
      name: 'idx_pengajuan_status'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('pengajuan', 'idx_pengajuan_status');
    await queryInterface.removeIndex('pengajuan', 'idx_pengajuan_student');
    await queryInterface.dropTable('pengajuan');
  }
};
