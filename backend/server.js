require('dotenv').config();

const express = require('express');
const path = require('path');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authenticate = require('./src/middleware/authenticate');
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
const richFlashcardRoutes = require('./src/routes/richFlashcardRoutes');
const leaderboardRoutes = require('./src/routes/leaderboardRoutes');
const studyRoutes = require('./src/routes/studyRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const aiRoutes = require('./src/routes/aiRoutes'); // Task 21: AI integration

const bulkFlashcardRoutes = require('./src/routes/bulkFlashcardRoutes'); // Task 23: Bulk operations
const leechRoutes = require('./src/routes/leechRoutes'); // Task 24: Leech, Suspend, Bury
const importRoutes = require('./src/routes/importRoutes'); // Task 25: Import CSV/TSV/Google Sheets
const exportRoutes = require('./src/routes/exportRoutes'); // Task 26: Export/Backup/Restore
const dictationRoutes = require('./src/routes/dictationRoutes'); // Task 27: Dictation
const speechRoutes = require('./src/routes/speechRoutes'); // Task 27: Speech Recognition
const interactiveLearningRoutes = require('./src/routes/interactiveLearningRoutes'); // Task 28: Interactive Learning
const shadowingRoutes = require('./src/routes/shadowingRoutes'); // Task 29: Shadowing Audio
const wordbankRoutes = require('./src/routes/wordbankRoutes'); // Task 30: Wordbank
const aiExplanationRoutes = require('./src/routes/aiExplanationRoutes'); // Task 31: AI Explanation
const mnemonicRoutes = require('./src/routes/mnemonicRoutes'); // Task 32: Mnemonic & Visualization
const deviceRoutes = require('./src/routes/deviceRoutes'); // Task 33: Device Management
const testHistoryRoutes = require('./src/routes/testHistoryRoutes'); // Task 34: Test History
const speakingRoutes = require('./src/routes/speakingRoutes'); // Speaking Video & Shadowing

const streakRoutes = require('./src/routes/streakRoutes');
const heartRoutes = require('./src/routes/heartRoutes');
const xpRoutes = require('./src/routes/xpRoutes');
const missionRoutes = require('./src/routes/missionRoutes');
const shopRoutes = require('./src/routes/shopRoutes');

const practiceRoutes = require('./src/routes/practiceRoutes');
const grammarQuizRoutes = require('./src/routes/grammarQuizRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const friendsRoutes = require('./src/routes/friendsRoutes');
const roadmapRoutes = require('./src/routes/roadmapRoutes');
const scheduleRoutes = require('./src/routes/scheduleRoutes');
const calendarRoutes = require('./src/routes/calendarRoutes');


const progressRoutes = require('./src/routes/progressRoutes');


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

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

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


app.use('/api/progress', progressRoutes);

// Sử dụng các routes mới
app.use('/api/courses', courseRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/vocabularies', vocabularyRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/decks', deckRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/flashcards-rich', richFlashcardRoutes); // Task 20: Rich flashcard data
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/reviews', reviewRoutes); // Task 17: Review actions
app.use('/api/ai', aiRoutes); // Task 21: AI Gemini integration
app.use('/api/flashcards-bulk', bulkFlashcardRoutes); // Task 23: Bulk operations
app.use('/api/leeches', leechRoutes); // Task 24: Leech, Suspend, Bury
app.use('/api/import', importRoutes); // Task 25: Import CSV/TSV/Google Sheets
app.use('/api/export', exportRoutes); // Task 26: Export/Backup/Restore
app.use('/api/dictation', dictationRoutes); // Task 27: Dictation exercises
app.use('/api/speech', speechRoutes); // Task 27: Speech recognition & pronunciation
app.use('/api/interactive', interactiveLearningRoutes); // Task 28: Interactive learning games
app.use('/api/shadowing', shadowingRoutes); // Task 29: Shadowing audio practice
app.use('/api/wordbank', wordbankRoutes); // Task 30: Worldbank vocabulary notebook
app.use('/api/ai-explain', aiExplanationRoutes); // Task 31: AI word explanation & synonym comparison
app.use('/api/mnemonic', mnemonicRoutes); // Task 32: Mnemonic generation & visualization suggestions
app.use('/api/devices', deviceRoutes); // Task 33: Multi-device management & session tracking
app.use('/api/test-history', testHistoryRoutes); // Task 34: Test history & progress tracking
app.use('/api/speaking', speakingRoutes); // Speaking Video & Shadowing practice

app.use('/api/streaks', streakRoutes);
app.use('/api/hearts', heartRoutes);
app.use('/api/xp', xpRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/practice', practiceRoutes); // Task 16: Practice - Collocation/Phrasal Verbs/Word Family
app.use('/api/grammar-quiz', grammarQuizRoutes); // Task 17: Grammar Quiz gắn với flashcard
app.use('/api/analytics', analyticsRoutes); // Task 18/19: Error analysis & recommendations
app.use('/api/friends', friendsRoutes); // Task 22: Friends/Social
app.use('/api/roadmap', roadmapRoutes); // Task 20: Lộ trình theo mục tiêu
app.use('/api/schedule', scheduleRoutes); // Task 21: Lịch học tuần/tháng
app.use('/api/calendar', calendarRoutes); // Task 21: Đồng bộ Google Calendar (stub)

// ✅ Vocabulary Bank routes
app.use('/api/vocabulary-bank', require('./src/routes/vocabularyBankRoutes'));

// ✅ Roadmap Topic routes
app.use('/api/roadmap-topic', require('./src/routes/roadmapTopicRoutes'));


// ✅ Practice routes
app.use('/api/practice', require('./src/routes/practiceRoutes'));

// Roadmap routes
app.use('/api/roadmap', require('./src/routes/roadmapRoutes'));


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

/**
 * PUT /api/users/profile
 * Task 8: Cập nhật thông tin profile
 * Yêu cầu: JWT token
 * Body: { name?, age?, currentPassword?, newPassword? }
 */
app.put('/api/users/profile', authenticate, async (req, res) => {
  try {
    const { name, age, currentPassword, newPassword } = req.body;
    const user = req.user;

    // Cập nhật name
    if (name !== undefined) {
      if (!name || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Tên phải có ít nhất 2 ký tự'
        });
      }
      user.name = name.trim();
    }


    // ✅ Xử lý đổi mật khẩu
    if (currentPassword && newPassword) {
      // Kiểm tra mật khẩu hiện tại
      const isPasswordValid = await user.comparePassword(currentPassword);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Mật khẩu hiện tại không đúng'
        });
      }

      // Validate mật khẩu mới
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
        });
      }

      // Cập nhật mật khẩu mới
      user.password = newPassword; // Sẽ được hash bởi pre-save hook
    }

    user.updatedAt = Date.now();
    await user.save();


    res.json({
      success: true,
      message: 'Cập nhật profile thành công',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          age: user.age,
          avatar: user.avatar,
          role: user.role,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Lỗi cập nhật profile:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi cập nhật profile'
    });
  }
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