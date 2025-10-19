require('dotenv').config();

const express = require('express');

const passport = require('passport');
const cookieParser = require('cookie-parser'); // Sửa lỗi gõ sai
const bodyParser = require('body-parser');
const cors = require('cors'); // Giữ lại một dòng require


const passport = require('passport');
const cookieParser = require('cookie-parser');
const cors = require('cors');


const bodyParser = require('body-parser');
const cors = require('cors');


const connectDatabase = require('./config/database');
const errorHandler = require('./src/middleware/error');
const passportConfig = require('./src/config/passport');

// --- Import routes từ cả hai nhánh ---
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');

const courseRoutes = require('./src/routes/courseRoutes');
const unitRoutes = require('./src/routes/unitRoutes');
const lessonRoutes = require('./src/routes/lessonRoutes');
const vocabularyRoutes = require('./src/routes/vocabularyRoutes');
const exerciseRoutes = require('./src/routes/exerciseRoutes');
const testRoutes = require('./src/routes/testRoutes');
const deckRoutes = require('./src/routes/deckRoutes');
const flashcardRoutes = require('./src/routes/flashcardRoutes');
const achievementRoutes = require('./src/routes/achievementRoutes');

const passportConfig = require('./src/config/passport');


const app = express();
const PORT = process.env.PORT || 1124;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';


// Kết nối tới MongoDB
connectDatabase();

// --- Cấu hình CORS (chỉ một lần) ---

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
    origin: [CLIENT_URL, 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
};
app.use(cors(corsOptions));

// --- Middlewares ---
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Khởi tạo Passport
app.use(passport.initialize());
passportConfig();

// --- Đăng ký tất cả Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/units', unitRoutes);
app.use('/api/v1/lessons', lessonRoutes);
app.use('/api/v1/vocabularies', vocabularyRoutes);
app.use('/api/v1/exercises', exerciseRoutes);
app.use('/api/v1/tests', testRoutes);
app.use('/api/v1/decks', deckRoutes);
app.use('/api/v1/flashcards', flashcardRoutes);
app.use('/api/v1/achievements', achievementRoutes);

// --- Route gốc đã hợp nhất ---
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Chào mừng đến với API English Master',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            courses: '/api/v1/courses',
            units: '/api/v1/units',
            lessons: '/api/v1/lessons',
            vocabularies: '/api/v1/vocabularies',
            exercises: '/api/v1/exercises',
            tests: '/api/v1/tests',
            decks: '/api/v1/decks',
            flashcards: '/api/v1/flashcards',
            achievements: '/api/v1/achievements'
        }
    });
});

// --- Xử lý lỗi ---
// Handler cho các route không tồn tại (404)
app.use((req, res, next) => {
    const error = new Error(`Endpoint không tồn tại: ${req.method} ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
});

// Error handler middleware chung
app.use(errorHandler);

// --- Khởi động server ---
app.listen(PORT, () => {
    console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
    console.log(`✅ CORS được bật cho: ${CLIENT_URL}`);
});


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

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

