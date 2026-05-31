const express = require('express');
const router = express.Router();

const { validateSubmission, listMasterTitles, listUsers, createUser } = require('../controllers/adminController');
const { verifyToken } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

router.post('/validate/:submissionId', verifyToken, isAdmin, validateSubmission);
router.get('/master-titles', verifyToken, isAdmin, listMasterTitles);

router.get('/users', verifyToken, isAdmin, listUsers);
router.post('/users', verifyToken, isAdmin, createUser);

module.exports = router;
