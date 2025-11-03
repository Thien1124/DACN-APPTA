const Mission = require('../models/Mission');
const UserMission = require('../models/UserMission');
const User = require('../models/User');

/**
 * ==========================================
 * ADMIN ENDPOINTS - Tạo/Sửa/Xóa Nhiệm Vụ
 * ==========================================
 * 
 * 1) Tạo nhiệm vụ
 * POST /api/missions
 * Headers: Authorization: Bearer {admin_token}
 * Body ví dụ:
 * {
 *   "title": "Hoàn thành 5 bài học",
 *   "description": "Học siêng năng mỗi ngày",
 *   "type": "daily", // daily | weekly | achievement
 *   "requirement": { "type": "lesson_complete", "count": 5 },
 *   "rewards": { "xp": 100, "gems": 50, "hearts": 1 },
 *   "isActive": true,
 *   "expiresAt": null
 * }
 */
exports.createMission = async (req, res) => {
  try {
    const payload = req.body;
    const mission = await Mission.create(payload);
    return res.status(201).json({ success: true, mission });
  } catch (error) {
    console.error('Lỗi khi tạo nhiệm vụ:', error);
    return res.status(400).json({ success: false, message: 'Không thể tạo nhiệm vụ', error: error.message });
  }
};

/**
 * 2) Cập nhật nhiệm vụ
 * PUT /api/missions/:id
 * Headers: Authorization: Bearer {admin_token}
 */
exports.updateMissionAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const mission = await Mission.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (!mission) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhiệm vụ' });
    }
    return res.status(200).json({ success: true, mission });
  } catch (error) {
    console.error('Lỗi khi cập nhật nhiệm vụ:', error);
    return res.status(400).json({ success: false, message: 'Không thể cập nhật nhiệm vụ', error: error.message });
  }
};

/**
 * 3) Xóa nhiệm vụ
 * DELETE /api/missions/:id
 * Headers: Authorization: Bearer {admin_token}
 */
exports.deleteMission = async (req, res) => {
  try {
    const { id } = req.params;
    const mission = await Mission.findById(id);
    if (!mission) return res.status(404).json({ success: false, message: 'Không tìm thấy nhiệm vụ' });
    await mission.deleteOne();
    return res.status(200).json({ success: true, message: 'Đã xóa nhiệm vụ' });
  } catch (error) {
    console.error('Lỗi khi xóa nhiệm vụ:', error);
    return res.status(500).json({ success: false, message: 'Không thể xóa nhiệm vụ' });
  }
};

/**
 * ==========================================
 * TASK 13: MISSION SYSTEM - Quản lý nhiệm vụ
 * ==========================================
 * 
 * API Test Endpoints:
 * 1. GET /api/missions - Lấy danh sách nhiệm vụ
 * 2. POST /api/missions/progress - Cập nhật tiến độ nhiệm vụ
 * 3. POST /api/missions/claim-reward - Nhận phần thưởng
 */

/**
 * Lấy danh sách nhiệm vụ có sẵn cho người dùng
 * 
 * API Test:
 * GET /api/missions
 * Headers: Authorization: Bearer {token}
 * 
 * Response:
 * {
 *   "success": true,
 *   "missions": [
 *     {
 *       "_id": "...",
 *       "title": "Hoàn thành 5 bài học",
 *       "description": "...",
 *       "type": "daily",
 *       "requirement": {
 *         "type": "lesson_complete",
 *         "count": 5
 *       },
 *       "rewards": {
 *         "xp": 100,
 *         "gems": 50,
 *         "hearts": 2
 *       },
 *       "progress": 3,
 *       "isCompleted": false,
 *       "rewardClaimed": false
 *     }
 *   ]
 * }
 */
exports.getMissions = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Lấy tất cả nhiệm vụ đang hoạt động
    const missions = await Mission.find({ isActive: true });
    
    // Lấy tiến độ nhiệm vụ của người dùng
    const userMissions = await UserMission.find({ userId });
    
    // Kết hợp thông tin nhiệm vụ và tiến độ
    const missionData = missions.map(mission => {
      const userMission = userMissions.find(um => 
        um.missionId.toString() === mission._id.toString()
      );
      
      return {
        _id: mission._id,
        title: mission.title,
        description: mission.description,
        type: mission.type,
        requirement: mission.requirement,
        rewards: mission.rewards,
        expiresAt: mission.expiresAt,
        progress: userMission ? userMission.progress : 0,
        isCompleted: userMission ? userMission.isCompleted : false,
        rewardClaimed: userMission ? userMission.rewardClaimed : false
      };
    });
    
    return res.status(200).json({
      success: true,
      missions: missionData
    });
    
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nhiệm vụ:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * Cập nhật tiến độ nhiệm vụ
 * 
 * API Test:
 * POST /api/missions/progress
 * Headers: Authorization: Bearer {token}
 * Body: {
 *   "missionId": "60f7b3b3b3b3b3b3b3b3b3b3",
 *   "progress": 1  // Optional: số lượng tăng thêm (mặc định +1)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "mission": {
 *     "_id": "...",
 *     "title": "Hoàn thành 5 bài học",
 *     "progress": 4,
 *     "required": 5,
 *     "isCompleted": false
 *   }
 * }
 */
