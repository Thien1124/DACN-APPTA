const deviceService = require('../services/deviceService');
const { logAudit, getIpAddress, getUserAgent } = require('../services/auditService'); // Task 11: Audit logging

/**
 * @route   GET /api/devices/sessions
 * @desc    Get all active sessions for current user
 * @desc    Lấy tất cả phiên hoạt động của người dùng hiện tại
 * @access  Private
 */
const getSessions = async (req, res) => {
  try {
    const userId = req.user._id;
    const includeExpired = req.query.includeExpired === 'true';
    
    const sessions = await deviceService.getUserSessions(userId, includeExpired);
    
    // Mark current session
    const currentSessionId = req.session?._id?.toString();
    const sessionsWithCurrent = sessions.map(session => ({
      ...session,
      isCurrent: session._id.toString() === currentSessionId
    }));
    
    res.json({
      success: true,
      message: 'Sessions retrieved successfully',
      messageVietnamese: 'Lấy danh sách phiên thành công',
      data: {
        sessions: sessionsWithCurrent,
        total: sessionsWithCurrent.length
      }
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get sessions',
      messageVietnamese: 'Không thể lấy danh sách phiên'
    });
  }
};

/**
 * @route   GET /api/devices/sessions/current
 * @desc    Get current session details
 * @desc    Lấy chi tiết phiên hiện tại
 * @access  Private
 */
const getCurrentSession = async (req, res) => {
  try {
    const session = req.session;
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Current session not found',
        messageVietnamese: 'Không tìm thấy phiên hiện tại'
      });
    }
    
    res.json({
      success: true,
      message: 'Current session retrieved',
      messageVietnamese: 'Lấy phiên hiện tại thành công',
      data: session
    });
  } catch (error) {
    console.error('Get current session error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get current session',
      messageVietnamese: 'Không thể lấy phiên hiện tại'
    });
  }
};

/**
 * @route   POST /api/devices/sessions/:sessionId/revoke
 * @desc    Revoke a specific session (remote logout)
 * @desc    Thu hồi phiên cụ thể (đăng xuất từ xa)
 * @access  Private
 */
const revokeSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.params;
    const { reason } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required',
        messageVietnamese: 'ID phiên là bắt buộc'
      });
    }
    
    // Prevent revoking current session
    if (req.session && req.session._id.toString() === sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot revoke current session. Use logout instead.',
        messageVietnamese: 'Không thể thu hồi phiên hiện tại. Vui lòng sử dụng đăng xuất.'
      });
    }
    
    const session = await deviceService.revokeSession(
      userId,
      sessionId,
      reason || 'Manual revocation by user'
    );
    
    res.json({
      success: true,
      message: 'Session revoked successfully',
      messageVietnamese: 'Thu hồi phiên thành công',
      data: {
        sessionId: session._id,
        status: session.status,
        revokedAt: session.revokedAt
      }
    });
  } catch (error) {
    console.error('Revoke session error:', error);
    
    // Specific error messages
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: 'Session not found. It may have been deleted or never existed.',
        messageVietnamese: 'Không tìm thấy phiên. Phiên có thể đã bị xóa hoặc không tồn tại.',
        debug: {
          sessionId: req.params.sessionId,
          userId: req.user._id
        }
      });
    }
    
    if (error.message.includes('does not belong')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to revoke this session.',
        messageVietnamese: 'Bạn không có quyền thu hồi phiên này.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to revoke session',
      messageVietnamese: error.message || 'Không thể thu hồi phiên'
    });
  }
};

/**
 * @route   POST /api/devices/sessions/revoke-all
 * @desc    Revoke all sessions except current (logout from all other devices)
 * @desc    Thu hồi tất cả phiên trừ phiên hiện tại (đăng xuất khỏi tất cả thiết bị khác)
 * @access  Private
 */
