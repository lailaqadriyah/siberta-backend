require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import Database & Models
const sequelize = require('./config/database'); 
const User = require('./models/User'); 
const TugasAkhir = require('./models/TugasAkhir'); 
const Pengajuan = require('./models/Pengajuan'); 

// Import Routes
const authRoutes = require('./routes/authRoutes');
const taRoutes = require('./routes/taRoutes');
const pengajuanRoutes = require('./routes/pengajuanRoutes'); // <-- Import route pengajuan
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const fileController = require('./controllers/fileController');

const app = express(); // <-- Ini inisialisasi app-nya
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ==========================================
// DEFINISI RELASI ANTAR TABEL (ASSOCIATIONS)
// ==========================================

// Relasi Mahasiswa -> Pengajuan (1 to Many)
User.hasMany(Pengajuan, { as: 'pengajuan_saya', foreignKey: 'mahasiswa_id' });
Pengajuan.belongsTo(User, { as: 'mahasiswa', foreignKey: 'mahasiswa_id' });

// Relasi Dosen Pembimbing 1 -> Pengajuan
User.hasMany(Pengajuan, { as: 'bimbingan_p1', foreignKey: 'pembimbing1_id' });
Pengajuan.belongsTo(User, { as: 'pembimbing1', foreignKey: 'pembimbing1_id' });

// Relasi Dosen Pembimbing 2 -> Pengajuan
User.hasMany(Pengajuan, { as: 'bimbingan_p2', foreignKey: 'pembimbing2_id' });
Pengajuan.belongsTo(User, { as: 'pembimbing2', foreignKey: 'pembimbing2_id' });

// ==========================================

// Gunakan Routes (Harus ditaruh di bawah app = express())
app.use('/api/auth', authRoutes);
app.use('/api/ta', taRoutes);
app.use('/api/pengajuan', pengajuanRoutes); // <-- Penggunaan route pengajuan
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Static download route for uploaded files (protected)
const { verifyToken } = require('./middleware/authMiddleware');
app.get('/api/files/:id/download', verifyToken, fileController.downloadFile);

// Tes Koneksi & Sinkronisasi Database
sequelize.authenticate()
    .then(() => {
        console.log('Berhasil terhubung ke database MySQL!');
        return sequelize.sync({ alter: true }); 
    })
    .then(() => {
        console.log('Tabel berhasil disinkronisasi.');
    })
    .catch((err) => {
        console.error('Gagal terhubung ke database:', err);
    });

app.get('/', (req, res) => {
    res.json({ message: "Halo! Backend Siberta sudah siap melayani." });
});

app.listen(PORT, () => {
    console.log(`Server Express berjalan lancar di http://localhost:${PORT}`);
});