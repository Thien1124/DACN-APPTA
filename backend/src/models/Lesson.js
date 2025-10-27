const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tiêu đề bài học'],
      trim: true,
      maxlength: [100, 'Tiêu đề không được vượt quá 100 ký tự']
    },
    description: {
      type: String,
      required: [true, 'Vui lòng nhập mô tả bài học'],
      trim: true
    },
    unit: {
      type: mongoose.Schema.ObjectId,
      ref: 'Unit',
      required: [true, 'Bài học phải thuộc về một unit']
    },
    order: {
      type: Number,
      required: [true, 'Vui lòng nhập thứ tự bài học'],
      default: 0
    },
    type: {
      type: String,
      required: [true, 'Vui lòng chọn loại bài học'],
      enum: {
        values: ['vocabulary', 'grammar', 'reading', 'listening', 'speaking', 'writing', 'mixed'],
        message: 'Loại bài học không hợp lệ'
      },
      default: 'mixed'
    },
    xpReward: {
      type: Number,
      default: 10
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    imageUrl: {
      type: String,
      default: '/images/default-lesson.png' // Giữ lại đường dẫn hợp lý hơn
    }
  },
  {
    // Sử dụng timestamps tích hợp của Mongoose, sạch sẽ hơn
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate để lấy các từ vựng thuộc bài học
LessonSchema.virtual('vocabularies', {
  ref: 'Vocabulary',
  localField: '_id',
  foreignField: 'lesson',
  justOne: false
});

// Virtual populate để lấy các bài tập thuộc bài học
LessonSchema.virtual('exercises', {
  ref: 'Exercise',
  localField: '_id',
  foreignField: 'lesson',
  justOne: false
});

// Không cần pre-save hook cho 'updatedAt' vì `timestamps: true` đã tự động xử lý

module.exports = mongoose.model('Lesson', LessonSchema);