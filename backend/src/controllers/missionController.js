const Mission = require('../models/Mission');
const UserMission = require('../models/UserMission');
const User = require('../models/User');

// Lấy danh sách nhiệm vụ có sẵn cho người dùng
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

// Cập nhật tiến độ nhiệm vụ
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

// Nhận phần thưởng từ nhiệm vụ đã hoàn thành
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