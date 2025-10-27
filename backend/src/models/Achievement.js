const mongoose = require('mongoose');

<<<<<<< HEAD
const AchievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tiêu đề thành tích'],
    trim: true,
    maxlength: [100, 'Tiêu đề không được vượt quá 100 ký tự']
=======
const achievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tên thành tích'],
    trim: true
>>>>>>> main
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả thành tích'],
<<<<<<< HEAD
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
=======
  },
  type: {
    type: String,
    enum: ['daily', 'streak', 'lesson', 'course', 'special'],
    default: 'lesson'
  },
  requirement: {
    type: Number,
    default: 1,
    required: [true, 'Vui lòng nhập số lượng yêu cầu']
  },
  xpReward: {
    type: Number,
    default: 10
  },
  iconUrl: {
    type: String,
    default: '/images/default-achievement.png'
>>>>>>> main
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
<<<<<<< HEAD
});

// Middleware để cập nhật updatedAt trước khi lưu
AchievementSchema.pre('save', function(next) {
=======
}, {
  timestamps: true
});

// Middleware trước khi lưu để cập nhật updatedAt
achievementSchema.pre('save', function(next) {
>>>>>>> main
  this.updatedAt = Date.now();
  next();
});

<<<<<<< HEAD
module.exports = mongoose.model('Achievement', AchievementSchema);
=======
const Achievement = mongoose.model('Achievement', achievementSchema);

module.exports = Achievement;
>>>>>>> main
