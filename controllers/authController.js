const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Fungsi untuk Register
const register = async (req, res) => {
    try {
        // Ubah email jadi username
        const { nama, username, password } = req.body;

        // Cek username
        const userMngkinAda = await User.findOne({ where: { username } });
        if (userMngkinAda) {
            return res.status(400).json({ pesan: "Username sudah digunakan!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userBaru = await User.create({
            nama,
            username, // Simpan username
            password: hashedPassword
        });

        res.status(201).json({ pesan: "Registrasi berhasil!", data: { id: userBaru.id, nama: userBaru.nama, username: userBaru.username } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ pesan: "Terjadi kesalahan pada server" });
    }
};

// Fungsi untuk Login
const login = async (req, res) => {
    try {
        // Ambil username dari request frontend
        const { username, password } = req.body;

        // Cari berdasarkan username
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ pesan: "Username tidak ditemukan!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ pesan: "Password salah!" });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.status(200).json({ 
            pesan: "Login berhasil!", 
            token: token,
            user: { id: user.id, nama: user.nama, username: user.username }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ pesan: "Terjadi kesalahan pada server" });
    }
};

module.exports = { register, login };