const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tên khóa học'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả khóa học'],
  },
  level: {
    type: String,
    required: [true, 'Vui lòng chọn cấp độ'],
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  imageUrl: {
    type: String,
    default: '/images/default-course.png'
  },
  isPublished: {
    type: Boolean,
    default: false
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate để lấy các unit thuộc khóa học
courseSchema.virtual('units', {
  ref: 'Unit',
  foreignField: 'course',
  localField: '_id'
});

// Middleware trước khi lưu để cập nhật updatedAt
courseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;