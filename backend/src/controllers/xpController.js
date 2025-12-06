const User = require('../models/User');
const Mission = require('../models/Mission');
const UserMission = require('../models/UserMission');

/**
 * ==========================================
 * TASK 12: XP SYSTEM - Điểm kinh nghiệm
 * ==========================================
 * 
 * API Test:
 * POST /api/xp/update
 * Headers: Authorization: Bearer {token}
 * Body: {
 *   "xpEarned": 50
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "xp": {
 *     "total": 250,
 *     "level": 2
 *   },
 *   "leveledUp": true,
 *   "message": "Chúc mừng! Bạn đã lên cấp"
 * }
 * 
 * Test Cases:
 * 1. Hoàn thành bài học -> tăng XP
 * 2. Đủ XP -> lên level
 * 3. XP âm -> trả về lỗi
 */

/**
 * Cập nhật XP khi người dùng hoàn thành bài học
 * - Tăng tổng XP
 * - Tính level dựa trên XP: level = 1 + floor(sqrt(totalXP / 100))
 * - Kiểm tra lên level
 */
exports.updateXP = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { xpEarned } = req.body;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User ID không hợp lệ' });
    }
    
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
    
    // ✅ TỰ ĐỘNG CẬP NHẬT MISSION PROGRESS KHI KIẾM XP
    try {
      // Tìm các mission với requirement type = 'xp_earned'
      const xpMissions = await Mission.find({
        isActive: true,
        'requirement.type': 'xp_earned'
      });
      
      for (const mission of xpMissions) {
        // Tìm hoặc tạo UserMission
        let userMission = await UserMission.findOne({
          userId: userId,
          missionId: mission._id
        });
        
        if (!userMission) {
          userMission = new UserMission({
            userId: userId,
            missionId: mission._id,
            progress: 0
          });
        }
        
        // Nếu chưa hoàn thành, cập nhật progress
        if (!userMission.isCompleted && !userMission.rewardClaimed) {
          userMission.progress = user.xp.total; // Set progress = total XP earned
          
          // Kiểm tra nếu đạt yêu cầu
          if (userMission.progress >= mission.requirement.count) {
            userMission.isCompleted = true;
            userMission.completedAt = new Date();
            console.log(`✅ Mission "${mission.title}" completed for user ${userId}`);
          }
          
          await userMission.save();
        }
      }
    } catch (missionError) {
      console.error('❌ Error updating mission progress:', missionError);
      // Không throw error để không làm fail XP update
    }
    
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

/**
 * Lấy thông tin XP của người dùng
 * 
 * API Test:
 * GET /api/xp
 * Headers: Authorization: Bearer {token}
 * 
 * Response:
 * {
 *   "success": true,
 *   "xp": {
 *     "total": 250,
 *     "level": 2
 *   },
 *   "nextLevelXP": 400,
 *   "xpNeeded": 150
 * }
 */
exports.getXP = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User ID không hợp lệ' });
    }
    
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