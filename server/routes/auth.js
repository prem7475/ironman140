const express = require('express');
const router = express.Router();
const { register, login, googleAuth } = require('../controllers/auth.controller');

// Register
router.post('/register', register);

// Login
router.post('/login', login);

// Google OAuth Verification
router.post('/google', googleAuth);

module.exports = router;
