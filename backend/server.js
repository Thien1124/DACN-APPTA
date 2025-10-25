require('dotenv').config();

const express = require('express');
const path = require('path');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const connectDatabase = require('./config/database');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const twoFactorRoutes = require('./src/routes/twoFactorRoutes');
const passportConfig = require('./src/config/passport');
const auditRoutes = require('./src/routes/auditRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const testRoutes = require('./src/routes/testRoutes');
const goalRoutes = require('./src/routes/goals');

// Import các routes mới
const courseRoutes = require('./src/routes/courseRoutes');
const unitRoutes = require('./src/routes/unitRoutes');
const lessonRoutes = require('./src/routes/lessonRoutes');
const vocabularyRoutes = require('./src/routes/vocabularyRoutes');
const exerciseRoutes = require('./src/routes/exerciseRoutes');
const achievementRoutes = require('./src/routes/achievementRoutes');
const deckRoutes = require('./src/routes/deckRoutes');
const flashcardRoutes = require('./src/routes/flashcardRoutes');
const leaderboardRoutes = require('./src/routes/leaderboardRoutes');

const app = express();
const PORT = process.env.PORT || 1124;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Debug: Show environment info
console.log('Environment:');
console.log('PORT:', PORT);
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('CLIENT_URL:', CLIENT_URL);
console.log('---');

// Connect to MongoDB
connectDatabase();

// CORS Configuration (CHỈ 1 LẦN)
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001', CLIENT_URL],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middlewares (CHỈ 1 LẦN)
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files (Task 9: Avatar images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize Passport
app.use(passport.initialize());
passportConfig();

// Routes của Thiện
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/2fa', twoFactorRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/goals', goalRoutes);



// Sử dụng các routes mới
app.use('/api/courses', courseRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/vocabularies', vocabularyRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/decks', deckRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Health root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Chào mừng đến với API English Master',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        verifyOTP: 'POST /api/auth/verify-otp',
        resendOTP: 'POST /api/auth/resend-otp',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout (JWT required)',
        forgotPassword: 'POST /api/auth/forgot-password',
        resetPassword: 'POST /api/auth/reset-password',
        googleAuth: 'GET /api/auth/google',
        facebookAuth: 'GET /api/auth/facebook'
      },
      user: {
        getProfile: 'GET /api/users/profile (JWT required)',
        updateProfile: 'PUT /api/users/profile (JWT required)',
        uploadAvatar: 'POST /api/users/avatar (JWT required)',
        deleteAvatar: 'DELETE /api/users/avatar (JWT required)'
      },
      twoFactor: {
        status: 'GET /api/2fa/status (JWT required)',
        setup: 'POST /api/2fa/setup (JWT required)',
        enable: 'POST /api/2fa/enable (JWT required)',
        verify: 'POST /api/2fa/verify (JWT required)',
        disable: 'POST /api/2fa/disable (JWT required)'
      },
      courses: {
        getAll: 'GET /api/courses',
        getOne: 'GET /api/courses/:id',
        create: 'POST /api/courses (Admin)',
        update: 'PUT /api/courses/:id (Admin)',
        delete: 'DELETE /api/courses/:id (Admin)'
      },
      staticFiles: {
        avatars: '/uploads/avatars/:filename'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint không tồn tại',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
  console.log(`✅ Static files: http://localhost:${PORT}/uploads`);
  console.log(`✅ CORS enabled for: ${corsOptions.origin.join(', ')}`);
});