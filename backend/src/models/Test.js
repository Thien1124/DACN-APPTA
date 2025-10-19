const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tên bài kiểm tra'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả bài kiểm tra'],
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Bài kiểm tra phải thuộc về một khóa học']
  },
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit'
  },
  duration: {
    type: Number, // Thời gian làm bài tính bằng phút
    default: 15
  },
  passingScore: {
    type: Number,
    default: 70
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  exercises: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise'
  }],
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
testSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Test = mongoose.model('Test', testSchema);

module.exports = Test;