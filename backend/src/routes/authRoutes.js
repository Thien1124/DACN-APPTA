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
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false,
    accessType: 'offline', // ✅ Thêm để có refresh token
    prompt: 'consent' // ✅ Luôn hiển thị consent screen
  })
);

router.get('/google/callback',
  (req, res, next) => {
    console.log('📥 Google callback URL:', req.url);
    console.log('📥 Query params:', req.query);
    next();
  },
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_oauth`
  }),
  authController.oauthSuccessRedirect
);

// Facebook OAuth
router.get('/facebook',
  passport.authenticate('facebook', { 
    scope: ['public_profile', 'email'],
    session: false 
  })
);

router.get('/facebook/callback',
  (req, res, next) => {
    console.log('📥 Facebook callback URL:', req.url);
    console.log('📥 Query params:', req.query);
    next();
  },
  passport.authenticate('facebook', { 
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=facebook_oauth`
  }),
  authController.oauthSuccessRedirect
);

module.exports = router;