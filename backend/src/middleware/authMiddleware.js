const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');

// Bảo vệ các routes - Yêu cầu đăng nhập và token hợp lệ
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
    return next(new ErrorResponse('Không có quyền truy cập, vui lòng đăng nhập', 401));
  }

  try {
    // Kiểm tra xem token có trong blacklist không (đã logout)
    const blacklistedToken = await TokenBlacklist.findOne({ token });
    if (blacklistedToken) {
      return next(new ErrorResponse('Token không hợp lệ hoặc đã hết hạn', 401));
    }

    // Xác minh token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Lấy thông tin user từ token và gán vào request
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new ErrorResponse('Không tìm thấy người dùng với token này', 404));
    }

    next();
  } catch (err) {
    return next(new ErrorResponse('Token không hợp lệ hoặc đã hết hạn', 401));
  }
});

// Cấp quyền truy cập cho các vai trò (role) cụ thể
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
        // Mặc dù protect đã chạy, đây là một bước kiểm tra an toàn bổ sung
        return next(new ErrorResponse('Người dùng chưa được xác thực', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `Vai trò '${req.user.role}' không có quyền truy cập vào tài nguyên này`,
          403 // 403 Forbidden - Lỗi cấm truy cập
        )
      );
    }
    next();
  };
};