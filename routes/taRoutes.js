const express = require('express');
const router = express.Router();

const taController = require('../controllers/taController');
const authMiddleware = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

// Semua user yang sudah login bisa cek kemiripan judul
router.post('/cek', authMiddleware.verifyToken, taController.cekKemiripan);

// Hanya admin yang bisa tambah data ke ML service
router.post('/tambah', authMiddleware.verifyToken, isAdmin, taController.tambahData);

module.exports = router;
