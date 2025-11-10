const mongoose = require('mongoose');

/**
 * Shadowing Exercise Schema
 * Store audio dialogues/passages for shadowing practice
 */
const ShadowingExerciseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  deck: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deck'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Audio file
  audioUrl: {
    type: String,
    required: true
  },
  audioDuration: {
    type: Number, // Duration in seconds
    required: true
  },
  
  // Transcript with timestamps for segments
  transcript: {
    type: String,
    required: true
  },
  segments: [{
    text: {
      type: String,
      required: true
    },
    startTime: {
      type: Number, // Seconds
      required: true
    },
    endTime: {
      type: Number, // Seconds
      required: true
    },
    speaker: {
      type: String, // 'A', 'B', 'Narrator', etc.
      default: 'A'
    }
  }],
  
  // Difficulty and tags
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  tags: [{
    type: String,
    trim: true
  }],
  
  // Settings
  defaultSpeed: {
    type: Number,
    default: 1.0,
    min: 0.5,
    max: 2.0
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  
  // Statistics
  totalAttempts: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
ShadowingExerciseSchema.index({ createdBy: 1, createdAt: -1 });
ShadowingExerciseSchema.index({ deck: 1 });
ShadowingExerciseSchema.index({ difficulty: 1 });
ShadowingExerciseSchema.index({ isPublic: 1 });

/**
 * Shadowing Attempt Schema
 * Store user's shadowing practice attempts
 */
const ShadowingAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exercise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShadowingExercise',
    required: true
  },
  
  // Playback settings
  playbackSpeed: {
    type: Number,
    default: 1.0,
    min: 0.5,
    max: 2.0
  },
  
  // A-B Repeat markers
  abRepeat: {
    enabled: {
      type: Boolean,
      default: false
    },
    startTime: {
      type: Number, // Seconds
      default: 0
    },
    endTime: {
      type: Number, // Seconds
      default: 0
    },
    loopCount: {
      type: Number,
      default: 0
    }
  },
  
  // Recording
  recordingUrl: {
    type: String
  },
  recordingDuration: {
    type: Number // Seconds
  },
  
  // Pronunciation analysis
  transcription: {
    type: String // What user actually said
  },
  pronunciationScore: {
    type: Number, // 0-100
    default: 0
  },
  accuracyScore: {
    type: Number, // 0-100
    default: 0
  },
  fluencyScore: {
    type: Number, // 0-100
    default: 0
  },
  completenessScore: {
    type: Number, // 0-100
    default: 0
  },
  
  // Detailed feedback
  segmentScores: [{
    segmentIndex: Number,
    expectedText: String,
    spokenText: String,
    score: Number,
    errors: [{
      word: String,
      type: String, // 'pronunciation', 'omission', 'insertion', 'substitution'
      suggestion: String
    }]
  }],
  
  // Time tracking
  timeSpent: {
    type: Number, // Total time spent (seconds)
    default: 0
  },
  pauseCount: {
    type: Number,
    default: 0
  },
  replayCount: {
    type: Number,
    default: 0
  },
  
  // Overall score (weighted average)
  score: {
    type: Number, // 0-100
    default: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
ShadowingAttemptSchema.index({ user: 1, completedAt: -1 });
ShadowingAttemptSchema.index({ exercise: 1, completedAt: -1 });
ShadowingAttemptSchema.index({ user: 1, exercise: 1, createdAt: -1 });

// Pre-save hook to calculate overall score
ShadowingAttemptSchema.pre('save', function(next) {
  if (this.isModified('pronunciationScore') || this.isModified('accuracyScore') || 
      this.isModified('fluencyScore') || this.isModified('completenessScore')) {
    
    // Weighted average: pronunciation 40%, accuracy 30%, fluency 20%, completeness 10%
    this.score = Math.round(
      this.pronunciationScore * 0.4 +
      this.accuracyScore * 0.3 +
      this.fluencyScore * 0.2 +
      this.completenessScore * 0.1
    );
  }
  next();
});

// Static method: Get user statistics
ShadowingAttemptSchema.statics.getUserStats = async function(userId, options = {}) {
  const query = { user: userId, status: 'completed' };
  
  if (options.exerciseId) {
    query.exercise = options.exerciseId;
  }
  
  if (options.startDate) {
    query.completedAt = { $gte: new Date(options.startDate) };
  }
  
  const attempts = await this.find(query);
  
  if (attempts.length === 0) {
    return {
      totalAttempts: 0,
      averageScore: 0,
      averagePronunciation: 0,
      averageAccuracy: 0,
      averageFluency: 0,
      totalTimeSpent: 0,
      bestScore: 0,
      improvement: 0
    };
  }
  
  const stats = attempts.reduce((acc, attempt) => {
    acc.totalScore += attempt.score;
    acc.totalPronunciation += attempt.pronunciationScore;
    acc.totalAccuracy += attempt.accuracyScore;
    acc.totalFluency += attempt.fluencyScore;
    acc.totalTimeSpent += attempt.timeSpent;
    acc.bestScore = Math.max(acc.bestScore, attempt.score);
    return acc;
  }, {
    totalScore: 0,
    totalPronunciation: 0,
    totalAccuracy: 0,
    totalFluency: 0,
    totalTimeSpent: 0,
    bestScore: 0
  });
  
  const count = attempts.length;
  
  // Calculate improvement (compare first 3 and last 3 attempts)
  let improvement = 0;
  if (count >= 6) {
    const firstThree = attempts.slice(0, 3).reduce((sum, a) => sum + a.score, 0) / 3;
    const lastThree = attempts.slice(-3).reduce((sum, a) => sum + a.score, 0) / 3;
    improvement = lastThree - firstThree;
  }
  
  return {
    totalAttempts: count,
    averageScore: Math.round(stats.totalScore / count),
    averagePronunciation: Math.round(stats.totalPronunciation / count),
    averageAccuracy: Math.round(stats.totalAccuracy / count),
    averageFluency: Math.round(stats.totalFluency / count),
    totalTimeSpent: stats.totalTimeSpent,
    bestScore: stats.bestScore,
    improvement: Math.round(improvement)
  };
};

// Static method: Update exercise statistics
ShadowingAttemptSchema.statics.updateExerciseStats = async function(exerciseId) {
  const ShadowingExercise = mongoose.model('ShadowingExercise');
  
  const attempts = await this.find({ 
    exercise: exerciseId, 
    status: 'completed' 
  });
  
  if (attempts.length === 0) {
    await ShadowingExercise.findByIdAndUpdate(exerciseId, {
      totalAttempts: 0,
      averageScore: 0
    });
    return;
  }
  
  const averageScore = attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length;
  
  await ShadowingExercise.findByIdAndUpdate(exerciseId, {
    totalAttempts: attempts.length,
    averageScore: Math.round(averageScore)
  });
};

const ShadowingExercise = mongoose.model('ShadowingExercise', ShadowingExerciseSchema);
const ShadowingAttempt = mongoose.model('ShadowingAttempt', ShadowingAttemptSchema);

module.exports = {
  ShadowingExercise,
  ShadowingAttempt
};
