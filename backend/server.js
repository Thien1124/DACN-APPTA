require('dotenv').config();

const express = require('express');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const authenticate = require('./src/middleware/authenticate');


const bodyParser = require('body-parser');

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

// Serve static files (Task 9: Avatar images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
        forgotPassword: {
          method: 'POST',
          path: '/api/auth/forgot-password',
          description: 'Quên mật khẩu - Gửi OTP qua email',
          body: {
            email: 'string (required)'
          }
        },
        resetPassword: {
          method: 'POST',
          path: '/api/auth/reset-password',
          description: 'Đặt lại mật khẩu với OTP',
          body: {
            email: 'string (required)',
            otp: 'string (required)',
            newPassword: 'string (required)',
            confirmPassword: 'string (required)'
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
          description: 'Cập nhật thông tin profile (Task 8)',
          headers: {
            Authorization: 'Bearer <token>'
          },
          body: {
            name: 'string (optional)',
            age: 'number (optional)'
          }
        },
        uploadAvatar: {
          method: 'POST',
          path: '/api/users/avatar',
          description: 'Upload avatar (Task 9)',
          headers: {
            Authorization: 'Bearer <token>',
            'Content-Type': 'multipart/form-data'
          },
          body: {
            avatar: 'file (required, max 5MB, JPEG/PNG/GIF/WEBP)'
          }
        },
        deleteAvatar: {
          method: 'DELETE',
          path: '/api/users/avatar',
          description: 'Xóa avatar (Task 9)',
          headers: {
            Authorization: 'Bearer <token>'
          }
        }
      },
      staticFiles: {
        avatars: {
          path: '/uploads/avatars/:filename',
          description: 'Truy cập ảnh avatar đã upload',
          example: 'http://localhost:1124/uploads/avatars/677abc123_1729333635456.jpg'
        }
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

    console.log(`User ${user.email} đã cập nhật profile`);

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
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
  console.log(`Static files được serve tại: http://localhost:${PORT}/uploads`);
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
  console.log(`✅ CORS enabled for: http://localhost:3000`);
});