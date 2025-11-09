// backend/src/models/Progress.js

const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  completedLessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  currentLesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  lessonProgress: {
    type: Map,
    of: {
      attempts: { type: Number, default: 0 },
      bestScore: { type: Number, default: 0 },
      timeSpent: { type: Number, default: 0 },
      completed: { type: Boolean, default: false },
      lastAttempt: { type: Date, default: Date.now }
    },
    default: {}
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

// Middleware để cập nhật updatedAt
progressSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Progress = mongoose.model('Progress', progressSchema);

module.exports = Progress;