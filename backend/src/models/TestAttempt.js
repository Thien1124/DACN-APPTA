const mongoose = require('mongoose');

const testAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true,
    index: true
  },
  
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    userAnswer: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    },
    pointsEarned: {
      type: Number,
      default: 0
    },
    timeSpent: {
      type: Number,
      default: 0
    }
  }],
  
  status: {
    type: String,
    enum: ['IN_PROGRESS', 'COMPLETED', 'ABANDONED'],
    default: 'IN_PROGRESS',
    index: true
  },
  
  score: {
    type: Number,
    default: 0
  },
  
  totalPoints: {
    type: Number,
    required: true
  },
  
  correctAnswers: {
    type: Number,
    default: 0
  },
  
  totalQuestions: {
    type: Number,
    required: true
  },
  
  percentage: {
    type: Number,
    default: 0
  },
  
  passed: {
    type: Boolean,
    default: false
  },
  
  timeSpent: {
    type: Number,
    default: 0
  },
  
  startedAt: {
    type: Date,
    default: Date.now
  },
  
  completedAt: {
    type: Date,
    required: false
  }
});

// Indexes
testAttemptSchema.index({ userId: 1, testId: 1, createdAt: -1 });
testAttemptSchema.index({ userId: 1, status: 1 });

// Method: Complete test
testAttemptSchema.methods.complete = function() {
  this.status = 'COMPLETED';
  this.completedAt = new Date();
  this.percentage = Math.round((this.score / this.totalPoints) * 100);
  this.passed = this.percentage >= 70;
  return this.save();
};

const TestAttempt = mongoose.model('TestAttempt', testAttemptSchema);

module.exports = TestAttempt;