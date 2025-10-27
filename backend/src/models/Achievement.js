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
    // Hợp nhất các loại enum từ cả hai nhánh
    enum: {
      values: ['STREAK', 'XP', 'LESSON_COMPLETED', 'COURSE_COMPLETED', 'DAILY_GOAL', 'SPECIAL', 'CUSTOM'],
      message: 'Loại thành tích không hợp lệ'
    },
    default: 'LESSON_COMPLETED'
  },
  requirement: {
    type: Number,
    required: [true, 'Vui lòng nhập yêu cầu để đạt thành tích'],
    min: [1, 'Yêu cầu phải lớn hơn 0'],
    default: 1
  },
  xpReward: {
    type: Number,
    default: 10 // Giữ lại default value cao hơn
  },
  // Sử dụng 'iconUrl' vì nó mô tả tốt hơn
  iconUrl: {
    type: String,
    default: '/images/default-achievement.png' 
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  // Sử dụng timestamps tích hợp của Mongoose, sạch sẽ hơn
  timestamps: true 
});

module.exports = mongoose.model('Achievement', AchievementSchema);