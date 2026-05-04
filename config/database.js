const { Sequelize } = require('sequelize');

// Format: new Sequelize('nama_database', 'username_mysql', 'password_mysql', { ... })
const sequelize = new Sequelize('siberta', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false, // Ubah ke true kalau kamu mau melihat query SQL yang berjalan di terminal
});

module.exports = sequelize;