const validator = require('validator');

// Kiểm tra dữ liệu đăng ký
const validateRegistration = (req, res, next) => {
  const { name, email, phone, password, age } = req.body;
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
  
  // Kiểm tra tuổi (đã sửa)
  if (age !== undefined && age !== null && age !== '') {
    const ageNumber = Number(age);
    if (!Number.isInteger(ageNumber)) {
      errors.push('Tuổi phải là số nguyên');
    } else {
      if (ageNumber < 0 || ageNumber > 120) {
        errors.push('Tuổi phải nằm trong khoảng từ 0 đến 120');
      }
    }
  }

  // Nếu có lỗi, trả về lỗi
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors: errors
    });
  }
  
  // Chuyển đổi age sang number
  if (age !== undefined && age !== null && age !== '') {
    req.body.age = Number(age);
  }

  next();
};

// Kiểm tra dữ liệu đăng nhập
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) {
    errors.push('Email là bắt buộc');
  } else if (!validator.isEmail(email)) {
    errors.push('Email không hợp lệ');
  }

  if (!password) {
    errors.push('Mật khẩu là bắt buộc');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors: errors
    });
  }

  next();
};


module.exports = { 
  validateRegistration,
  validateLogin 

//  Thêm validation cho login
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Kiểm tra email
  if (!email || email.trim() === '') {
    errors.push('Email không được để trống');
  }

  // Kiểm tra password
  if (!password || password.trim() === '') {
    errors.push('Mật khẩu không được để trống');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  next();
};

module.exports = { 
  validateRegistration,
  validateLogin 
};