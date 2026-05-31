'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE tugas_akhir ta
      JOIN pengajuan p
        ON p.judul = ta.judul
      SET
        ta.similarity_score = COALESCE(ta.similarity_score, p.similarity_score),
        ta.tema = COALESCE(ta.tema, p.tema)
      WHERE p.status = 'validated'
        AND (ta.similarity_score IS NULL OR ta.tema IS NULL)
    `);
  },

  async down() {
    // Data backfill is intentionally not reverted.
  }
};
