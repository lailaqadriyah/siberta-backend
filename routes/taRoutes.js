const express = require('express');
const router = express.Router();
const { cekKemiripan } = require('../controllers/taController');
const verifyToken = require('../middleware/authMiddleware'); // Import satpam

// Rute ini dilindungi, wajib bawa token
router.post('/cek', verifyToken, cekKemiripan);

module.exports = router;