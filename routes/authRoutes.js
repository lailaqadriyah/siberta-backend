const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Alamat API untuk auth
router.post('/register', register);
router.post('/login', login);

module.exports = router;