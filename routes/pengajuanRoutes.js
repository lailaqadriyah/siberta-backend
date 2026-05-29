const express = require('express');
const router = express.Router();

const {
	ajukanJudul,
	getSubmission,
	listSubmissions,
	updateSubmission,
	deleteSubmission,
	uploadFile,
	simulateSubmission
} = require('../controllers/pengajuanController');
const { verifyToken } = require('../middleware/authMiddleware');
const { isMahasiswa } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Rute ini dibaca: 
// 1. Wajib Login (verifyToken)
// 2. Wajib Mahasiswa (isMahasiswa)
// 3. Terima 1 file dengan nama field 'file_pendukung' (upload.single)
// 4. Proses datanya (ajukanJudul)
router.post('/', verifyToken, isMahasiswa, upload.single('file_pendukung'), ajukanJudul);

// Dapatkan daftar pengajuan (role-aware)
router.get('/', verifyToken, listSubmissions);

// Dapatkan detail pengajuan
router.get('/:id', verifyToken, getSubmission);

// Update pengajuan (mahasiswa pemilik)
router.put('/:id', verifyToken, isMahasiswa, updateSubmission);

// Hapus pengajuan (mahasiswa pemilik)
router.delete('/:id', verifyToken, isMahasiswa, deleteSubmission);

// Dapatkan reviews untuk pengajuan tertentu
router.get('/:id/reviews', verifyToken, async (req, res) => {
	const Review = require('../models/Review');
	const id = parseInt(req.params.id, 10);
	const reviews = await Review.findAll({ where: { submission_id: id } });
	res.json({ data: reviews });
});

// Upload file untuk submission
router.post('/:id/upload', verifyToken, upload.single('file_pendukung'), uploadFile);

// Simulasi kemiripan untuk submission
router.post('/:id/simulate', verifyToken, simulateSubmission);

module.exports = router;
