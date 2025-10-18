const Achievement = require('../models/Achievement');

// Lấy tất cả thành tích
exports.getAllAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find();
    
    res.status(200).json({
      success: true,
      count: achievements.length,
      data: achievements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách thành tích',
      error: error.message
    });
  }
};

// Lấy thành tích theo ID
exports.getAchievementById = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    
    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thành tích với ID này'
      });
    }
    
    res.status(200).json({
      success: true,
      data: achievement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin thành tích',
      error: error.message
    });
  }
};

// Tạo thành tích mới
exports.createAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.create(req.body);
    
    res.status(201).json({
      success: true,
      data: achievement
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể tạo thành tích mới',
      error: error.message
    });
  }
};

// Cập nhật thành tích
exports.updateAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thành tích với ID này'
      });
    }
    
    res.status(200).json({
      success: true,
      data: achievement
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể cập nhật thành tích',
      error: error.message
    });
  }
};

// Xóa thành tích
exports.deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findByIdAndDelete(req.params.id);
    
    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thành tích với ID này'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Thành tích đã được xóa thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể xóa thành tích',
      error: error.message
    });
  }
};

// Kích hoạt/vô hiệu hóa thành tích
exports.toggleActiveAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    
    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thành tích với ID này'
      });
    }
    
    achievement.isActive = !achievement.isActive;
    await achievement.save();
    
    res.status(200).json({
      success: true,
      data: achievement
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể thay đổi trạng thái thành tích',
      error: error.message
    });
  }
};