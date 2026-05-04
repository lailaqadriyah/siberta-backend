const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TugasAkhir = sequelize.define('TugasAkhir', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    judul: {
        type: DataTypes.TEXT, // Pakai TEXT karena judul TA bisa sangat panjang
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
    timestamps: true
});

module.exports = TugasAkhir;