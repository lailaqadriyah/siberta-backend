'use strict';

const tableExists = async (queryInterface, tableName) => {
  try {
    await queryInterface.describeTable(tableName);
    return true;
  } catch (error) {
    return false;
  }
};

const columnExists = async (queryInterface, tableName, columnName) => {
  try {
    const table = await queryInterface.describeTable(tableName);
    return Boolean(table[columnName]);
  } catch (error) {
    return false;
  }
};

const currentTimestamp = Sequelize => ({
  type: Sequelize.DATE,
  defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
});

module.exports = {
  async up(queryInterface, Sequelize) {
    if (await tableExists(queryInterface, 'submission_files')) {
      await queryInterface.dropTable('submission_files');
    }

    if (await tableExists(queryInterface, 'departments')) {
      await queryInterface.dropTable('departments');
    }

    if (await tableExists(queryInterface, 'audit_logs')) {
      await queryInterface.dropTable('audit_logs');
    }

    if (await tableExists(queryInterface, 'master_titles')) {
      await queryInterface.dropTable('master_titles');
    }

    if (await columnExists(queryInterface, 'pengajuan', 'sbert_vector_id')) {
      await queryInterface.removeColumn('pengajuan', 'sbert_vector_id');
    }

    if (await columnExists(queryInterface, 'pengajuan', 'komentar')) {
      await queryInterface.removeColumn('pengajuan', 'komentar');
    }

    if (await columnExists(queryInterface, 'reviews', 'score')) {
      await queryInterface.removeColumn('reviews', 'score');
    }

    if (!(await columnExists(queryInterface, 'tugas_akhir', 'tema'))) {
      await queryInterface.addColumn('tugas_akhir', 'tema', {
        type: Sequelize.STRING(16),
        allowNull: true
      });
    }

    if (!(await columnExists(queryInterface, 'tugas_akhir', 'similarity_score'))) {
      await queryInterface.addColumn('tugas_akhir', 'similarity_score', {
        type: Sequelize.DOUBLE,
        allowNull: true
      });
    }
  },

  async down(queryInterface, Sequelize) {
    if (await columnExists(queryInterface, 'tugas_akhir', 'similarity_score')) {
      await queryInterface.removeColumn('tugas_akhir', 'similarity_score');
    }

    if (await columnExists(queryInterface, 'tugas_akhir', 'tema')) {
      await queryInterface.removeColumn('tugas_akhir', 'tema');
    }

    if (!(await columnExists(queryInterface, 'reviews', 'score'))) {
      await queryInterface.addColumn('reviews', 'score', {
        type: Sequelize.DOUBLE,
        allowNull: true
      });
    }

    if (!(await columnExists(queryInterface, 'pengajuan', 'komentar'))) {
      await queryInterface.addColumn('pengajuan', 'komentar', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }

    if (!(await columnExists(queryInterface, 'pengajuan', 'sbert_vector_id'))) {
      await queryInterface.addColumn('pengajuan', 'sbert_vector_id', {
        type: Sequelize.STRING(255),
        allowNull: true
      });
    }

    if (!(await tableExists(queryInterface, 'master_titles'))) {
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
    }

    if (!(await tableExists(queryInterface, 'audit_logs'))) {
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
    }

    if (!(await tableExists(queryInterface, 'departments'))) {
      await queryInterface.createTable('departments', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        ml_model_version: {
          type: Sequelize.STRING(64)
        },
        last_synced_at: {
          type: Sequelize.DATE
        },
        created_at: currentTimestamp(Sequelize),
        updated_at: currentTimestamp(Sequelize)
      });
    }

    if (!(await tableExists(queryInterface, 'submission_files'))) {
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
    }
  }
};
