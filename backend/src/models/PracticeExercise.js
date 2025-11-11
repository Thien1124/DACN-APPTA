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
  meaning: {
    type: String,
    trim: true
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
  blankPosition: {
    type: Number,
    required: function() {
      return this.type === 'fill_blank';
    }
  },
  choices: [{
    type: String,
    trim: true
  }],
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed, // String hoặc Object cho match_pairs
    required: true
  },
  left: [String], // For match_pairs
  right: [String], // For match_pairs
  audioUrl: String, // Consolidated from 'audio'
  audioText: String,
  explanation: {
    type: String,
    trim: true
  },
  examples: [{
    sentence: {
      type: String,
      required: true,
      trim: true
    },
    translation: {
      type: String,
      trim: true
    }
  }],
  commonMistakes: [{
    mistake: String,
    correction: String,
    explanation: String
  }],
  collocations: [{
    word: {
      type: String,
      trim: true
    },
    example: {
      type: String,
      trim: true
    }
  }],
  phrasalVerbForms: [{
    form: {
      type: String,
      trim: true
    },
    meaning: {
      type: String,
      trim: true
    }
  }],
  wordFamily: [{
    word: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['noun', 'verb', 'adjective', 'adverb']
    },
    meaning: {
      type: String,
      trim: true
    }
  }],
  level: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    default: 'B1',
    index: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
    index: true
  },
  points: {
    type: Number,
    default: 10,
    min: 1
  },
  tags: [String],
  relatedFlashcard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flashcard',
    index: true
  },
  imageUrl: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  stats: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    correctAttempts: {
      type: Number,
      default: 0
    },
    averageTime: {
      type: Number, // seconds
      default: 0
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes để tối ưu query
practiceExerciseSchema.index({ category: 1, level: 1, isActive: 1 });
practiceExerciseSchema.index({ targetWord: 1, category: 1 });
practiceExerciseSchema.index({ relatedFlashcard: 1 });
practiceExerciseSchema.index({ type: 1 });
practiceExerciseSchema.index({ targetWord: 'text', question: 'text' });
practiceExerciseSchema.index({ tags: 1 });

// Middleware trước khi lưu
practiceExerciseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const PracticeExercise = mongoose.model('PracticeExercise', practiceExerciseSchema);

module.exports = PracticeExercise;
