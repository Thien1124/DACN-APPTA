const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true,
    default: false
  }
});

const exerciseSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Vui lòng nhập câu hỏi'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Vui lòng chọn loại bài tập'],
    enum: ['multiple-choice', 'fill-in-blank', 'matching', 'listening', 'speaking', 'translation'],
    default: 'multiple-choice'
  },
  options: [optionSchema],
  correctAnswer: {
    type: String,
    required: function() {
      return this.type === 'fill-in-blank' || this.type === 'translation';
    }
  },
  explanation: {
    type: String
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: false // Cho phép null cho roadmap exercises
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  points: {
    type: Number,
    default: 10
  },
  imageUrl: {
    type: String
  },
  audioUrl: {
    type: String
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
  timestamps: true
});

// Middleware trước khi lưu để cập nhật updatedAt
exerciseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;