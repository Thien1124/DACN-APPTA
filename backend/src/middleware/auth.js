const jwt = require('jsonwebtoken');
const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');
const { DeviceSession } = require('../models/DeviceSession');
const deviceService = require('../services/deviceService');

/**
 * Middleware xác thực JWT token
 * Kiểm tra:
 * - Token có tồn tại và đúng format không
 * - Token có trong blacklist không (đã logout)
 * - Token có hợp lệ không (verify)
 * - User có tồn tại và active không
 */
const authenticate = async (req, res, next) => {
  try {
    // Bước 1: Kiểm tra Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Không có token xác thực. Vui lòng đăng nhập.'
      });
    }

    // Bước 2: Extract token
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ.'
      });
    }

    // Bước 3: Kiểm tra token có trong blacklist không
    const isBlacklisted = await TokenBlacklist.findOne({ token });

    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token đã bị vô hiệu hóa. Vui lòng đăng nhập lại.'
      });
    }

    // Bước 4: Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');

    // Bước 5: Tìm user từ ID trong token
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ hoặc user không tồn tại.'
      });
    }

    // Bước 6: Kiểm tra user có active không
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ admin.'
      });
    }

    // Bước 7: Kiểm tra và cập nhật device session (Task 33)
    try {
      // Tìm session từ token
      const session = await DeviceSession.findOne({
        user: user._id,
        jwtToken: token,
        status: 'active',
        expiresAt: { $gt: new Date() }
      });

      if (session) {
        // Update last activity
        await deviceService.updateSessionActivity(
          session._id,
          'activity',
          req.ip || req.connection.remoteAddress
        );
        
        // Attach session to request
        req.session = session;
        
        // Check if session is suspicious
        if (session.suspiciousActivity?.isSuspicious) {
          console.warn(`⚠️ Suspicious session detected: ${session._id}`);
          // Could optionally block or require additional verification
        }
      } else {
        // Session not found or expired - allow but log warning
        console.warn(`⚠️ Valid JWT but no active session found for user ${user._id}`);
      }
    } catch (sessionError) {
      // Don't block request if session check fails, just log
      console.error('Session check error:', sessionError);
    }

    // Bước 8: Gán user vào request object
    req.user = user;
    next();

  } catch (error) {
    console.error('Lỗi xác thực JWT:', error.message);

    // Xử lý các loại lỗi khác nhau
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

    // Lỗi khác
    return res.status(500).json({
      success: false,
      message: 'Lỗi xác thực token.'
    });
  }
};

/**
 * Middleware kiểm tra role
 * 
 * Usage:
 * router.delete('/users/:id', authenticate, authorize('admin'), deleteUser);
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Chưa xác thực. Vui lòng đăng nhập.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Không có quyền truy cập. Yêu cầu role: ${roles.join(' hoặc ')}`
      });
    }

    next();
  };
};

/**
 * Middleware kiểm tra user đã verify email chưa
 */
const requireEmailVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Chưa xác thực. Vui lòng đăng nhập.'
    });
  }

  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Vui lòng xác thực email trước khi sử dụng tính năng này.'
    });
  }

  next();
};

module.exports = {
  authenticate,
  protect: authenticate, // Alias for backward compatibility
  authorize,
  requireEmailVerified
};