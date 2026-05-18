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
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('draft', 'submitted', 'revisi', 'setuju', 'ditolak', 'validated'),
        defaultValue: 'draft'
    },
    similarity_score: {
        type: DataTypes.FLOAT,
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
    // Catatan: Kolom relasi seperti id_mahasiswa dan id_dosen 
    // akan dibuat otomatis oleh Sequelize di Langkah 3.
}, {
    tableName: 'pengajuan',
    timestamps: true
});

module.exports = Pengajuan;