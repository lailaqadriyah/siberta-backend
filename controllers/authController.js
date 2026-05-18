const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Fungsi untuk Register
const register = async (req, res) => {
    try {
        // Menerima input 'role' (bisa 'mahasiswa', 'dosen', atau 'admin')
        const { nama, username, password, role } = req.body;

        // Cek username
        const userMngkinAda = await User.findOne({ where: { username } });
        if (userMngkinAda) {
            return res.status(400).json({ pesan: "Username sudah digunakan!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Simpan user baru ke database
        const userBaru = await User.create({
            nama,
            username,
            password: hashedPassword,
            role: role || 'mahasiswa' // Default ke mahasiswa jika tidak diisi
        });

        res.status(201).json({ 
            pesan: "Registrasi berhasil!", 
            data: { 
                id: userBaru.id, 
                nama: userBaru.nama, 
                username: userBaru.username, 
                role: userBaru.role 
            } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ pesan: "Terjadi kesalahan pada server" });
    }
};

// Fungsi untuk Login
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ pesan: "Username tidak ditemukan!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ pesan: "Password salah!" });
        }

        // Masukkan 'role' ke dalam payload Token JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.status(200).json({ 
            pesan: "Login berhasil!", 
            token: token,
            user: { 
                id: user.id, 
                nama: user.nama, 
                username: user.username, 
                role: user.role 
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ pesan: "Terjadi kesalahan pada server" });
    }
};

// Tambahkan fungsi ini
const getDosen = async (req, res) => {
    try {
        const dosen = await User.findAll({ 
            where: { role: 'dosen' },
            attributes: ['id', 'nama', 'username'] // Jangan kirim password!
        });
        res.status(200).json({ data: dosen });
    } catch (error) {
        console.error(error);
        res.status(500).json({ pesan: "Gagal mengambil data dosen" });
    }
};

// Jangan lupa update export-nya menjadi seperti ini:
module.exports = { register, login, getDosen };