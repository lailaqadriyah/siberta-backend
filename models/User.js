const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama: {
        type: DataTypes.STRING,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // ---- TAMBAHAN BARU: Menentukan peran user ----
    role: {
        type: DataTypes.ENUM('mahasiswa', 'dosen', 'admin'),
        defaultValue: 'mahasiswa', // Defaultnya jika daftar adalah mahasiswa
        allowNull: false
    }
}, {
    tableName: 'users',
    timestamps: true
});

module.exports = User;