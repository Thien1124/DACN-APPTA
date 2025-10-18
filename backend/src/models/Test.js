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
      default: 70 // Điểm đạt (%)
    },
    xpReward: {
      type: Number,
      default: 20
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
TestSchema.virtual('exercises', {
  ref: 'TestExercise',
  localField: '_id',
  foreignField: 'test',
  justOne: false
});

// Middleware để cập nhật updatedAt trước khi lưu
TestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Test', TestSchema);