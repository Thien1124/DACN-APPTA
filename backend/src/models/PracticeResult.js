
const mongoose = require('mongoose');

/**
 * Model PracticeResult - Lưu kết quả làm bài tập Practice (Task 16)
 */
const practiceResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  practiceExercise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PracticeExercise',
    required: true,
    index: true
  },

  // Câu trả lời của user
  userAnswer: {
    type: mongoose.Schema.Types.Mixed, // String, Number, hoặc Array
    required: true
  },

  // Đáp án đúng
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },

  // Đúng hay sai
  isCorrect: {
    type: Boolean,
    required: true
  },

  // Thời gian làm bài (giây)
  timeSpent: {
    type: Number,
    default: 0,
    min: 0

  },

  // Điểm nhận được
  pointsEarned: {
    type: Number,
    default: 0,
    min: 0
  },

  // XP nhận được
  xpEarned: {
    type: Number,
    default: 0,
    min: 0
  },


  // Thời gian làm bài
  completedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes
practiceResultSchema.index({ user: 1, completedAt: -1 });
practiceResultSchema.index({ practiceExercise: 1, isCorrect: 1 });
practiceResultSchema.index({ user: 1, practiceExercise: 1 });

const PracticeResult = mongoose.model('PracticeResult', practiceResultSchema);

module.exports = PracticeResult;
