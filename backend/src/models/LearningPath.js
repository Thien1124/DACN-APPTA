const mongoose = require('mongoose');

/**
 * LearningPath (Roadmap) - Lộ trình theo mục tiêu (Task 20)
 */
const learningUnitSchema = new mongoose.Schema({
  type: {
    type: String, // deck | lesson | test | practice
    enum: ['deck', 'lesson', 'test', 'practice'],
    required: true
  },
  refId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  title: {
    type: String
  },
  weekIndex: {
    type: Number,
    default: 1
  },
  dayIndex: {
    type: Number,
    default: 1
  },
  estimatedMinutes: {
    type: Number,
    default: 20
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
}, { _id: false });

const learningPathSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  goalType: {
    type: String, // ví dụ: TOEIC_CORE_650, IELTS_B1, VOCAB_CORE
    required: true,
    index: true
  },

  targetScore: {
    type: Number // 650 (TOEIC), v.v.
  },

  targetDate: {
    type: Date
  },

  totalWeeks: {
    type: Number,
    default: 8
  },

  plan: [learningUnitSchema],

  progress: {
    totalUnits: { type: Number, default: 0 },
    completedUnits: { type: Number, default: 0 },
    percent: { type: Number, default: 0 }
  },

  isActive: {
    type: Boolean,
    default: true
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

learningPathSchema.index({ user: 1, isActive: 1 });

const LearningPath = mongoose.model('LearningPath', learningPathSchema);

module.exports = LearningPath;


