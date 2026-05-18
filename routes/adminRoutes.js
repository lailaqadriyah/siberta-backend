const express = require('express');
const router = express.Router();

const { validateSubmission, listMasterTitles, createMasterTitle, listUsers, createUser, triggerSyncML } = require('../controllers/adminController');
const { verifyToken } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

router.post('/validate/:submissionId', verifyToken, isAdmin, validateSubmission);
router.get('/master-titles', verifyToken, isAdmin, listMasterTitles);
router.post('/master-titles', verifyToken, isAdmin, createMasterTitle);

router.get('/users', verifyToken, isAdmin, listUsers);
router.post('/users', verifyToken, isAdmin, createUser);

router.post('/sync-ml', verifyToken, isAdmin, triggerSyncML);

module.exports = router;
