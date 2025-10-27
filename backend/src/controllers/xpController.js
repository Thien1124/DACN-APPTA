const User = require('../models/User');

// Cập nhật XP khi người dùng hoàn thành bài học
exports.updateXP = async (req, res) => {
  try {
    const userId = req.user.id;
    const { xpEarned } = req.body;
    
    if (!xpEarned || xpEarned < 0) {
      return res.status(400).json({ success: false, message: 'XP không hợp lệ' });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    
    // Cập nhật tổng XP
    user.xp.total += xpEarned;
    
    // Tính toán level dựa trên XP
    // Công thức: level = 1 + floor(sqrt(totalXP / 100))
    const newLevel = 1 + Math.floor(Math.sqrt(user.xp.total / 100));
    
    // Kiểm tra xem người dùng có lên cấp không
    const leveledUp = newLevel > user.xp.level;
    
    // Cập nhật level
    user.xp.level = newLevel;
    
    await user.save();
    
    return res.status(200).json({ 
      success: true, 
      xp: user.xp,
      leveledUp,
      message: leveledUp ? 'Chúc mừng! Bạn đã lên cấp' : 'XP đã được cập nhật thành công' 
    });
    
  } catch (error) {
    console.error('Lỗi khi cập nhật XP:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Lấy thông tin XP của người dùng
exports.getXP = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('xp');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    
    // Tính toán XP cần thiết để lên cấp tiếp theo
    const currentLevel = user.xp.level;
    const nextLevel = currentLevel + 1;
    const xpForNextLevel = Math.pow(nextLevel - 1, 2) * 100;
    const xpNeeded = xpForNextLevel - user.xp.total;
    
    return res.status(200).json({ 
      success: true, 
      xp: user.xp,
      nextLevelXP: xpForNextLevel,
      xpNeeded
    });
    
  } catch (error) {
    console.error('Lỗi khi lấy thông tin XP:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};