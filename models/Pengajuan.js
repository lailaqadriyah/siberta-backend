const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pengajuan = sequelize.define('Pengajuan', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    judul: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    abstract: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    pembimbing1_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    pembimbing2_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    file_pendukung: {
        type: DataTypes.STRING(1024),
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(32),
        defaultValue: 'draft'
    },
    similarity_score: {
        type: DataTypes.DOUBLE,
        allowNull: true
    },
    sbert_vector_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    komentar: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'pengajuan',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Pengajuan;
