const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TugasAkhir = sequelize.define('TugasAkhir', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    judul: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    penulis: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tahun: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'tugas_akhir',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = TugasAkhir;
