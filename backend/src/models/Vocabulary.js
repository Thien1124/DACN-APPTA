const mongoose = require('mongoose');

const VocabularySchema = new mongoose.Schema({
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
    type: String,
    default: '/images/default-vocabulary.png' // Cập nhật để nhất quán
  },
  audioUrl: {
    type: String
  },
  lesson: {
    type: mongoose.Schema.ObjectId,
    ref: 'Lesson',
    required: [true, 'Từ vựng phải thuộc về một bài học']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
}, {
  // Sử dụng timestamps tích hợp của Mongoose, sạch sẽ hơn
  timestamps: true
});

// Không cần pre-save hook cho 'updatedAt' vì `timestamps: true` đã tự động xử lý

module.exports = mongoose.model('Vocabulary', VocabularySchema);