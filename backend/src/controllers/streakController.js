const User = require('../models/User');

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Cập nhật streak khi người dùng hoàn thành bài học
exports.updateStreak = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    const today = startOfDay(new Date());
    const lastActivity = user.streak && user.streak.lastActivityDate ? startOfDay(user.streak.lastActivityDate) : null;

    if (!user.streak) {
      user.streak = { count: 0, lastActivityDate: null };
    }

    if (lastActivity && lastActivity.getTime() === today.getTime()) {
      // Đã học trong ngày hôm nay, không thay đổi streak
      return res.status(200).json({
        success: true,
        streak: user.streak.count,
        lastActivityDate: user.streak.lastActivityDate,
        message: 'Streak đã được cập nhật trong ngày hôm nay'
      });
    }

    if (!lastActivity) {
      // Lần đầu học
      user.streak.count = 1;
    } else {
      const diffMs = today.getTime() - lastActivity.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        user.streak.count += 1;
      } else {
        // Bỏ lỡ >= 1 ngày, reset về 1
        user.streak.count = 1;
      }
    }

    user.streak.lastActivityDate = today;
    await user.save();

    return res.status(200).json({
      success: true,
      streak: user.streak.count,
      lastActivityDate: user.streak.lastActivityDate,
      message: 'Streak đã được cập nhật thành công'
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật streak:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Lấy thông tin streak của người dùng
exports.getStreak = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    const user = await User.findById(userId).select('streak');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    const streak = user.streak || { count: 0, lastActivityDate: null };
    return res.status(200).json({ success: true, streak });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin streak:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};