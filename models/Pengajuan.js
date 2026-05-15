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
    // Menyimpan path/nama file PDF (bisa kosong/opsional)
    file_pendukung: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // Status dari masing-masing pihak
    status_p1: {
        type: DataTypes.ENUM('pending', 'setuju', 'revisi', 'tolak'),
        defaultValue: 'pending'
    },
    status_p2: {
        type: DataTypes.ENUM('pending', 'setuju', 'revisi', 'tolak'),
        defaultValue: 'pending'
    },
    status_admin: {
        type: DataTypes.ENUM('pending', 'disetujui'),
        defaultValue: 'pending'
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