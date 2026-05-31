'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const listDosen = [
      { nama: 'Ricky Akbar, M.Kom', username: 'ricky', passwordKey: 'ricky123' },
      { nama: 'Ullya Mega Wahyuni, M.Kom', username: 'ullya', passwordKey: 'ullya123' },
      { nama: 'Afriyanti Dwi Kartika, S.Pd., M.T.', username: 'afriyanti', passwordKey: 'afriyanti123' },
      { nama: 'Aina Hubby Aziira, M.Eng', username: 'aina', passwordKey: 'aina123' },
      { nama: 'Nisa Dwi Angresti, M.Kom', username: 'nisa', passwordKey: 'nisa123' },
      { nama: 'Husnil Kamil, M.T.', username: 'husnil', passwordKey: 'husnil123' },
      { nama: 'Hafzatin Nurfatifa, M.Eng', username: 'hafzatin', passwordKey: 'hafzatin123' },
      { nama: 'Dwi Welly Sukma Nirad, M.T.', username: 'dwi', passwordKey: 'dwi123' },
      { nama: 'Adi Arga Arifnur, M.Kom', username: 'adi', passwordKey: 'adi123' },
      { nama: 'Fajril Akbar, M.Sc', username: 'fajril', passwordKey: 'fajril123' },
      { nama: 'Hasdi Putra, M.T.', username: 'hasdi', passwordKey: 'hasdi123' },
      { nama: 'Jefril Rahmadoni, M.Kom', username: 'jefril', passwordKey: 'jefril123' },
      { nama: 'Hafizah Hanim, M.Kom', username: 'hafizah', passwordKey: 'hafizah123' },
      { nama: 'Haris Suryamen, M.Sc', username: 'haris', passwordKey: 'haris123' },
      { nama: 'Prof. Dr. Surya Afnarius, S.T., M.Sc.', username: 'surya', passwordKey: 'surya123' },
      { nama: 'Febby Apri Wenando, M.Kom', username: 'febby', passwordKey: 'febby123' },
      { nama: 'Rahmatika Pratama Santi, M.T.', username: 'rahmatika', passwordKey: 'rahmatika123' }
    ];

    const dosenSeed = listDosen.map(d => ({
      nama: d.nama,
      username: d.username,
      password: bcrypt.hashSync(d.passwordKey, 10),
      role: 'dosen',
      created_at: Sequelize.literal('CURRENT_TIMESTAMP'),
      updated_at: Sequelize.literal('CURRENT_TIMESTAMP')
    }));

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
      ...dosenSeed
    ], {
      ignoreDuplicates: true
    });
  },

  async down(queryInterface) {
    const listUsernameDosen = [
      'ricky', 'ullya', 'afriyanti', 'aina', 'nisa',
      'husnil', 'hafzatin', 'dwi', 'adi', 'fajril',
      'hasdi', 'jefril', 'hafizah', 'haris', 'surya',
      'febby', 'rahmatika'
    ];
    await queryInterface.bulkDelete('users', {
      username: ['admin', '2311522022_laila', ...listUsernameDosen]
    }, {});
  }
};
