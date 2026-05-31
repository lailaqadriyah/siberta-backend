'use strict';

const columnExists = async (queryInterface, tableName, columnName) => {
  const table = await queryInterface.describeTable(tableName);
  return Boolean(table[columnName]);
};

module.exports = {
  async up(queryInterface, Sequelize) {
    if (!(await columnExists(queryInterface, 'tugas_akhir', 'pengajuan_id'))) {
      await queryInterface.addColumn('tugas_akhir', 'pengajuan_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'pengajuan',
          key: 'id'
        },
        onDelete: 'SET NULL'
      });

      await queryInterface.addIndex('tugas_akhir', ['pengajuan_id'], {
        name: 'idx_tugas_akhir_pengajuan'
      });
    }

    await queryInterface.sequelize.query(`
      UPDATE tugas_akhir ta
      JOIN pengajuan p
        ON p.judul = ta.judul
      SET ta.pengajuan_id = p.id
      WHERE ta.pengajuan_id IS NULL
        AND p.status = 'validated'
    `);
  },

  async down(queryInterface) {
    if (await columnExists(queryInterface, 'tugas_akhir', 'pengajuan_id')) {
      await queryInterface.removeIndex('tugas_akhir', 'idx_tugas_akhir_pengajuan');
      await queryInterface.removeColumn('tugas_akhir', 'pengajuan_id');
    }
  }
};
