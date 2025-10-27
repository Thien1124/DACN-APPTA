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
    enum: ['SCORE', 'CHAPTER', 'TEST', 'LESSON'],
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
    required: true
  },
  
  status: {
    type: String,
    enum: ['ACTIVE', 'COMPLETED', 'EXPIRED', 'CANCELLED'],
    default: 'ACTIVE',
    index: true
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
  return this.deadline < new Date() && this.status !== 'COMPLETED';
});

// Middleware: tự động cập nhật status
goalSchema.pre('save', function(next) {
  // Cập nhật updatedAt
  this.updatedAt = Date.now();
  
  // Kiểm tra hoàn thành
  if (this.current >= this.target && this.status === 'ACTIVE') {
    this.status = 'COMPLETED';
    this.completedAt = new Date();
  }
  
  // Kiểm tra hết hạn
  if (this.deadline < new Date() && this.status === 'ACTIVE') {
    this.status = 'EXPIRED';
  }
  
  next();
});

// Indexes
goalSchema.index({ user: 1, status: 1 });
goalSchema.index({ deadline: 1 });

const Goal = mongoose.model('Goal', goalSchema);

module.exports = Goal;