const revokeAllOtherSessions = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Try to get current session from req.session (set by auth middleware)
    let currentSessionId = req.session?._id;
    
    // If not available, try to find it by JWT token
    if (!currentSessionId) {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        const DeviceSession = require('../models/DeviceSession').DeviceSession;
        const currentSession = await DeviceSession.findOne({
          user: userId,
          jwtToken: token,
          status: 'active'
        });
        
        if (currentSession) {
          currentSessionId = currentSession._id;
          console.log(`[INFO] Found current session by token: ${currentSessionId}`);
        }
      }
    }
    
    // If still no current session, revoke all sessions
    if (!currentSessionId) {
      console.warn(`[WARN] No current session found, revoking ALL sessions for user ${userId}`);
      const result = await deviceService.revokeAllSessions(userId);
      
      return res.json({
        success: true,
        message: `Successfully logged out from all ${result.revokedCount} device(s). Please login again.`,
        messageVietnamese: `Đã đăng xuất thành công khỏi tất cả ${result.revokedCount} thiết bị. Vui lòng đăng nhập lại.`,
        data: {
          ...result,
          warning: 'All sessions revoked including current'
        }
      });
    }
    
    const result = await deviceService.revokeAllSessionsExceptCurrent(userId, currentSessionId);
    
    res.json({
      success: true,
      message: `Successfully logged out from ${result.revokedCount} device(s)`,
      messageVietnamese: `Đã đăng xuất thành công khỏi ${result.revokedCount} thiết bị`,
      data: result
    });
  } catch (error) {
    console.error('Revoke all other sessions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to revoke sessions',
      messageVietnamese: 'Không thể thu hồi các phiên'
    });
  }
};

/**
 * @route   POST /api/devices/sessions/:sessionId/verify
 * @desc    Verify and trust a device
 * @desc    Xác minh và tin tưởng thiết bị
 * @access  Private
 */
const verifyDevice = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.params;
    const { verificationCode } = req.body;
    
    const session = await deviceService.verifyDevice(userId, sessionId, verificationCode);
    
    res.json({
      success: true,
      message: 'Device verified and trusted successfully',
      messageVietnamese: 'Xác minh và tin tưởng thiết bị thành công',
      data: {
        sessionId: session._id,
        isTrusted: session.isTrusted,
        verifiedAt: session.verifiedAt
      }
    });
  } catch (error) {
    console.error('Verify device error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify device',
      messageVietnamese: 'Không thể xác minh thiết bị'
    });
  }
};

/**
 * @route   GET /api/devices/trusted
 * @desc    Get all trusted devices
 * @desc    Lấy tất cả thiết bị đáng tin cậy
 * @access  Private
 */
const getTrustedDevices = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const devices = await deviceService.getTrustedDevices(userId);
    
    res.json({
      success: true,
      message: 'Trusted devices retrieved successfully',
      messageVietnamese: 'Lấy danh sách thiết bị đáng tin cậy thành công',
      data: {
        devices,
        total: devices.length
      }
    });
  } catch (error) {
    console.error('Get trusted devices error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get trusted devices',
      messageVietnamese: 'Không thể lấy danh sách thiết bị đáng tin cậy'
    });
  }
};

/**
 * @route   DELETE /api/devices/trusted/:deviceId
 * @desc    Revoke trust for a device
 * @desc    Thu hồi lòng tin cho thiết bị
 * @access  Private
 */
const revokeTrustedDevice = async (req, res) => {
  try {
    const userId = req.user._id;
    const { deviceId } = req.params;
    const { reason } = req.body;
    
    const device = await deviceService.revokeTrustedDevice(
      userId,
      deviceId,
      reason || 'Trust revoked by user'
    );
    
    res.json({
      success: true,
      message: 'Device trust revoked successfully',
      messageVietnamese: 'Thu hồi lòng tin thiết bị thành công',
      data: {
        deviceId: device._id,
        trustLevel: device.trustLevel,
        revokedAt: device.revokedAt
      }
    });
  } catch (error) {
    console.error('Revoke trusted device error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to revoke device trust',
      messageVietnamese: 'Không thể thu hồi lòng tin thiết bị'
    });
  }
};

/**
 * @route   GET /api/devices/history
 * @desc    Get login history
 * @desc    Lấy lịch sử đăng nhập
 * @access  Private
 */
const getLoginHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 50;
    const filters = {
      status: req.query.status,
      isSuspicious: req.query.isSuspicious === 'true' ? true : req.query.isSuspicious === 'false' ? false : undefined,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };
    
    const history = await deviceService.getLoginHistory(userId, limit, filters);
    
    res.json({
      success: true,
      message: 'Login history retrieved successfully',
      messageVietnamese: 'Lấy lịch sử đăng nhập thành công',
      data: {
        history,
        total: history.length
      }
    });
  } catch (error) {
    console.error('Get login history error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get login history',
      messageVietnamese: 'Không thể lấy lịch sử đăng nhập'
    });
  }
};

