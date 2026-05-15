const express = require('express');
const router = express.Router();

// Import sebagai object utuh
const taController = require('../controllers/taController');
const authMiddleware = require('../middleware/authMiddleware');

// Gunakan langsung dari object-nya
router.post('/cek', authMiddleware.verifyToken, taController.cekKemiripan);

module.exports = router;