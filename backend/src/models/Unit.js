const mongoose = require('mongoose');

const UnitSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tiêu đề unit'],
      trim: true,
      maxlength: [100, 'Tiêu đề không được vượt quá 100 ký tự']
    },
    description: {
      type: String,
      required: [true, 'Vui lòng nhập mô tả unit'],
      trim: true
    },
    course: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
      required: [true, 'Unit phải thuộc về một khóa học']
    },
    order: {
      type: Number,
      required: [true, 'Vui lòng nhập thứ tự unit'],
      default: 0
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    imageUrl: {
      type: String,
      default: 'default-unit.jpg'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate
UnitSchema.virtual('lessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'unit',
  justOne: false
});

// Middleware để cập nhật updatedAt trước khi lưu
UnitSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Unit', UnitSchema);