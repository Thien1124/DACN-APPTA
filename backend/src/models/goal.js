const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  type: {
    type: String,
    required: true,
    enum: ['SCORE', 'CHAPTER', 'TEST', 'LESSON', 'POMODORO'], // ✅ Thêm POMODORO
    index: true
  },
  
  target: {
    type: Number,
    required: true,
    min: 1
  },
  
  current: {
    type: Number,
    default: 0,
    min: 0
  },
  
  deadline: {
    type: Date,
    required: function() {
      // ✅ Deadline chỉ required cho các type khác POMODORO
      return this.type !== 'POMODORO';
    }
  },
  
  status: {
    type: String,
    enum: ['ACTIVE', 'COMPLETED', 'EXPIRED', 'CANCELLED'],
    default: 'ACTIVE',
    index: true
  },
  
  // ✅ Thêm fields cho Pomodoro
  workDuration: {
    type: Number,
    default: 25,
    min: 15,
    max: 60
  },
  
  shortBreakDuration: {
    type: Number,
    default: 5,
    min: 3,
    max: 15
  },
  
  longBreakInterval: {
    type: Number,
    default: 4,
    min: 2,
    max: 8
  },
  
  longBreakDuration: {
    type: Number,
    default: 15,
    min: 10,
    max: 30
  },
  
  // Optional: liên kết với course/skill cụ thể
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: false
  },
  
  skill: {
    type: String,
    enum: ['LISTENING', 'READING', 'SPEAKING', 'WRITING', 'VOCABULARY', 'GRAMMAR', 'MIXED'],
    required: false
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  completedAt: {
    type: Date
  }
});

// Virtual: tính phần trăm hoàn thành
goalSchema.virtual('progress').get(function() {
  return Math.min(Math.round((this.current / this.target) * 100), 100);
});

// Virtual: kiểm tra đã hết hạn chưa
goalSchema.virtual('isExpired').get(function() {
  return new Date() > this.deadline;
});

// Middleware để cập nhật updatedAt
goalSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes
goalSchema.index({ user: 1, status: 1 });
goalSchema.index({ deadline: 1 });

const Goal = mongoose.model('Goal', goalSchema);

module.exports = Goal;