const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');

// Lấy bảng xếp hạng tổng thể (sắp xếp theo tổng XP)
exports.getOverallLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Leaderboard.find()
      .populate('user', 'name email avatar')
      .sort({ xpTotal: -1 })
      .limit(100);
    
    res.status(200).json({
      success: true,
      count: leaderboard.length,
      data: leaderboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy bảng xếp hạng tổng thể',
      error: error.message
    });
  }
};

// Lấy bảng xếp hạng theo tuần (sắp xếp theo XP tuần)
exports.getWeeklyLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Leaderboard.find()
      .populate('user', 'name email avatar')
      .sort({ weeklyXP: -1 })
      .limit(100);
    
    res.status(200).json({
      success: true,
      count: leaderboard.length,
      data: leaderboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy bảng xếp hạng theo tuần',
      error: error.message
    });
  }
};

// Lấy bảng xếp hạng theo tháng (sắp xếp theo XP tháng)
exports.getMonthlyLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Leaderboard.find()
      .populate('user', 'name email avatar')
      .sort({ monthlyXP: -1 })
      .limit(100);
    
    res.status(200).json({
      success: true,
      count: leaderboard.length,
      data: leaderboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy bảng xếp hạng theo tháng',
      error: error.message
    });
  }
};

// Lấy thông tin bảng xếp hạng của người dùng cụ thể
exports.getUserLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Leaderboard.findOne({ user: req.params.userId })
      .populate('user', 'name email avatar');
    
    if (!leaderboard) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin bảng xếp hạng của người dùng này'
      });
    }
    
    res.status(200).json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin bảng xếp hạng của người dùng',
      error: error.message
    });
  }
};

// Cập nhật XP cho người dùng
exports.updateUserXP = async (req, res) => {
  try {
    const { userId, xpAmount } = req.body;
    
    // Kiểm tra người dùng tồn tại
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng với ID này'
      });
    }
    
    // Tìm hoặc tạo mới bảng xếp hạng cho người dùng
    let leaderboard = await Leaderboard.findOne({ user: userId });
    
    if (!leaderboard) {
      // Tạo mới nếu chưa có
      leaderboard = await Leaderboard.create({
        user: userId,
        xpTotal: xpAmount,
        weeklyXP: xpAmount,
        monthlyXP: xpAmount,
        streak: 1,
        level: 1,
        lastActive: Date.now()
      });
    } else {
      // Cập nhật nếu đã có
      leaderboard.xpTotal += xpAmount;
      leaderboard.weeklyXP += xpAmount;
      leaderboard.monthlyXP += xpAmount;
      
      // Cập nhật level dựa trên tổng XP
      leaderboard.level = Math.floor(Math.sqrt(leaderboard.xpTotal / 100)) + 1;
      
      // Cập nhật thời gian hoạt động gần nhất
      leaderboard.lastActive = Date.now();
      
      await leaderboard.save();
    }
    
    res.status(200).json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể cập nhật XP cho người dùng',
      error: error.message
    });
  }
};

// Cập nhật streak cho người dùng
exports.updateUserStreak = async (req, res) => {
  try {
    const { userId, increment } = req.body;
    
    // Kiểm tra người dùng tồn tại
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng với ID này'
      });
    }
    
    // Tìm bảng xếp hạng của người dùng
    let leaderboard = await Leaderboard.findOne({ user: userId });
    
    if (!leaderboard) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin bảng xếp hạng của người dùng này'
      });
    }
    
    // Cập nhật streak
    if (increment) {
      leaderboard.streak += 1;
    } else {
      leaderboard.streak = 1; // Reset streak về 1
    }
    
    // Cập nhật thời gian hoạt động gần nhất
    leaderboard.lastActive = Date.now();
    
    await leaderboard.save();
    
    res.status(200).json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể cập nhật streak cho người dùng',
      error: error.message
    });
  }
};

// Reset XP hàng tuần (chạy tự động mỗi tuần)
exports.resetWeeklyXP = async (req, res) => {
  try {
    await Leaderboard.updateMany({}, { weeklyXP: 0 });
    
    res.status(200).json({
      success: true,
      message: 'Đã reset XP hàng tuần cho tất cả người dùng'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể reset XP hàng tuần',
      error: error.message
    });
  }
};

// Reset XP hàng tháng (chạy tự động mỗi tháng)
exports.resetMonthlyXP = async (req, res) => {
  try {
    await Leaderboard.updateMany({}, { monthlyXP: 0 });
    
    res.status(200).json({
      success: true,
      message: 'Đã reset XP hàng tháng cho tất cả người dùng'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể reset XP hàng tháng',
      error: error.message
    });
  }
};