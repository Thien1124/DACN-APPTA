const mongoose = require('mongoose'); 
const Goal = require('../models/Goal');
const { validationResult } = require('express-validator');

// @desc    Tạo mục tiêu mới
// @route   POST /api/goals
// @access  Private
exports.createGoal = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { 
      title, 
      description, 
      type, 
      target, 
      deadline,
      courseId,
      skill,
      // ✅ Thêm Pomodoro fields
      workDuration,
      shortBreakDuration,
      longBreakInterval,
      longBreakDuration
    } = req.body;

    // Kiểm tra deadline phải là tương lai
    // ✅ Chỉ validate deadline cho type khác POMODORO
    if (type !== 'POMODORO' && (!deadline || new Date(deadline) <= new Date())) {
      return res.status(400).json({
        success: false,
        message: 'Deadline phải là thời gian trong tương lai'
      });
    }

    // ✅ Set deadline mặc định cho POMODORO (cuối ngày hôm nay)
    let finalDeadline = deadline;
    if (type === 'POMODORO' && !deadline) {
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Cuối ngày hôm nay
      finalDeadline = today;
    }

    const goal = await Goal.create({
      user: req.user.id,
      title,
      description,
      type,
      target,
      deadline: finalDeadline,
      courseId,
      skill,
      // ✅ Thêm Pomodoro fields với default values
      workDuration: workDuration || 25,
      shortBreakDuration: shortBreakDuration || 5,
      longBreakInterval: longBreakInterval || 4,
      longBreakDuration: longBreakDuration || 15
    });

    res.status(201).json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error('[ERROR] Create goal:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo mục tiêu',
      error: error.message
    });
  }
};

// @desc    Lấy danh sách mục tiêu
// @route   GET /api/goals
// @access  Private
exports.getGoals = async (req, res) => {
  try {
    const { status, type, skill } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = { user: req.user.id };
    
    if (status) query.status = status;
    if (type) query.type = type;
    if (skill) query.skill = skill;

    const goals = await Goal.find(query)
      .populate('courseId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Goal.countDocuments(query);

    res.json({
      success: true,
      count: goals.length,
      data: {
        goals,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('[ERROR] Get goals:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách mục tiêu',
      error: error.message
    });
  }
};

// @desc    Lấy chi tiết mục tiêu
// @route   GET /api/goals/:id
// @access  Private
exports.getGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id)
      .populate('courseId', 'title description');

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mục tiêu'
      });
    }

    // Kiểm tra quyền truy cập
    if (goal.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập mục tiêu này'
      });
    }

    res.json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error('[ERROR] Get goal:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin mục tiêu',
      error: error.message
    });
  }
};

// @desc    Cập nhật mục tiêu
// @route   PUT /api/goals/:id
// @access  Private
exports.updateGoal = async (req, res) => {
  try {
    let goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mục tiêu'
      });
    }

    // Kiểm tra quyền
    if (goal.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền cập nhật mục tiêu này'
      });
    }

    const { 
      title, 
      description, 
      target, 
      deadline, 
      status, 
      current,
      // ✅ Thêm Pomodoro fields
      workDuration,
      shortBreakDuration,
      longBreakInterval,
      longBreakDuration
    } = req.body;

    // Chỉ cho phép cập nhật một số field
    if (title) goal.title = title;
    if (description) goal.description = description;
    if (target) goal.target = target;
    if (deadline) {
      if (new Date(deadline) <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Deadline phải là thời gian trong tương lai'
        });
      }
      goal.deadline = deadline;
    }
    if (status) goal.status = status;
    if (typeof current === 'number') goal.current = current;
    
    // ✅ Cập nhật Pomodoro fields
    if (workDuration) goal.workDuration = workDuration;
    if (shortBreakDuration) goal.shortBreakDuration = shortBreakDuration;
    if (longBreakInterval) goal.longBreakInterval = longBreakInterval;
    if (longBreakDuration) goal.longBreakDuration = longBreakDuration;

    await goal.save();

    res.json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error('[ERROR] Update goal:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật mục tiêu',
      error: error.message
    });
  }
};

// @desc    Cập nhật tiến độ mục tiêu
// @route   PUT /api/goals/:id/progress
// @access  Private
exports.updateProgress = async (req, res) => {
  try {
    const { increment } = req.body;

    if (!increment || increment <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Giá trị increment phải lớn hơn 0'
      });
    }

    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mục tiêu'
      });
    }

    if (goal.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền cập nhật mục tiêu này'
      });
    }

    goal.current = Math.min(goal.current + increment, goal.target);
    await goal.save();

    res.json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error('[ERROR] Update progress:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật tiến độ',
      error: error.message
    });
  }
};

// @desc    Xóa mục tiêu
// @route   DELETE /api/goals/:id
// @access  Private
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mục tiêu'
      });
    }

    if (goal.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xóa mục tiêu này'
      });
    }

    await goal.deleteOne();

    res.json({
      success: true,
      message: 'Đã xóa mục tiêu thành công'
    });
  } catch (error) {
    console.error('[ERROR] Delete goal:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa mục tiêu',
      error: error.message
    });
  }
};

// @desc    Thống kê mục tiêu
// @route   GET /api/goals/stats
// @access  Private
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Goal.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },  // ✅ SỬA ĐÂY: thêm 'new'
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgProgress: {
            $avg: {
              $multiply: [
                { $divide: ['$current', '$target'] },
                100
              ]
            }
          }
        }
      }
    ]);

    const total = await Goal.countDocuments({ user: userId });
    const active = await Goal.countDocuments({ user: userId, status: 'ACTIVE' });
    const completed = await Goal.countDocuments({ user: userId, status: 'COMPLETED' });
    const expired = await Goal.countDocuments({ user: userId, status: 'EXPIRED' });

    res.json({
      success: true,
      data: {
        total,
        active,
        completed,
        expired,
        details: stats
      }
    });
  } catch (error) {
    console.error('[ERROR] Get stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê',
      error: error.message
    });
  }
};