const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const Notification = require('../models/Notification');
const {
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
  sendSystemUpdateNotification
} = require('../services/notificationService');

/**
 * GET /api/notifications
 * Lấy danh sách thông báo của user
 * Query: page, limit, type, isRead
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      isRead
    } = req.query;

    const query = { userId: req.user._id };

    if (type) {
      query.type = type;
    }

    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false
    });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy thông báo'
    });
  }
});

/**
 * GET /api/notifications/unread-count
 * Lấy số lượng thông báo chưa đọc
 */
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false
    });

    res.json({
      success: true,
      data: {
        unreadCount: count
      }
    });
  } catch (error) {
    console.error('❌ Error counting unread notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi'
    });
  }
});

/**
 * GET /api/notifications/:id
 * Lấy chi tiết 1 thông báo
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông báo'
      });
    }

    res.json({
      success: true,
      data: {
        notification
      }
    });
  } catch (error) {
    console.error('❌ Error fetching notification:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi'
    });
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Đánh dấu đã đọc
 */
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    const notification = await markAsRead(req.params.id, req.user._id);

    res.json({
      success: true,
      message: 'Đã đánh dấu đã đọc',
      data: {
        notification
      }
    });
  } catch (error) {
    console.error('❌ Error marking as read:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Không tìm thấy thông báo'
    });
  }
});

/**
 * PATCH /api/notifications/read-all
 * Đánh dấu tất cả đã đọc
 */
router.patch('/read-all', authenticate, async (req, res) => {
  try {
    const result = await markAllAsRead(req.user._id);

    res.json({
      success: true,
      message: 'Đã đánh dấu tất cả đã đọc',
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('❌ Error marking all as read:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi'
    });
  }
});

/**
 * DELETE /api/notifications/:id
 * Xóa thông báo
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const notification = await deleteNotification(req.params.id, req.user._id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông báo'
      });
    }

    res.json({
      success: true,
      message: 'Đã xóa thông báo'
    });
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi'
    });
  }
});

/**
 * DELETE /api/notifications/read
 * Xóa tất cả thông báo đã đọc
 */
router.delete('/read/all', authenticate, async (req, res) => {
  try {
    const result = await deleteReadNotifications(req.user._id);

    res.json({
      success: true,
      message: 'Đã xóa tất cả thông báo đã đọc',
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    console.error('❌ Error deleting read notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi'
    });
  }
});

/**
 * POST /api/notifications/system
 * Gửi thông báo hệ thống (Admin only)
 * Body: { title, message, userIds, priority }
 */
router.post('/system', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { title, message, userIds = 'all', priority = 'NORMAL' } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp title và message'
      });
    }

    const notifications = await sendSystemUpdateNotification({
      title,
      message,
      userIds,
      priority
    });

    res.json({
      success: true,
      message: 'Đã gửi thông báo hệ thống',
      data: {
        count: Array.isArray(notifications) ? notifications.length : 1
      }
    });
  } catch (error) {
    console.error('❌ Error sending system notification:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi gửi thông báo'
    });
  }
});

module.exports = router;