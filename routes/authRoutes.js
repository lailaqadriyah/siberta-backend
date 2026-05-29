const express = require('express');
const router = express.Router();

// Import fungsi dari controller
const { register, login, getDosen, getMe, updateProfile } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Daftar Rute (Pastikan /login tidak hilang!)
router.post('/register', register);
router.post('/login', login);
router.get('/dosen', getDosen); // Rute untuk dropdown form mahasiswa
router.get('/me', verifyToken, getMe);
router.put('/me', verifyToken, updateProfile);

module.exports = router;