const mongoose = require('mongoose');

/**
 * Model GrammarQuizResult - Lưu kết quả làm quiz ngữ pháp (Task 17)
 */
const grammarQuizResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  grammarQuiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GrammarQuiz',
    required: true,
    index: true
  },

  flashcard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flashcard',
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
    min: 0,
    default: 0
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
grammarQuizResultSchema.index({ user: 1, completedAt: -1 });
grammarQuizResultSchema.index({ grammarQuiz: 1, isCorrect: 1 });
grammarQuizResultSchema.index({ user: 1, flashcard: 1 });

const GrammarQuizResult = mongoose.model('GrammarQuizResult', grammarQuizResultSchema);

module.exports = GrammarQuizResult;

