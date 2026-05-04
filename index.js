require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database'); // Import koneksi
const User = require('./models/User'); // Import model User

const authRoutes = require('./routes/authRoutes');
const TugasAkhir = require('./models/TugasAkhir'); // Import model baru agar otomatis dibuat di MySQL
const taRoutes = require('./routes/taRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ta', taRoutes);

// Tes Koneksi & Sinkronisasi Database
sequelize.authenticate()
    .then(() => {
        console.log('Berhasil terhubung ke database MySQL!');
        // sync({ alter: true }) akan otomatis mengupdate tabel jika ada perubahan di Model
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