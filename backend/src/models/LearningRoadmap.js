const mongoose = require('mongoose');

const roadmapStepSchema = new mongoose.Schema({
  stepNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  skill: {
    type: String,
    required: true,
    enum: ['VOCABULARY', 'GRAMMAR', 'LISTENING', 'READING', 'SPEAKING', 'WRITING', 'MIXED']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    required: true
  },
  exercises: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise'
  }],
  vocabularyBank: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VocabularyBank'
  }],
  minScore: {
    type: Number,
    default: 70 // Điểm tối thiểu để mở khóa bước tiếp theo
  },
  xpReward: {
    type: Number,
    default: 50
  },
  estimatedTime: {
    type: Number, // Thời gian dự kiến (phút)
    default: 15
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  score: Number
});

const learningRoadmapSchema = new mongoose.Schema({
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
    default: 'mixed'
  },
  level: {
    type: String,
    required: true
  },
  steps: [roadmapStepSchema],
  currentStep: {
    type: Number,
    default: 1
  },
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalXP: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  estimatedCompletionDate: Date
}, {
  timestamps: true
});

// Calculate overall progress
learningRoadmapSchema.methods.calculateProgress = function() {
  const completedSteps = this.steps.filter(step => step.isCompleted).length;
  this.overallProgress = Math.round((completedSteps / this.steps.length) * 100);
};

module.exports = mongoose.model('LearningRoadmap', learningRoadmapSchema);