exports.updateMissionProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { missionId, progress } = req.body;
    
    if (!missionId) {
      return res.status(400).json({ success: false, message: 'ID nhiệm vụ không hợp lệ' });
    }
    
    // Kiểm tra nhiệm vụ có tồn tại không
    const mission = await Mission.findById(missionId);
    if (!mission || !mission.isActive) {
      return res.status(404).json({ success: false, message: 'Nhiệm vụ không tồn tại hoặc không còn hoạt động' });
    }
    
    // Tìm hoặc tạo mới tiến độ nhiệm vụ của người dùng
    let userMission = await UserMission.findOne({ userId, missionId });
    
    if (!userMission) {
      userMission = new UserMission({
        userId,
        missionId,
        progress: 0
      });
    }
    
    // Cập nhật tiến độ
    if (progress !== undefined) {
      userMission.progress = progress;
    } else {
      userMission.progress += 1;
    }
    
    // Kiểm tra xem nhiệm vụ đã hoàn thành chưa
    if (userMission.progress >= mission.requirement.count && !userMission.isCompleted) {
      userMission.isCompleted = true;
      userMission.completedAt = new Date();
    }
    
    await userMission.save();
    
    return res.status(200).json({
      success: true,
      mission: {
        _id: mission._id,
        title: mission.title,
        progress: userMission.progress,
        required: mission.requirement.count,
        isCompleted: userMission.isCompleted
      }
    });
    
  } catch (error) {
    console.error('Lỗi khi cập nhật tiến độ nhiệm vụ:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * Nhận phần thưởng từ nhiệm vụ đã hoàn thành
 * 
 * API Test:
 * POST /api/missions/claim-reward
 * Headers: Authorization: Bearer {token}
 * Body: {
 *   "missionId": "60f7b3b3b3b3b3b3b3b3b3b3"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Đã nhận phần thưởng thành công",
 *   "rewards": {
 *     "xp": 100,
 *     "gems": 50,
 *     "hearts": 2
 *   },
 *   "userStats": {
 *     "xp": { "total": 350, "level": 2 },
 *     "gems": { "amount": 50 },
 *     "hearts": { "current": 5, "max": 5 }
 *   }
 * }
 * 
 * Test Cases:
 * 1. Nhiệm vụ chưa hoàn thành -> lỗi
 * 2. Đã nhận phần thưởng -> lỗi (không cho nhận 2 lần)
 * 3. Nhận thành công -> tăng XP, Gems, Hearts
 */
exports.claimReward = async (req, res) => {
  try {
    const userId = req.user.id;
    const { missionId } = req.body;
    
    // Kiểm tra nhiệm vụ và tiến độ
    const userMission = await UserMission.findOne({ userId, missionId });
    
    if (!userMission || !userMission.isCompleted) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nhiệm vụ chưa hoàn thành hoặc không tồn tại' 
      });
    }
    
    if (userMission.rewardClaimed) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phần thưởng đã được nhận trước đó' 
      });
    }
    
    // Lấy thông tin phần thưởng
    const mission = await Mission.findById(missionId);
    const rewards = mission.rewards;
    
    // Cập nhật thông tin người dùng
    const user = await User.findById(userId);
    
    if (rewards.xp) {
      user.xp.total += rewards.xp;
      // Cập nhật level
      user.xp.level = 1 + Math.floor(Math.sqrt(user.xp.total / 100));
    }
    
    if (rewards.gems) {
      user.gems.amount += rewards.gems;
    }
    
    if (rewards.hearts) {
      user.hearts.current = Math.min(user.hearts.current + rewards.hearts, user.hearts.max);
    }
    
    await user.save();
    
    // Đánh dấu đã nhận phần thưởng
    userMission.rewardClaimed = true;
    await userMission.save();
    
    return res.status(200).json({
      success: true,
      message: 'Đã nhận phần thưởng thành công',
      rewards,
      userStats: {
        xp: user.xp,
        gems: user.gems,
        hearts: user.hearts
      }
    });
    
  } catch (error) {
    console.error('Lỗi khi nhận phần thưởng:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};