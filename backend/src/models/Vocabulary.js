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
  learnedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    learnedAt: {
      type: Date,
      default: Date.now
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    mastery: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    starred: {
      type: Boolean,
      default: false
    }
  }],
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

vocabularySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Vocabulary = mongoose.model('Vocabulary', vocabularySchema);

module.exports = Vocabulary;