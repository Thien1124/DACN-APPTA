const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const AuditLog = require('../models/AuditLog');

/**
 * GET /api/audit/logs
 * Lấy audit logs của user hiện tại
 * Query params: page, limit, action, status, startDate, endDate
 */
router.get('/logs', authenticate, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      action, 
      status,
      startDate,
      endDate 
    } = req.query;

    const query = { userId: req.user._id };

    // Filter by action
    if (action) {
      query.action = action;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await AuditLog.countDocuments(query);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Lỗi lấy audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy audit logs'
    });
  }
});

/**
 * GET /api/audit/logs/stats
 * Thống kê audit logs của user hiện tại
 */
router.get('/logs/stats', authenticate, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const stats = await AuditLog.aggregate([
      {
        $match: {
          userId: req.user._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            action: '$action',
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.action',
          total: { $sum: '$count' },
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    // Tổng số actions
    const totalActions = await AuditLog.countDocuments({
      userId: req.user._id,
      createdAt: { $gte: startDate }
    });

    res.json({
      success: true,
      data: {
        stats,
        totalActions,
        period: `${days} days`
      }
    });
  } catch (error) {
    console.error('Lỗi lấy stats:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy stats'
    });
  }
});

/**
 * GET /api/audit/logs/all
 * Lấy tất cả audit logs (Admin only)
 */
router.get('/logs/all', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      userId, 
      action, 
      status,
      startDate,
      endDate
    } = req.query;

    const query = {};

    if (userId) query.userId = userId;
    if (action) query.action = action;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await AuditLog.countDocuments(query);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Lỗi lấy all audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy audit logs'
    });
  }
});

/**
 * GET /api/audit/logs/stats/all
 * Thống kê tổng hợp (Admin only)
 */
router.get('/logs/stats/all', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const stats = await AuditLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            action: '$action',
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Top users
    const topUsers = await AuditLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          userId: '$_id',
          count: 1,
          name: '$user.name',
          email: '$user.email'
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        stats,
        topUsers,
        period: `${days} days`
      }
    });
  } catch (error) {
    console.error('Lỗi lấy stats all:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy stats'
    });
  }
});

module.exports = router;