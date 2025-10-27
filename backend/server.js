require('dotenv').config();

const express = require('express');
const path = require('path');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const connectDatabase = require('./config/database');
const errorHandler = require('./src/middleware/error');
const passportConfig = require('./src/config/passport');

// --- Hợp nhất tất cả routes từ cả hai nhánh ---
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const twoFactorRoutes = require('./src/routes/twoFactorRoutes');
const auditRoutes = require('./src/routes/auditRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const testRoutes = require('./src/routes/testRoutes');
const goalRoutes = require('./src/routes/goals');
const courseRoutes = require('./src/routes/courseRoutes');
const unitRoutes = require('./src/routes/unitRoutes');
const lessonRoutes = require('./src/routes/lessonRoutes');
const vocabularyRoutes = require('./src/routes/vocabularyRoutes');
const exerciseRoutes = require('./src/routes/exerciseRoutes');
const achievementRoutes = require('./src/routes/achievementRoutes');
const deckRoutes = require('./src/routes/deckRoutes');
const flashcardRoutes = require('./src/routes/flashcardRoutes');
const leaderboardRoutes = require('./src/routes/leaderboardRoutes');
const streakRoutes = require('./src/routes/streakRoutes');
const xpRoutes = require('./src/routes/xpRoutes');
const missionRoutes = require('./src/routes/missionRoutes');
const heartRoutes = require('./src/routes/heartRoutes');
const shopRoutes = require('./src/routes/shopRoutes');

const app = express();
const PORT = process.env.PORT || 1124;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Debug: Hiển thị thông tin môi trường
console.log('Environment:');
console.log('PORT:', PORT);
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('CLIENT_URL:', CLIENT_URL);
console.log('---');

// Kết nối tới MongoDB
connectDatabase();

// Cấu hình CORS chi tiết
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001', CLIENT_URL],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files (ví dụ: cho avatar)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Khởi tạo Passport
app.use(passport.initialize());
passportConfig();

// --- Đăng ký tất cả Routes ---
// Core Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/2fa', twoFactorRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/goals', goalRoutes);

// Learning Content Routes
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/units', unitRoutes);
app.use('/api/v1/lessons', lessonRoutes);
app.use('/api/v1/vocabularies', vocabularyRoutes);
app.use('/api/v1/exercises', exerciseRoutes);
app.use('/api/v1/tests', testRoutes);
app.use('/api/v1/decks', deckRoutes);
app.use('/api/v1/flashcards', flashcardRoutes);

// Gamification Routes
app.use('/api/v1/achievements', achievementRoutes);
app.use('/api/v1/leaderboard', leaderboardRoutes);
app.use('/api/v1/streak', streakRoutes);
app.use('/api/v1/xp', xpRoutes);
app.use('/api/v1/missions', missionRoutes);
app.use('/api/v1/hearts', heartRoutes);
app.use('/api/v1/shop', shopRoutes);

// Route gốc với thông tin chi tiết
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Chào mừng đến với API English Master',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Xử lý lỗi
// Handler cho các route không tồn tại (404)
app.use((req, res, next) => {
  const error = new Error(`Endpoint không tồn tại: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Error handler middleware chung
app.use(errorHandler);

// Khởi động server
app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
  console.log(`✅ Static files có thể truy cập tại: http://localhost:${PORT}/uploads`);
  console.log(`✅ CORS được bật cho các domain: ${corsOptions.origin.join(', ')}`);
});