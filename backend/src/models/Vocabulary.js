const mongoose = require('mongoose');

<<<<<<< HEAD
const VocabularySchema = new mongoose.Schema({
=======
const vocabularySchema = new mongoose.Schema({
>>>>>>> main
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
<<<<<<< HEAD
    type: String,
    default: 'default-vocabulary.jpg'
=======
    type: String
>>>>>>> main
  },
  audioUrl: {
    type: String
  },
  lesson: {
<<<<<<< HEAD
    type: mongoose.Schema.ObjectId,
=======
    type: mongoose.Schema.Types.ObjectId,
>>>>>>> main
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
<<<<<<< HEAD
});

// Middleware để cập nhật updatedAt trước khi lưu
VocabularySchema.pre('save', function(next) {
=======
}, {
  timestamps: true
});

// Middleware trước khi lưu để cập nhật updatedAt
vocabularySchema.pre('save', function(next) {
>>>>>>> main
  this.updatedAt = Date.now();
  next();
});

<<<<<<< HEAD
module.exports = mongoose.model('Vocabulary', VocabularySchema);
=======
const Vocabulary = mongoose.model('Vocabulary', vocabularySchema);

module.exports = Vocabulary;
>>>>>>> main