/**
 * @route   GET /api/devices/suspicious
 * @desc    Get suspicious sessions
 * @desc    Lấy các phiên đáng ngờ
 * @access  Private
 */
const getSuspiciousSessions = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const sessions = await deviceService.getSuspiciousSessions(userId);
    
    res.json({
      success: true,
      message: 'Suspicious sessions retrieved successfully',
      messageVietnamese: 'Lấy các phiên đáng ngờ thành công',
      data: {
        sessions,
        total: sessions.length,
        warning: sessions.length > 0 ? 'Suspicious activity detected. Please review and revoke if necessary.' : null,
        warningVietnamese: sessions.length > 0 ? 'Phát hiện hoạt động đáng ngờ. Vui lòng xem xét và thu hồi nếu cần thiết.' : null
      }
    });
  } catch (error) {
    console.error('Get suspicious sessions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get suspicious sessions',
      messageVietnamese: 'Không thể lấy các phiên đáng ngờ'
    });
  }
};

/**
 * @route   GET /api/devices/statistics
 * @desc    Get session statistics
 * @desc    Lấy thống kê phiên
 * @access  Private
 */
const getStatistics = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const stats = await deviceService.getSessionStatistics(userId);
    
    res.json({
      success: true,
      message: 'Session statistics retrieved successfully',
      messageVietnamese: 'Lấy thống kê phiên thành công',
      data: stats
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get statistics',
      messageVietnamese: 'Không thể lấy thống kê'
    });
  }
};

/**
 * @route   POST /api/devices/cleanup
 * @desc    Clean up expired sessions (admin only)
 * @desc    Dọn dẹp các phiên hết hạn (chỉ admin)
 * @access  Private/Admin
 */
const cleanupExpiredSessions = async (req, res) => {
  try {
    const result = await deviceService.cleanupExpiredSessions();
    
    res.json({
      success: true,
      message: `Cleaned up ${result.expiredCount} expired session(s)`,
      messageVietnamese: `Đã dọn dẹp ${result.expiredCount} phiên hết hạn`,
      data: result
    });
  } catch (error) {
    console.error('Cleanup expired sessions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cleanup expired sessions',
      messageVietnamese: 'Không thể dọn dẹp các phiên hết hạn'
    });
  }
};

/**
 * @route   GET /api/devices/debug/all
 * @desc    Get all sessions in database (for debugging)
 * @desc    Lấy tất cả phiên trong database (để debug)
 * @access  Private
 */
const debugGetAllSessions = async (req, res) => {
  try {
    const DeviceSession = require('../models/DeviceSession').DeviceSession;
    const token = req.headers.authorization?.split(' ')[1];
    
    const allSessions = await DeviceSession.find({ user: req.user._id })
      .select('+jwtToken') // Include token for debugging
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      message: 'All sessions retrieved (DEBUG MODE)',
      data: {
        sessions: allSessions.map(s => ({
          _id: s._id,
          deviceName: s.deviceInfo?.deviceName,
          status: s.status,
          createdAt: s.createdAt,
          expiresAt: s.expiresAt,
          isExpired: s.expiresAt < new Date(),
          jwtTokenPreview: s.jwtToken?.substring(0, 30) + '...',
          jwtTokenMatch: s.jwtToken === token,
          isCurrent: req.session?._id?.toString() === s._id.toString()
        })),
        total: allSessions.length,
        currentSessionId: req.session?._id,
        currentTokenPreview: token?.substring(0, 30) + '...',
        userId: req.user._id
      }
    });
  } catch (error) {
    console.error('Debug get all sessions error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getSessions,
  getCurrentSession,
  revokeSession,
  revokeAllOtherSessions,
  verifyDevice,
  getTrustedDevices,
  revokeTrustedDevice,
  getLoginHistory,
  getSuspiciousSessions,
  getStatistics,
  cleanupExpiredSessions,
  debugGetAllSessions // Add debug endpoint
};
