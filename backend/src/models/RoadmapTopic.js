const mongoose = require('mongoose');

const roadmapTopicSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['vocabulary', 'grammar', 'listening', 'reading', 'speaking', 'writing', 'mixed'],
    default: 'mixed'
  },
  startLevel: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    required: true
  },
  currentLevel: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  },
  targetLevel: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    required: true
  },
  steps: [{
    stepNumber: Number,
    level: {
      type: String,
      enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    },
    title: String,
    description: String,
    category: {
      type: String,
      enum: ['vocabulary', 'grammar', 'listening', 'reading', 'speaking', 'writing', 'mixed']
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced'],
      default: 'intermediate'
    },
    exercises: [{
      type: { type: String },
      content: String,
      options: [String],
      correctAnswer: String,
      explanation: String,
      points: Number
    }],
    vocabularySet: [{
      word: String,
      pronunciation: String,
      meaning: String,
      example: String,
      exampleTranslation: String,
      partOfSpeech: String,
      difficulty: String,
      cefrLevel: String
    }],
    grammarRules: [{
      rule: String,
      explanation: String,
      examples: [String]
    }],
    minScore: {
      type: Number,
      default: 70
    },
    xpReward: Number,
    estimatedTime: Number,
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    attempts: Number,
    bestScore: Number
  }],
  currentStep: {
    type: Number,
    default: 1
  },
  overallProgress: {
    type: Number,
    default: 0
  },
  totalXP: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  estimatedCompletionDate: Date,
  completedAt: Date,
  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RoadmapTopic', roadmapTopicSchema);