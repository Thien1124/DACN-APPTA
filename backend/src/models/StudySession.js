const mongoose = require('mongoose');

/**
 * Model StudySession - Lưu trữ phiên học của user
 */
const studySessionSchema = new mongoose.Schema({
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
  
  // Study mode
  studyMode: {
    type: String,
    enum: ['FLIP', 'TYPE_IN', 'MULTIPLE_CHOICE', 'MIXED'],
    default: 'FLIP',
    required: true
  },
  
  // Session type
  sessionType: {
    type: String,
    enum: ['LEARN_NEW', 'REVIEW', 'PRACTICE', 'TEST'],
    default: 'LEARN_NEW',
    required: true
  },
  
  // Cards in this session
  totalCards: {
    type: Number,
    default: 0
  },
  
  completedCards: {
    type: Number,
    default: 0
  },
  
  // Results
  correctAnswers: {
    type: Number,
    default: 0
  },
  
  incorrectAnswers: {
    type: Number,
    default: 0
  },
  
  skippedCards: {
    type: Number,
    default: 0
  },
  
  // Score
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Time tracking
  startTime: {
    type: Date,
    default: Date.now
  },
  
  endTime: {
    type: Date
  },
  
  duration: {
    type: Number, // in seconds
    default: 0
  },
  
  // Session status
  status: {
    type: String,
    enum: ['IN_PROGRESS', 'COMPLETED', 'ABANDONED'],
    default: 'IN_PROGRESS',
    index: true
  },
  
  // Card reviews in this session
  cardReviews: [{
    flashcard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flashcard'
    },
    correct: Boolean,
    skipped: Boolean,
    userAnswer: String,
    correctAnswer: String,
    responseTime: Number, // in seconds
    quality: {
      type: Number,
      min: 0,
      max: 5
    },
    reviewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // XP earned in this session
  xpEarned: {
    type: Number,
    default: 0
  },
  
  // Streaks
  streakCount: {
    type: Number,
    default: 0
  },
  
  maxStreak: {
    type: Number,
    default: 0
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for queries
studySessionSchema.index({ user: 1, deck: 1, createdAt: -1 });
studySessionSchema.index({ user: 1, status: 1 });

// Method: Complete session
studySessionSchema.methods.completeSession = function() {
  this.status = 'COMPLETED';
  this.endTime = new Date();
  this.duration = Math.round((this.endTime - this.startTime) / 1000); // seconds
  
  // Calculate score
  if (this.totalCards > 0) {
    this.score = Math.round((this.correctAnswers / this.totalCards) * 100);
  }
  
  // Calculate XP earned
  this.xpEarned = this.calculateXP();
  
  this.updatedAt = Date.now();
  return this.save();
};

// Method: Calculate XP
studySessionSchema.methods.calculateXP = function() {
  let xp = 0;
  
  // Base XP per correct answer
  xp += this.correctAnswers * 10;
  
  // Bonus for high accuracy
  if (this.score >= 90) {
    xp += 50; // Perfect score bonus
  } else if (this.score >= 80) {
    xp += 30;
  } else if (this.score >= 70) {
    xp += 15;
  }
  
  // Bonus for streak
  if (this.maxStreak >= 10) {
    xp += 25;
  } else if (this.maxStreak >= 5) {
    xp += 10;
  }
  
  // Bonus for completing session
  if (this.completedCards === this.totalCards) {
    xp += 20;
  }
  
  return xp;
};

// Method: Add card review
studySessionSchema.methods.addCardReview = function(reviewData) {
  this.cardReviews.push(reviewData);
  this.completedCards += 1;
  
  if (reviewData.correct) {
    this.correctAnswers += 1;
    this.streakCount += 1;
    this.maxStreak = Math.max(this.maxStreak, this.streakCount);
  } else if (reviewData.skipped) {
    this.skippedCards += 1;
    this.streakCount = 0;
  } else {
    this.incorrectAnswers += 1;
    this.streakCount = 0;
  }
  
  this.updatedAt = Date.now();
  return this.save();
};

// Static method: Get user statistics
studySessionSchema.statics.getUserStats = async function(userId, deckId = null) {
  const matchQuery = { 
    user: userId,
    status: 'COMPLETED'
  };
  
  if (deckId) {
    matchQuery.deck = deckId;
  }
  
  const stats = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalCards: { $sum: '$totalCards' },
        totalCorrect: { $sum: '$correctAnswers' },
        totalIncorrect: { $sum: '$incorrectAnswers' },
        totalXP: { $sum: '$xpEarned' },
        totalTime: { $sum: '$duration' },
        averageScore: { $avg: '$score' },
        maxStreak: { $max: '$maxStreak' }
      }
    }
  ]);
  
  if (stats.length === 0) {
    return {
      totalSessions: 0,
      totalCards: 0,
      totalCorrect: 0,
      totalIncorrect: 0,
      totalXP: 0,
      totalTime: 0,
      averageScore: 0,
      maxStreak: 0,
      accuracy: 0
    };
  }
  
  const result = stats[0];
  result.accuracy = result.totalCards > 0 
    ? Math.round((result.totalCorrect / result.totalCards) * 100)
    : 0;
  
  delete result._id;
  return result;
};

const StudySession = mongoose.model('StudySession', studySessionSchema);

module.exports = StudySession;
