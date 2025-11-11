const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const { protect } = require('../middleware/auth');

/**
 * Session Management Routes
 * Routes quản lý phiên
 */

// @route   GET /api/devices/sessions
// @desc    Get all active sessions for current user
// @desc    Lấy tất cả phiên hoạt động của người dùng hiện tại
// @access  Private
router.get('/sessions', protect, deviceController.getSessions);

// @route   GET /api/devices/sessions/current
// @desc    Get current session details
// @desc    Lấy chi tiết phiên hiện tại
// @access  Private
router.get('/sessions/current', protect, deviceController.getCurrentSession);

// @route   POST /api/devices/sessions/:sessionId/revoke
// @desc    Revoke a specific session (remote logout)
// @desc    Thu hồi phiên cụ thể (đăng xuất từ xa)
// @access  Private
router.post('/sessions/:sessionId/revoke', protect, deviceController.revokeSession);

// @route   POST /api/devices/sessions/revoke-all
// @desc    Revoke all sessions except current (logout from all other devices)
// @desc    Thu hồi tất cả phiên trừ phiên hiện tại (đăng xuất khỏi tất cả thiết bị khác)
// @access  Private
router.post('/sessions/revoke-all', protect, deviceController.revokeAllOtherSessions);

// @route   POST /api/devices/sessions/:sessionId/verify
// @desc    Verify and trust a device
// @desc    Xác minh và tin tưởng thiết bị
// @access  Private
router.post('/sessions/:sessionId/verify', protect, deviceController.verifyDevice);

/**
 * Trusted Devices Routes
 * Routes thiết bị đáng tin cậy
 */

// @route   GET /api/devices/trusted
// @desc    Get all trusted devices
// @desc    Lấy tất cả thiết bị đáng tin cậy
// @access  Private
router.get('/trusted', protect, deviceController.getTrustedDevices);

// @route   DELETE /api/devices/trusted/:deviceId
// @desc    Revoke trust for a device
// @desc    Thu hồi lòng tin cho thiết bị
// @access  Private
router.delete('/trusted/:deviceId', protect, deviceController.revokeTrustedDevice);

/**
 * Security & Monitoring Routes
 * Routes bảo mật và giám sát
 */

// @route   GET /api/devices/history
// @desc    Get login history
// @desc    Lấy lịch sử đăng nhập
// @access  Private
router.get('/history', protect, deviceController.getLoginHistory);

// @route   GET /api/devices/suspicious
// @desc    Get suspicious sessions
// @desc    Lấy các phiên đáng ngờ
// @access  Private
router.get('/suspicious', protect, deviceController.getSuspiciousSessions);

// @route   GET /api/devices/statistics
// @desc    Get session statistics
// @desc    Lấy thống kê phiên
// @access  Private
router.get('/statistics', protect, deviceController.getStatistics);

/**
 * Admin Routes
 * Routes quản trị
 */

// @route   POST /api/devices/cleanup
// @desc    Clean up expired sessions (admin only)
// @desc    Dọn dẹp các phiên hết hạn (chỉ admin)
// @access  Private/Admin
router.post('/cleanup', protect, deviceController.cleanupExpiredSessions);

/**
 * Debug Routes
 * Routes gỡ lỗi
 */

// @route   GET /api/devices/debug/all
// @desc    Get all sessions including expired (for debugging)
// @desc    Lấy tất cả phiên bao gồm hết hạn (để debug)
// @access  Private
router.get('/debug/all', protect, deviceController.debugGetAllSessions);

module.exports = router;
