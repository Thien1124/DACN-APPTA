const jwt = require('jsonwebtoken');
const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');

/**
 * Middleware xác thực JWT token
 * Kiểm tra token có trong blacklist không
 */
const authenticate = async (req, res, next) => {
  try {
    // Lấy token từ header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token xác thực. Vui lòng đăng nhập.'
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Kiểm tra token có trong blacklist không
    const isBlacklisted = await TokenBlacklist.findOne({ token });

    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token đã bị vô hiệu hóa. Vui lòng đăng nhập lại.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');

    // Tìm user từ ID trong token
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ hoặc user không tồn tại.'
      });
    }

    // Kiểm tra user có active không
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị vô hiệu hóa.'
      });
    }

    // Gán user vào req
    req.user = user;
    next();
  } catch (error) {
    console.error('Lỗi xác thực JWT:', error.message);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hạn. Vui lòng đăng nhập lại.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi xác thực token.'
    });
  }
};

/**
 * Middleware kiểm tra role
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Bạn không có quyền truy cập. Yêu cầu role: ${roles.join(', ')}`
      });
    }
    next();
  };
};

module.exports = { authenticate, authorizeRoles };