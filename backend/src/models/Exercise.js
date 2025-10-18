const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Vui lòng nhập câu hỏi'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Vui lòng chọn loại bài tập'],
    enum: {
      values: ['multiple-choice', 'fill-in-blank', 'matching', 'reorder', 'listening', 'speaking'],
      message: 'Loại bài tập không hợp lệ'
    }
  },
  options: {
    type: [String],
    validate: {
      validator: function(v) {
        return this.type === 'multiple-choice' ? v.length >= 2 : true;
      },
      message: 'Bài tập trắc nghiệm phải có ít nhất 2 lựa chọn'
    }
  },
  correctAnswer: {
    type: String,
    required: [true, 'Vui lòng nhập đáp án đúng'],
    trim: true
  },
  explanation: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  lesson: {
    type: mongoose.Schema.ObjectId,
    ref: 'Lesson',
    required: [true, 'Bài tập phải thuộc về một bài học']
  },
  imageUrl: {
    type: String
  },
  audioUrl: {
    type: String
  },
  xpReward: {
    type: Number,
    default: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware để cập nhật updatedAt trước khi lưu
ExerciseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Exercise', ExerciseSchema);