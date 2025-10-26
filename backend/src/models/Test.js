const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    required: false
  },
  
  type: {
    type: String,
    required: true,
    enum: ['PRACTICE', 'TEST', 'EXAM', 'QUIZ'],
    default: 'PRACTICE'
  },
  
  skill: {
    type: String,
    required: true,
    enum: ['LISTENING', 'READING', 'SPEAKING', 'WRITING', 'VOCABULARY', 'GRAMMAR', 'MIXED'],
    index: true
  },
  
  level: {
    type: String,
    required: true,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    index: true
  },
  
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  exercises: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise' // Hoặc model phù hợp
  }],
  
  totalQuestions: {
    type: Number,
    required: true
  },
  
  totalPoints: {
    type: Number,
    required: true
  },
  
  passingScore: {
    type: Number,
    default: 70
  },
  
  timeLimit: {
    type: Number,
    required: false
  },
  
  attempts: {
    type: Number,
    default: -1
  },
  
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: false
  },
  
  isPublic: {
    type: Boolean,
    default: true
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
testSchema.index({ skill: 1, level: 1, isActive: 1, isPublic: 1 });
testSchema.index({ courseId: 1 });

const Test = mongoose.model('Test', testSchema);

module.exports = Test;