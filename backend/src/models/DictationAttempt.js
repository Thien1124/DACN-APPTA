const mongoose = require('mongoose');

const dictationAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  flashcard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flashcard',
    required: true,
    index: true
  },
  deck: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deck',
    required: true
  },
  // Dictation data
  correctAnswer: {
    type: String,
    required: true
  },
  userAnswer: {
    type: String,
    required: true
  },
  // Accuracy metrics
  accuracy: {
    type: Number, // 0-100
    required: true,
    min: 0,
    max: 100
  },
  characterAccuracy: {
    type: Number, // Based on Levenshtein distance
    min: 0,
    max: 100
  },
  wordAccuracy: {
    type: Number, // Based on correct words
    min: 0,
    max: 100
  },
  // Detailed mistakes
  mistakes: [{
    type: {
      type: String,
      enum: ['missing', 'extra', 'wrong', 'typo'],
      required: true
    },
    position: {
      type: Number,
      required: true
    },
    expected: String,
    actual: String
  }],
  // Timing
  playCount: {
    type: Number,
    default: 1,
    min: 1
  },
  timeSpent: {
    type: Number, // seconds
    required: true
  },
  // Difficulty
  difficultyLevel: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  // Status
  passed: {
    type: Boolean,
    required: true
  },
  // Audio reference
  audioUrl: String,
  audioSpeed: {
    type: Number,
    default: 1.0,
    min: 0.5,
    max: 2.0
  },
  // Metadata
  completedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for queries
dictationAttemptSchema.index({ user: 1, completedAt: -1 });
dictationAttemptSchema.index({ user: 1, deck: 1 });
dictationAttemptSchema.index({ flashcard: 1, completedAt: -1 });

// Virtual for pass rate
dictationAttemptSchema.virtual('passRate').get(function() {
  return this.accuracy >= 80 ? 100 : 0;
});

// Static method: Get user stats
dictationAttemptSchema.statics.getUserStats = async function(userId, options = {}) {
  const { deckId, startDate, endDate } = options;
  
  const matchStage = { user: new mongoose.Types.ObjectId(userId) };
  if (deckId) matchStage.deck = new mongoose.Types.ObjectId(deckId);
  if (startDate) matchStage.completedAt = { $gte: new Date(startDate) };
  if (endDate) matchStage.completedAt = { ...matchStage.completedAt, $lte: new Date(endDate) };
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalAttempts: { $sum: 1 },
        passedAttempts: {
          $sum: { $cond: ['$passed', 1, 0] }
        },
        avgAccuracy: { $avg: '$accuracy' },
        avgCharAccuracy: { $avg: '$characterAccuracy' },
        avgWordAccuracy: { $avg: '$wordAccuracy' },
        avgTimeSpent: { $avg: '$timeSpent' },
        avgPlayCount: { $avg: '$playCount' },
        totalMistakes: { $sum: { $size: '$mistakes' } }
      }
    }
  ]);
  
  return stats[0] || {
    totalAttempts: 0,
    passedAttempts: 0,
    avgAccuracy: 0,
    avgCharAccuracy: 0,
    avgWordAccuracy: 0,
    avgTimeSpent: 0,
    avgPlayCount: 0,
    totalMistakes: 0
  };
};

// Static method: Get common mistakes
dictationAttemptSchema.statics.getCommonMistakes = async function(userId, limit = 10) {
  const mistakes = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $unwind: '$mistakes' },
    {
      $group: {
        _id: {
          type: '$mistakes.type',
          expected: '$mistakes.expected',
          actual: '$mistakes.actual'
        },
        count: { $sum: 1 },
        flashcards: { $addToSet: '$flashcard' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);
  
  return mistakes;
};

// Static method: Get difficulty distribution
dictationAttemptSchema.statics.getDifficultyStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$difficultyLevel',
        count: { $sum: 1 },
        avgAccuracy: { $avg: '$accuracy' },
        passRate: {
          $avg: { $cond: ['$passed', 100, 0] }
        }
      }
    }
  ]);
  
  return stats;
};

const DictationAttempt = mongoose.model('DictationAttempt', dictationAttemptSchema);

module.exports = DictationAttempt;
