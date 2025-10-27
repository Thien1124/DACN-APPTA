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
      },
      default: 'beginner' // Giữ lại default value hữu ích
    },
    imageUrl: {
      type: String,
      default: '/images/default-course.png' // Giữ lại đường dẫn hợp lý hơn
    },
    isPublished: {
      type: Boolean,
      default: false
    }
  },
  {
    // Sử dụng timestamps tích hợp của Mongoose, sạch sẽ hơn
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate để lấy các unit thuộc khóa học
CourseSchema.virtual('units', {
  ref: 'Unit',
  localField: '_id',
  foreignField: 'course',
  justOne: false
});

// Không cần pre-save hook cho 'updatedAt' vì `timestamps: true` đã tự động xử lý

module.exports = mongoose.model('Course', CourseSchema);