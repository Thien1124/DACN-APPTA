const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tiêu đề khóa học'],
      trim: true,
      maxlength: [100, 'Tiêu đề không được vượt quá 100 ký tự']
    },
    description: {
      type: String,
      required: [true, 'Vui lòng nhập mô tả khóa học'],
      trim: true
    },
    level: {
      type: String,
      required: [true, 'Vui lòng chọn cấp độ khóa học'],
      enum: {
        values: ['beginner', 'intermediate', 'advanced'],
        message: 'Cấp độ phải là beginner, intermediate hoặc advanced'
      }
    },
    imageUrl: {
      type: String,
      default: 'default-course.jpg'
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate
CourseSchema.virtual('units', {
  ref: 'Unit',
  localField: '_id',
  foreignField: 'course',
  justOne: false
});

// Middleware để cập nhật updatedAt trước khi lưu
CourseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Course', CourseSchema);