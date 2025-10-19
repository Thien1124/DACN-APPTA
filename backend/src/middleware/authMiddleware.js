const jwt = require('jsonwebtoken');
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
    }
    next();
  };
};