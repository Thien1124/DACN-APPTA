const mongoose = require('mongoose');

const speechAttemptSchema = new mongoose.Schema({
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
  // Speech data
  targetText: {
    type: String,
    required: true
  },
  targetIPA: {
    type: String // International Phonetic Alphabet
  },
  userAudioUrl: {
    type: String,
    required: true
  },
  transcription: {
    type: String, // What the user actually said (from STT)
    required: true
  },
  // Pronunciation scoring
  pronunciationScore: {
    type: Number, // 0-100
    required: true,
    min: 0,
    max: 100
  },
  fluencyScore: {
    type: Number,
    min: 0,
    max: 100
  },
  accuracyScore: {
    type: Number,
    min: 0,
    max: 100
  },
  completenessScore: {
    type: Number,
    min: 0,
    max: 100
  },
  // Phoneme analysis
  phonemeAnalysis: [{
    phoneme: String, // IPA symbol
    score: Number, // 0-100
    feedback: String // "good", "needs_improvement", "incorrect"
  }],
  // Word-level analysis
  wordAnalysis: [{
    word: String,
    expected: String,
    actual: String,
    score: Number,
    issues: [String] // ["stress", "vowel", "consonant"]
  }],
  // Intonation analysis
  intonation: {
    pattern: String, // "rising", "falling", "flat"
    score: Number,
    feedback: String
  },
  // Timing metrics
  duration: {
    type: Number, // seconds
    required: true
  },
  pauseCount: Number,
  speechRate: Number, // words per minute
  // Feedback
  overallFeedback: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'needs_improvement'],
    required: true
  },
  detailedFeedback: [{
    category: {
      type: String,
      enum: ['pronunciation', 'fluency', 'intonation', 'speed', 'clarity']
    },
    message: String,
    severity: {
      type: String,
      enum: ['info', 'warning', 'error']
    }
  }],
  // Pass/Fail
  passed: {
    type: Boolean,
    required: true
  },
  // Metadata
  language: {
    type: String,
    default: 'en-US'
  },
  recognitionEngine: {
    type: String,
    enum: ['google', 'azure', 'aws', 'web-speech-api'],
    default: 'google'
  },
  confidence: {
    type: Number, // Speech recognition confidence
    min: 0,
    max: 1
  },
  completedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes
speechAttemptSchema.index({ user: 1, completedAt: -1 });
speechAttemptSchema.index({ user: 1, deck: 1 });
speechAttemptSchema.index({ flashcard: 1, completedAt: -1 });

// Virtual for improvement needed
speechAttemptSchema.virtual('needsImprovement').get(function() {
  return this.pronunciationScore < 70;
});

// Static method: Get user speech stats
speechAttemptSchema.statics.getUserStats = async function(userId, options = {}) {
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
        avgPronunciationScore: { $avg: '$pronunciationScore' },
        avgFluencyScore: { $avg: '$fluencyScore' },
        avgAccuracyScore: { $avg: '$accuracyScore' },
        avgCompletenessScore: { $avg: '$completenessScore' },
        avgDuration: { $avg: '$duration' },
        avgConfidence: { $avg: '$confidence' }
      }
    }
  ]);
  
  return stats[0] || {
    totalAttempts: 0,
    passedAttempts: 0,
    avgPronunciationScore: 0,
    avgFluencyScore: 0,
    avgAccuracyScore: 0,
    avgCompletenessScore: 0,
    avgDuration: 0,
    avgConfidence: 0
  };
};

// Static method: Get pronunciation issues
speechAttemptSchema.statics.getCommonIssues = async function(userId, limit = 10) {
  const issues = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $unwind: '$wordAnalysis' },
    { $unwind: '$wordAnalysis.issues' },
    {
      $group: {
        _id: {
          issue: '$wordAnalysis.issues',
          word: '$wordAnalysis.word'
        },
        count: { $sum: 1 },
        avgScore: { $avg: '$wordAnalysis.score' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);
  
  return issues;
};

// Static method: Get progress over time
speechAttemptSchema.statics.getProgressOverTime = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const progress = await this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        completedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$completedAt' }
        },
        avgScore: { $avg: '$pronunciationScore' },
        attempts: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  return progress;
};

const SpeechAttempt = mongoose.model('SpeechAttempt', speechAttemptSchema);

module.exports = SpeechAttempt;
