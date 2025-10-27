const mongoose = require('mongoose');

const TestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tiêu đề bài test'],
      trim: true,
      maxlength: [100, 'Tiêu đề không được vượt quá 100 ký tự']
    },
    description: {
      type: String,
      required: [true, 'Vui lòng nhập mô tả bài test'],
      trim: true
    },
    // **Hợp nhất:** Giữ lại các trường enum chi tiết từ 'main'
    type: {
      type: String,
      required: true,
      enum: ['PRACTICE', 'TEST', 'EXAM', 'QUIZ'],
      default: 'PRACTICE'
    },
    skill: {
      type: String,
      required: true,
      enum: ['LISTENING', 'READING', 'SPEAKING', 'WRITING', 'VOCABULARY', 'GRAMMAR', 'MIXED'],
      index: true
    },
    level: {
      type: String,
      required: true,
      enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
      index: true
    },
    // Giữ lại tham chiếu đến course và unit
    course: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course'
    },
    unit: {
      type: mongoose.Schema.ObjectId,
      ref: 'Unit'
    },
    timeLimit: {
      type: Number,
      default: 0 // 0 = không giới hạn thời gian
    },
    passingScore: {
      type: Number,
      default: 70, // Điểm đạt (%)
      min: 0,
      max: 100
    },
    // Đổi tên 'attempts' thành 'maxAttempts' cho rõ ràng
    maxAttempts: {
        type: Number,
        default: -1 // -1 = không giới hạn số lần làm bài
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    // Sử dụng timestamps tích hợp, sạch sẽ hơn
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// **Hợp nhất:** Giữ lại Virtual populate đến TestExercise, đây là pattern tốt hơn
TestSchema.virtual('exercises', {
  ref: 'TestExercise',
  localField: '_id',
  foreignField: 'test',
  justOne: false
});

// **Hợp nhất:** Giữ lại các index quan trọng
TestSchema.index({ skill: 1, level: 1, isPublished: 1 });
TestSchema.index({ course: 1 });
TestSchema.index({ unit: 1 });


// Không cần pre-save hook cho 'updatedAt' vì `timestamps: true` đã tự động xử lý

module.exports = mongoose.model('Test', TestSchema);