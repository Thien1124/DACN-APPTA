const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tên thành tích'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả thành tích'],
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
}, {
  timestamps: true
});

// Middleware trước khi lưu để cập nhật updatedAt
achievementSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Achievement = mongoose.model('Achievement', achievementSchema);

module.exports = Achievement;