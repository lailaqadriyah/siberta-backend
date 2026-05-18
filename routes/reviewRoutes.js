const express = require('express');
const router = express.Router();

const { postReview } = require('../controllers/reviewController');
const { verifyToken } = require('../middleware/authMiddleware');
const { isDosen } = require('../middleware/roleMiddleware');

// Dosen mengirim review untuk pengajuan tertentu
router.post('/:id', verifyToken, isDosen, postReview);

module.exports = router;
