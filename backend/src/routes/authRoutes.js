
const express = require('express');
const router = express.Router();
const { register } = require('../controllers/AuthController');
const { validateRegistration } = require('../middleware/validation');

// Route đăng ký
router.post('/register', validateRegistration, register);

module.exports = router;