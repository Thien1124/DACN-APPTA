const validator = require('validator');

// Kiểm tra dữ liệu đăng ký
const validateRegistration = (req, res, next) => {
  const { name, email, phone, password } = req.body;
  const errors = [];

  // Kiểm tra tên
  if (!name || name.trim().length < 2) {
    errors.push('Tên phải có ít nhất 2 ký tự');
  }

  // Kiểm tra email (nếu có)
  if (email && !validator.isEmail(email)) {
    errors.push('Email không hợp lệ');
  }

  // Kiểm tra số điện thoại (nếu có)
  if (phone && !validator.isMobilePhone(phone, 'vi-VN')) {
    errors.push('Số điện thoại không hợp lệ');
  }

  // Phải có ít nhất email hoặc số điện thoại
  if (!email && !phone) {
    errors.push('Phải cung cấp ít nhất email hoặc số điện thoại');
  }

  // Kiểm tra mật khẩu
  if (!password || password.length < 6) {
    errors.push('Mật khẩu phải có ít nhất 6 ký tự');
  }

  // Nếu có lỗi, trả về lỗi
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors: errors
    });
  }

  next(); // Tiếp tục xử lý
};

module.exports = { validateRegistration };