const User = require('../models/User');

/**
 * ==========================================
 * TASK 11: STREAK SYSTEM - Theo dõi số ngày học liên tục
 * ==========================================
 * 
 * API Test:
 * POST /api/streak/update
 * Headers: Authorization: Bearer {token}
 * Body: (không cần)
 * 
 * Test Cases:
 * 1. Học lần đầu tiên -> streak = 1
 * 2. Học liên tiếp hôm sau -> streak tăng
 * 3. Bỏ lỡ 1 ngày -> streak reset về 1
 * 4. Học lại trong cùng ngày -> streak không đổi
 */

// Helper function để lấy thời điểm bắt đầu của một ngày (00:00:00)
function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Cập nhật streak khi người dùng hoàn thành bài học
 * - Lần đầu học: streak = 1
 * - Học liên tiếp: streak tăng
 * - Bỏ lỡ ngày: streak reset về 1
 */
exports.updateStreak = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User ID không hợp lệ' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    // Khởi tạo streak nếu chưa có
    if (!user.streak) {
      user.streak = { count: 0, lastActivityDate: null };
    }

    const today = startOfDay(new Date());
    const lastActivity = user.streak.lastActivityDate ? startOfDay(user.streak.lastActivityDate) : null;

    // Trường hợp đã học trong ngày hôm nay, không làm gì cả
    if (lastActivity && lastActivity.getTime() === today.getTime()) {
      return res.status(200).json({
        success: true,
        streak: user.streak.count,
        lastActivityDate: user.streak.lastActivityDate,
        message: 'Streak đã được cập nhật trong ngày hôm nay'
      });
    }

    if (!lastActivity) {
      // Lần đầu tiên học
      user.streak.count = 1;
    } else {
      // Tính số ngày chênh lệch
      const diffMs = today.getTime() - lastActivity.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Học liên tiếp, tăng streak
        user.streak.count += 1;
      } else {
        // Bỏ lỡ ít nhất một ngày, reset streak về 1
        user.streak.count = 1;
      }
    }

    // Cập nhật ngày hoạt động cuối cùng và lưu lại
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

/**
 * Lấy thông tin streak của người dùng
 * 
 * API Test:
 * GET /api/streak
 * Headers: Authorization: Bearer {token}
 * 
 * Response:
 * {
 *   "success": true,
 *   "streak": {
 *     "count": 5,
 *     "lastActivityDate": "2025-01-15T00:00:00.000Z"
 *   }
 * }
 */
exports.getStreak = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User ID không hợp lệ' });
    }

    const user = await User.findById(userId).select('streak');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    // Trả về streak mặc định nếu người dùng chưa có
    const streak = user.streak || { count: 0, lastActivityDate: null };
    return res.status(200).json({ success: true, streak });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin streak:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};