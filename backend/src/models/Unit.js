const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tên unit'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả unit'],
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Unit phải thuộc về một khóa học']
  },
  order: {
    type: Number,
    required: [true, 'Vui lòng nhập thứ tự unit'],
    default: 1
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  imageUrl: {
    type: String,
    default: '/images/default-unit.png'
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

// Virtual populate để lấy các bài học thuộc unit
unitSchema.virtual('lessons', {
  ref: 'Lesson',
  foreignField: 'unit',
  localField: '_id'
});

// Middleware trước khi lưu để cập nhật updatedAt
unitSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Unit = mongoose.model('Unit', unitSchema);

module.exports = Unit;