const express = require('express');
const router = express.Router();

// Import ketiga fungsi dari controller
const { register, login, getDosen } = require('../controllers/authController');

// Daftar Rute (Pastikan /login tidak hilang!)
router.post('/register', register);
router.post('/login', login);
router.get('/dosen', getDosen); // Rute untuk dropdown form mahasiswa

module.exports = router;