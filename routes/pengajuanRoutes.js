const express = require('express');
const router = express.Router();

const {
	ajukanJudul,
	getSubmission,
	listSubmissions,
	updateSubmission,
	deleteSubmission,
	uploadFile,
	simulateSubmission,
	getSubmissionReviews
	} = require('../controllers/pengajuanController');
const { verifyToken } = require('../middleware/authMiddleware');
const { isMahasiswa } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { downloadSubmissionFile } = require('../controllers/fileController');

// Rute ini dibaca: 
// 1. Wajib Login (verifyToken)
// 2. Wajib Mahasiswa (isMahasiswa)
// 3. Terima 1 file dengan nama field 'file_pendukung' (upload.single)
// 4. Proses datanya (ajukanJudul)
router.post('/', verifyToken, isMahasiswa, upload.single('file_pendukung'), ajukanJudul);

// Dapatkan daftar pengajuan (role-aware)
router.get('/', verifyToken, listSubmissions);

// Download file pendukung yang tersimpan di kolom pengajuan.file_pendukung
router.get('/:id/file-pendukung/download', verifyToken, downloadSubmissionFile);

// Dapatkan detail pengajuan
router.get('/:id', verifyToken, getSubmission);

// Update pengajuan (mahasiswa pemilik)
router.put('/:id', verifyToken, isMahasiswa, updateSubmission);

// Hapus pengajuan (mahasiswa pemilik)
router.delete('/:id', verifyToken, isMahasiswa, deleteSubmission);

// Dapatkan reviews untuk pengajuan tertentu
router.get('/:id/reviews', verifyToken, getSubmissionReviews);

// Upload file untuk submission
router.post('/:id/upload', verifyToken, isMahasiswa, upload.single('file_pendukung'), uploadFile);

// Simulasi kemiripan untuk submission
router.post('/:id/simulate', verifyToken, simulateSubmission);

module.exports = router;
