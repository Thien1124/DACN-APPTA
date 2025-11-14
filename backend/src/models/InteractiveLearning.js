const mongoose = require('mongoose');

/**
 * ===============================================
 * IMAGE-WORD MATCHING MODEL
 * ===============================================
 * User matches images with correct words
 */
const imageMatchAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deck: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deck',
    required: true,
    
  },
  flashcards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flashcard'
  }],
  answers: [{
    flashcard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flashcard'
    },
    selectedWord: String,
    correctWord: String,
    isCorrect: Boolean,
    timeSpent: Number // milliseconds
  }],
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  score: {
    type: Number,
    default: 0
  },
  accuracy: {
    type: Number, // 0-100%
    default: 0
  },
  timeSpent: {
    type: Number, // Total time in seconds
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  completedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Calculate score and accuracy before saving
imageMatchAttemptSchema.pre('save', function(next) {
  if (this.isModified('answers')) {
    this.correctAnswers = this.answers.filter(a => a.isCorrect).length;
    this.accuracy = (this.correctAnswers / this.totalQuestions) * 100;
    
    // Scoring: 10 points per correct answer + time bonus
    const baseScore = this.correctAnswers * 10;
    const timeBonus = Math.max(0, 50 - Math.floor(this.timeSpent / 10)); // Max 50 bonus
    this.score = baseScore + timeBonus;
  }
  next();
});

/**
 * ===============================================
 * MULTIPLE CHOICE MODEL
 * ===============================================
 * Traditional quiz with 4 options
 */
const multipleChoiceAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  deck: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deck',
    required: true,
    index: true
  },
  questions: [{
    flashcard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flashcard'
    },
    questionType: {
      type: String,
      enum: ['word-to-meaning', 'meaning-to-word', 'image-to-word', 'audio-to-word'],
      default: 'word-to-meaning'
    },
    question: String, // The prompt
    options: [String], // 4 options
    correctAnswer: String,
    selectedAnswer: String,
    isCorrect: Boolean,
    timeSpent: Number // milliseconds
  }],
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  score: {
    type: Number,
    default: 0
  },
  accuracy: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number,
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  completedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Calculate score before saving
multipleChoiceAttemptSchema.pre('save', function(next) {
  if (this.isModified('questions')) {
    this.correctAnswers = this.questions.filter(q => q.isCorrect).length;
    this.accuracy = (this.correctAnswers / this.totalQuestions) * 100;
    
    // Scoring with time bonus
    const baseScore = this.correctAnswers * 15;
    const avgTime = this.timeSpent / this.totalQuestions;
    const timeBonus = Math.max(0, 100 - Math.floor(avgTime / 1000)); // Max 100 bonus
    this.score = baseScore + timeBonus;
  }
  next();
});

/**
 * ===============================================
 * MATCHING PAIRS MODEL
 * ===============================================
 * Match words with meanings/images
 */
const matchingAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  deck: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deck',
    required: true,
    index: true
  },
  pairs: [{
    flashcard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flashcard'
    },
    leftItem: String, // Word or image URL
    rightItem: String, // Meaning or word
    leftType: {
      type: String,
      enum: ['word', 'image', 'audio'],
      default: 'word'
    },
    rightType: {
      type: String,
      enum: ['meaning', 'word', 'image'],
      default: 'meaning'
    }
  }],
  matches: [{
    leftIndex: Number,
    rightIndex: Number,
    isCorrect: Boolean,
    attempts: Number // How many tries
  }],
  totalPairs: {
    type: Number,
    required: true
  },
  correctMatches: {
    type: Number,
    default: 0
  },
  totalAttempts: {
    type: Number,
    default: 0
  },
  score: {
    type: Number,
    default: 0
  },
  accuracy: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number,
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  completedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Calculate score before saving
matchingAttemptSchema.pre('save', function(next) {
  if (this.isModified('matches')) {
    this.correctMatches = this.matches.filter(m => m.isCorrect).length;
    this.accuracy = (this.correctMatches / this.totalPairs) * 100;
    
    // Scoring: points decrease with more attempts
    let score = 0;
    this.matches.forEach(match => {
      if (match.isCorrect) {
        const penalty = (match.attempts - 1) * 2; // -2 points per retry
        score += Math.max(5, 20 - penalty); // Min 5 points per correct match
      }
    });
    
    // Time bonus
    const timeBonus = Math.max(0, 100 - Math.floor(this.timeSpent / 10));
    this.score = score + timeBonus;
  }
  next();
});

