require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const connectDatabase = require('./config/database');
const authRoutes = require('./src/routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Kết nối Database
connectDatabase();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

// Route mặc định
app.get('/', (req, res) => {
  res.json({ 
    message: 'Chào mừng đến với API Đăng ký Tài khoản',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login'
    }
  });
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});