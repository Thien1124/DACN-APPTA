const mongoose = require('mongoose');

/**
 * Model StudyProgress - Theo dõi tiến độ học của user cho từng flashcard
 * Sử dụng thuật toán Spaced Repetition (SM-2)
 */
const studyProgressSchema = new mongoose.Schema({
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
    required: true,
    index: true
  },
  
  // Spaced Repetition Algorithm (SM-2)
  easeFactor: {
    type: Number,
    default: 2.5,
    min: 1.3
  },
  
  interval: {
    type: Number,
    default: 0 // Số ngày đến lần review tiếp theo
  },
  
  repetitions: {
    type: Number,
    default: 0 // Số lần review liên tiếp đúng
  },
  
  // Review status
  status: {
    type: String,
    enum: ['NEW', 'LEARNING', 'REVIEWING', 'MASTERED'],
    default: 'NEW',
    index: true
  },
  
  // Next review date
  nextReviewDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  lastReviewDate: {
    type: Date
  },
  
  // Statistics
  totalReviews: {
    type: Number,
    default: 0
  },
  
  correctCount: {
    type: Number,
    default: 0
  },
  
  incorrectCount: {
    type: Number,
    default: 0
  },
  
  // Accuracy percentage
  accuracy: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Average response time (seconds)
  averageResponseTime: {
    type: Number,
    default: 0
  },
  
  // Study mode preferences
  lastStudyMode: {
    type: String,
    enum: ['FLIP', 'TYPE_IN', 'MULTIPLE_CHOICE'],
    default: 'FLIP'
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

// Compound index để tránh duplicate
studyProgressSchema.index({ user: 1, flashcard: 1 }, { unique: true });

// Index cho queries
studyProgressSchema.index({ user: 1, deck: 1 });
studyProgressSchema.index({ user: 1, nextReviewDate: 1 });
studyProgressSchema.index({ user: 1, status: 1 });

// Method: Calculate next review date using SM-2 algorithm
studyProgressSchema.methods.calculateNextReview = function(quality) {
  // quality: 0-5
  // 0-2: incorrect, 3-5: correct
  
  if (quality >= 3) {
    // Correct answer
    this.correctCount += 1;
    this.repetitions += 1;
    
    if (this.repetitions === 1) {
      this.interval = 1;
      this.status = 'LEARNING';
    } else if (this.repetitions === 2) {
      this.interval = 6;
      this.status = 'REVIEWING';
    } else {
      this.interval = Math.round(this.interval * this.easeFactor);
      if (this.repetitions >= 5 && this.accuracy >= 90) {
        this.status = 'MASTERED';
      }
    }
    
    // Update ease factor
    this.easeFactor = this.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (this.easeFactor < 1.3) {
      this.easeFactor = 1.3;
    }
  } else {
    // Incorrect answer
    this.incorrectCount += 1;
    this.repetitions = 0;
    this.interval = 1;
    this.status = 'LEARNING';
  }
  
  // Calculate next review date
  this.nextReviewDate = new Date(Date.now() + this.interval * 24 * 60 * 60 * 1000);
  this.lastReviewDate = new Date();
  this.totalReviews += 1;
  
  // Calculate accuracy
  this.accuracy = Math.round((this.correctCount / this.totalReviews) * 100);
  
  this.updatedAt = Date.now();
};

// Method: Update response time
studyProgressSchema.methods.updateResponseTime = function(timeInSeconds) {
  if (this.totalReviews === 1) {
    this.averageResponseTime = timeInSeconds;
  } else {
    this.averageResponseTime = Math.round(
      (this.averageResponseTime * (this.totalReviews - 1) + timeInSeconds) / this.totalReviews
    );
  }
};

// Static method: Get cards due for review
// TASK 24: Filter out suspended and buried cards
studyProgressSchema.statics.getDueCards = async function(userId, deckId = null) {
  const query = {
    user: userId,
    nextReviewDate: { $lte: new Date() }
  };
  
  if (deckId) {
    query.deck = deckId;
  }
  
  const dueCards = await this.find(query)
    .populate({
      path: 'flashcard',
      match: { status: 'active' } // Only active cards
    })
    .populate('deck', 'title')
    .sort({ nextReviewDate: 1 })
    .limit(20); // Limit to 20 cards per session
  
  // Filter out nulls (where flashcard was suspended/buried)
  return dueCards.filter(card => card.flashcard !== null);
};

// Static method: Get new cards
// TASK 24: Filter out suspended and buried cards
studyProgressSchema.statics.getNewCards = async function(userId, deckId, limit = 10) {
  // Get flashcards that user hasn't studied yet
  const studiedFlashcardIds = await this.distinct('flashcard', { 
    user: userId,
    deck: deckId 
  });
  
  const Flashcard = mongoose.model('Flashcard');
  return Flashcard.find({
    deck: deckId,
    _id: { $nin: studiedFlashcardIds },
    status: 'active' // Only active cards
  }).limit(limit);
};

const StudyProgress = mongoose.model('StudyProgress', studyProgressSchema);

module.exports = StudyProgress;
