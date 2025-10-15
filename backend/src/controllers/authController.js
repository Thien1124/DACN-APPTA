const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Tạo JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Đăng ký người dùng mới
const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Kiểm tra email đã tồn tại chưa
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email đã được sử dụng'
        });
      }
    }

    // Kiểm tra số điện thoại đã tồn tại chưa
    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: 'Số điện thoại đã được sử dụng'
        });
      }
    }

    // Tạo user mới
    const user = await User.create({
      name: name.trim(),
      email: email || undefined,
      phone: phone || undefined,
      password
    });

    // Tạo JWT token
    const token = generateToken(user._id);

    // Trả về thông tin user (không có password)
    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt
        },
        token
      }
    });

  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    
    // Xử lý lỗi validation của Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi đăng ký'
    });
  }
};

// Login - sẽ implement sau
const login = async (req, res) => {
  res.json({ message: 'Login endpoint - coming soon' });
};

module.exports = { register, login };