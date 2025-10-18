const express = require('express');
const passport = require('passport');
const router = express.Router();

const authController = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

// Local authentication routes
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/logout', authenticate, authController.logout);

// OTP verification routes
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);

// Password reset routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Google OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    session: false, 
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth` 
  }),
  authController.oauthSuccessRedirect
);

// Facebook OAuth
router.get('/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

router.get('/facebook/callback',
  passport.authenticate('facebook', { 
    session: false, 
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth` 
  }),
  authController.oauthSuccessRedirect
);

const { register,login } = require('../controllers/authController');
const { validateRegistration,validateLogin } = require('../middleware/validation');

// Route đăng ký
router.post('/register', validateRegistration, register);
// ✅ Route đăng nhập
router.post('/login', validateLogin, login);


module.exports = router;