const mongoose = require('mongoose');

const vocabularySchema = new mongoose.Schema({
  word: {
    type: String,
    required: [true, 'Vui lòng nhập từ vựng'],
    trim: true
  },
  translation: {
    type: String,
    required: [true, 'Vui lòng nhập nghĩa của từ'],
    trim: true
  },
  phonetic: {
    type: String,
    trim: true
  },
  example: {
    type: String,
    trim: true
  },
  exampleTranslation: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String
  },
  audioUrl: {
    type: String
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: [true, 'Từ vựng phải thuộc về một bài học']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
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
vocabularySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Vocabulary = mongoose.model('Vocabulary', vocabularySchema);

module.exports = Vocabulary;