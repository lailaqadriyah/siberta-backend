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
    role: {
        type: DataTypes.STRING(20),
        defaultValue: 'mahasiswa',
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    nim: {
        type: DataTypes.STRING,
        allowNull: true
    },
    prodi: {
        type: DataTypes.STRING,
        allowNull: true
    },
    angkatan: {
        type: DataTypes.STRING,
        allowNull: true
    },
    pembimbing: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = User;
