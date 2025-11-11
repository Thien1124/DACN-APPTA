const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

// Local authentication routes
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/verify-2fa-login', authController.verify2FAForLogin); // Task 10: 2FA verification for login
router.post('/logout', authenticate, authController.logout);

// OTP verification routes
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);

// Password reset routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Google OAuth routes
router.get('/google',
  (req, res, next) => {
    console.log('📍 Starting Google OAuth flow');
    next();
  },
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false,
    accessType: 'offline',
    prompt: 'consent'
  })
);

router.get('/google/callback',
  (req, res, next) => {
    console.log('📍 Google callback received:', {
      query: req.query,
      code: req.query.code
    });
    next();
  },
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_oauth`
  }),
  authController.oauthSuccessRedirect
);

// Facebook OAuth routes
router.get('/facebook',
  (req, res, next) => {
    console.log('📍 Starting Facebook OAuth flow');
    next();
  },
  passport.authenticate('facebook', {
    scope: ['email', 'public_profile'],
    session: false,
    authType: 'rerequest'
  })
);

router.get('/facebook/callback',
  (req, res, next) => {
    console.log('📍 Facebook callback received:', {
      query: req.query
    });
    next();
  },
  passport.authenticate('facebook', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=facebook_oauth`
  }),
  authController.oauthSuccessRedirect
);

module.exports = router;