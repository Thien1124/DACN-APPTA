require('dotenv').config();

const express = require('express');

const passport = require('passport');
const cookieParser = require('cookie-parser');
const cors = require('cors');


const bodyParser = require('body-parser');
const cors = require('cors');

const connectDatabase = require('./config/database');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const passportConfig = require('./src/config/passport');

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


// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS - Allow frontend origin
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));

// Initialize Passport
app.use(passport.initialize());
passportConfig();

// CORS Configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Frontend URLs
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions)); // ✅ Thêm CORS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Import các routes mới
const courseRoutes = require('./src/routes/courseRoutes');
const unitRoutes = require('./src/routes/unitRoutes');
const lessonRoutes = require('./src/routes/lessonRoutes');
const vocabularyRoutes = require('./src/routes/vocabularyRoutes');
const exerciseRoutes = require('./src/routes/exerciseRoutes');
const achievementRoutes = require('./src/routes/achievementRoutes');
const testRoutes = require('./src/routes/testRoutes');
const deckRoutes = require('./src/routes/deckRoutes');
const flashcardRoutes = require('./src/routes/flashcardRoutes');
const leaderboardRoutes = require('./src/routes/leaderboardRoutes');

// Sử dụng các routes mới
app.use('/api/courses', courseRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/vocabularies', vocabularyRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/tests', testRoutes);
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
        register: {
          method: 'POST',
          path: '/api/auth/register',
          description: 'Đăng ký tài khoản mới với email',
          body: {
            name: 'string (required)',
            email: 'string (required)',
            password: 'string (required, min 6 chars)',
            confirmPassword: 'string (required)',
            age: 'number (optional)'
          }
        },
        verifyOTP: {
          method: 'POST',
          path: '/api/auth/verify-otp',
          description: 'Xác thực OTP sau khi đăng ký',
          body: {
            email: 'string (required)',
            otp: 'string (required, 6 digits)'
          }
        },
        resendOTP: {
          method: 'POST',
          path: '/api/auth/resend-otp',
          description: 'Gửi lại mã OTP',
          body: {
            email: 'string (required)'
          }
        },
        login: {
          method: 'POST',
          path: '/api/auth/login',
          description: 'Đăng nhập với email và password',
          body: {
            email: 'string (required)',
            password: 'string (required)'
          }
        },
        logout: {
          method: 'POST',
          path: '/api/auth/logout',
          description: 'Đăng xuất (token sẽ bị blacklist)',
          headers: {
            Authorization: 'Bearer <token>'
          }
        },
        googleAuth: {
          method: 'GET',
          path: '/api/auth/google',
          description: 'Đăng nhập bằng Google OAuth'
        },
        facebookAuth: {
          method: 'GET',
          path: '/api/auth/facebook',
          description: 'Đăng nhập bằng Facebook OAuth'
        }
      },
      user: {
        getProfile: {
          method: 'GET',
          path: '/api/users/profile',
          description: 'Lấy thông tin profile của user hiện tại',
          headers: {
            Authorization: 'Bearer <token>'
          }
        },
        updateProfile: {
          method: 'PUT',
          path: '/api/users/profile',
          description: 'Cập nhật thông tin profile',
          headers: {
            Authorization: 'Bearer <token>'
          },
          body: {
            name: 'string (optional)',
            age: 'number (optional)',
            avatar: 'string (optional)'
          }
        }
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
  console.log(`Server đang chạy tại http://localhost:${PORT}`);

  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
  console.log(`✅ CORS enabled for: http://localhost:3000`);

});