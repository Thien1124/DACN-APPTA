const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tiêu đề thành tích'],
    trim: true,
    maxlength: [100, 'Tiêu đề không được vượt quá 100 ký tự']
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả thành tích'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Vui lòng chọn loại thành tích'],
    enum: {
      values: ['streak', 'xp', 'lesson', 'course', 'custom'],
      message: 'Loại thành tích không hợp lệ'
    }
  },
  requirement: {
    type: Number,
    required: [true, 'Vui lòng nhập yêu cầu để đạt thành tích'],
    min: [1, 'Yêu cầu phải lớn hơn 0']
  },
  xpReward: {
    type: Number,
    default: 0
  },
  imageUrl: {
    type: String,
    default: 'default-achievement.jpg'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware để cập nhật updatedAt trước khi lưu
AchievementSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Achievement', AchievementSchema);