/**
 * ===============================================
 * SPELLING BEE MODEL
 * ===============================================
 * Spell words by listening to audio
 */
const spellingBeeAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  deck: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deck',
    required: true,
    index: true
  },
  words: [{
    flashcard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flashcard'
    },
    correctWord: String,
    userSpelling: String,
    isCorrect: Boolean,
    attempts: Number, // Number of tries (max 3)
    hints: [{
      type: String, // 'first-letter', 'word-length', 'definition'
      usedAt: Date
    }],
    timeSpent: Number,
    audioPlayCount: Number // How many times audio was played
  }],
  totalWords: {
    type: Number,
    required: true
  },
  correctWords: {
    type: Number,
    default: 0
  },
  perfectWords: {
    type: Number, // Correct on first try
    default: 0
  },
  score: {
    type: Number,
    default: 0
  },
  accuracy: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number,
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  completedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Calculate score before saving
spellingBeeAttemptSchema.pre('save', function(next) {
  if (this.isModified('words')) {
    this.correctWords = this.words.filter(w => w.isCorrect).length;
    this.perfectWords = this.words.filter(w => w.isCorrect && w.attempts === 1).length;
    this.accuracy = (this.correctWords / this.totalWords) * 100;
    
    // Scoring: bonus for first-try, penalty for hints
    let score = 0;
    this.words.forEach(word => {
      if (word.isCorrect) {
        let points = 25; // Base points
        
        // First try bonus
        if (word.attempts === 1) points += 10;
        
        // Attempt penalty
        points -= (word.attempts - 1) * 5;
        
        // Hint penalty
        points -= word.hints.length * 3;
        
        score += Math.max(5, points); // Min 5 points
      }
    });
    
    this.score = score;
  }
  next();
});

// Static methods for statistics
const getStatsMethod = async function(userId, options = {}) {
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
        averageScore: { $avg: '$score' },
        averageAccuracy: { $avg: '$accuracy' },
        totalTimeSpent: { $sum: '$timeSpent' },
        highestScore: { $max: '$score' },
        lowestScore: { $min: '$score' }
      }
    }
  ]);
  
  return stats[0] || {
    totalAttempts: 0,
    averageScore: 0,
    averageAccuracy: 0,
    totalTimeSpent: 0,
    highestScore: 0,
    lowestScore: 0
  };
};

// Add static method to all schemas
imageMatchAttemptSchema.statics.getUserStats = getStatsMethod;
multipleChoiceAttemptSchema.statics.getUserStats = getStatsMethod;
matchingAttemptSchema.statics.getUserStats = getStatsMethod;
spellingBeeAttemptSchema.statics.getUserStats = getStatsMethod;

// Indexes for performance
imageMatchAttemptSchema.index({ user: 1, completedAt: -1 });
multipleChoiceAttemptSchema.index({ user: 1, completedAt: -1 });
matchingAttemptSchema.index({ user: 1, completedAt: -1 });
spellingBeeAttemptSchema.index({ user: 1, completedAt: -1 });

// Export models
const ImageMatchAttempt = mongoose.model('ImageMatchAttempt', imageMatchAttemptSchema);
const MultipleChoiceAttempt = mongoose.model('MultipleChoiceAttempt', multipleChoiceAttemptSchema);
const MatchingAttempt = mongoose.model('MatchingAttempt', matchingAttemptSchema);
const SpellingBeeAttempt = mongoose.model('SpellingBeeAttempt', spellingBeeAttemptSchema);

module.exports = {
  ImageMatchAttempt,
  MultipleChoiceAttempt,
  MatchingAttempt,
  SpellingBeeAttempt
};
