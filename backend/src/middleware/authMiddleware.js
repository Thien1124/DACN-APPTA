const jwt = require('jsonwebtoken');
<<<<<<< HEAD
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');

// Bảo vệ các routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Lấy token từ header
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    // Lấy token từ cookie
    token = req.cookies.token;
  }

  // Kiểm tra xem token có tồn tại không
  if (!token) {
    return next(new ErrorResponse('Không có quyền truy cập vào route này', 401));
  }

  try {
    // Kiểm tra xem token có trong blacklist không
    const blacklistedToken = await TokenBlacklist.findOne({ token });
    if (blacklistedToken) {
      return next(new ErrorResponse('Token không hợp lệ hoặc đã hết hạn', 401));
    }

    // Xác minh token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Lấy thông tin user từ token
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new ErrorResponse('Không tìm thấy người dùng với id này', 404));
    }

    next();
  } catch (err) {
    return next(new ErrorResponse('Không có quyền truy cập vào route này', 401));
  }
});

// Cấp quyền truy cập cho các vai trò cụ thể
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse('Không có quyền truy cập vào route này', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `Vai trò ${req.user.role} không có quyền truy cập vào route này`,
          403
        )
      );
=======
const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');

// Bảo vệ routes - Yêu cầu đăng nhập
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Kiểm tra token trong header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Kiểm tra token trong cookie
    else if (req.cookies.token) {
      token = req.cookies.token;
    }

    // Kiểm tra xem token có tồn tại không
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Không có quyền truy cập, vui lòng đăng nhập'
      });
    }

    // Kiểm tra xem token có trong danh sách đen không (đã đăng xuất)
    const blacklistedToken = await TokenBlacklist.findOne({ token });
    if (blacklistedToken) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ, vui lòng đăng nhập lại'
      });
    }

    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kiểm tra xem người dùng có tồn tại không
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy người dùng với token này'
      });
    }

    // Lưu thông tin người dùng vào request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Không có quyền truy cập, vui lòng đăng nhập',
      error: error.message
    });
  }
};

// Kiểm tra quyền người dùng
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Người dùng với vai trò ${req.user.role} không có quyền truy cập vào tài nguyên này`
      });
>>>>>>> main
    }
    next();
  };
};