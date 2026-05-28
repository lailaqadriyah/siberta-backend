'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [
      {
        nama: 'Administrator',
        username: 'admin',
        password: '$2b$10$SxayB5FDTCrcbcfdFofz2uM2/WVdZn/WkVMkFz9Fzt3A8.FhjFO6G',
        role: 'admin',
        created_at: Sequelize.literal('CURRENT_TIMESTAMP'),
        updated_at: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      {
        nama: 'Laila Qadriyah',
        username: '2311522022_laila',
        password: '$2b$10$QMxbgedf0hLWfQ4cshDm4e/mGyNYxWZUgY6rs/hcbydNvMWe105Wu',
        role: 'mahasiswa',
        created_at: Sequelize.literal('CURRENT_TIMESTAMP'),
        updated_at: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      {
        nama: 'Dosen Penguji 1',
        username: 'dosen1',
        password: '$2b$10$TnUy/Vt8jdDqPwoso8V/1OfosDb9csGrPiL6gKMMkIYp11vFvWJ36',
        role: 'dosen',
        created_at: Sequelize.literal('CURRENT_TIMESTAMP'),
        updated_at: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      {
        nama: 'Dosen Penguji 2',
        username: 'dosen2',
        password: '$2b$10$TnUy/Vt8jdDqPwoso8V/1OfosDb9csGrPiL6gKMMkIYp11vFvWJ36',
        role: 'dosen',
        created_at: Sequelize.literal('CURRENT_TIMESTAMP'),
        updated_at: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    ], {
      ignoreDuplicates: true
    });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', {
      username: ['admin', '2311522022_laila', 'dosen1', 'dosen2']
    }, {});
  }
};
