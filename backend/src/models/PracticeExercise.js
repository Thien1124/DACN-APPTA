// backend/src/models/PracticeExercise.js
const mongoose = require('mongoose');

const practiceExerciseSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['collocation', 'phrasal-verb', 'word-family', 'grammar', 'vocabulary', 'listening', 'reading', 'writing', 'mixed'],
    required: true,
    index: true
  },
  targetWord: {
    type: String,
    trim: true,
    index: true
  },
  question: {
    type: String,
    required: [true, 'Vui lòng nhập câu hỏi'],
    trim: true
  },
  type: {
    type: String,
    enum: ['multiple_choice', 'fill_blank', 'translate', 'listen_write', 'listen_choice', 'match_pairs', 'write', 'vocabulary', 'reading', 'grammar', 'listening'],
    required: true,
    default: 'multiple_choice'
  },
  contextSentence: {
    type: String,
    trim: true
  },
  // Choices cho multiple-choice
  choices: [{
    type: String,
    trim: true
  }],
  // Đáp án đúng
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed, // String hoặc Object cho match_pairs
    required: true
  },
  // For match_pairs
  left: [String],
  right: [String],
  // Audio URL cho listening
  audio: String,
  audioText: String,
  // Giải thích
  explanation: {
    type: String,
    trim: true
  },
  // Ví dụ
  examples: [{
    sentence: String,
    translation: String
  }],
  // Common mistakes
  commonMistakes: [{
    mistake: String,
    correction: String,
    explanation: String
  }],
  // Metadata
  level: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    default: 'B1'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  points: {
    type: Number,
    default: 10,
    min: 1
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
practiceExerciseSchema.index({ category: 1, level: 1, difficulty: 1 });
practiceExerciseSchema.index({ targetWord: 'text', question: 'text' });
practiceExerciseSchema.index({ tags: 1 });

module.exports = mongoose.model('PracticeExercise', practiceExerciseSchema);