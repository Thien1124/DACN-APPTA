const mongoose = require('mongoose');

<<<<<<< HEAD
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
=======
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
>>>>>>> main
  this.updatedAt = Date.now();
  next();
});

<<<<<<< HEAD
module.exports = mongoose.model('Course', CourseSchema);
=======
const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
>>>>>>> main
