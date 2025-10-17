
const express = require('express');
const router = express.Router();
const { register,login } = require('../controllers/authController');
const { validateRegistration,validateLogin } = require('../middleware/validation');

// Route đăng ký
router.post('/register', validateRegistration, register);
// ✅ Route đăng nhập
router.post('/login', validateLogin, login);

module.exports = router;