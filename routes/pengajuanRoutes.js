const express = require('express');
const router = express.Router();

const { ajukanJudul } = require('../controllers/pengajuanController');
const { verifyToken } = require('../middleware/authMiddleware');
const { isMahasiswa } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Rute ini dibaca: 
// 1. Wajib Login (verifyToken)
// 2. Wajib Mahasiswa (isMahasiswa)
// 3. Terima 1 file dengan nama field 'file_pendukung' (upload.single)
// 4. Proses datanya (ajukanJudul)
router.post('/', verifyToken, isMahasiswa, upload.single('file_pendukung'), ajukanJudul);

module.exports = router;
