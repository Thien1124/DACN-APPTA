const mongoose = require('mongoose');

// Main Mnemonic Schema
const MnemonicSchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true
  },
  wordVietnamese: {
    type: String,
    trim: true
  },
  
  // Different types of mnemonics
  mnemonicTypes: [{
    type: {
      type: String,
      enum: ['acronym', 'rhyme', 'story', 'association', 'visual', 'phonetic', 'chunking'],
      required: true
    },
    technique: {
      type: String,
      required: true
    },
    techniqueVietnamese: String,
    description: {
      type: String,
      required: true
    },
    descriptionVietnamese: String,
    example: {
      type: String,
      required: true
    },
    exampleVietnamese: String,
    effectiveness: {
      type: String,
      enum: ['very high', 'high', 'moderate', 'low'],
      default: 'moderate'
    },
    difficulty: {
      type: String,
      enum: ['easy', 'moderate', 'hard'],
      default: 'moderate'
    }
  }],
  
  // Visualization suggestions
  visualizations: [{
    type: {
      type: String,
      enum: ['mental image', 'scene', 'action', 'symbol', 'color association', 'spatial'],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    descriptionVietnamese: String,
    imageDescription: {
      type: String,
      required: true
    },
    imageDescriptionVietnamese: String,
    keyElements: [String],
    keyElementsVietnamese: [String],
    emotionalConnection: {
      emotion: String,
      emotionVietnamese: String,
      reason: String,
      reasonVietnamese: String
    },
    memorabilityScore: {
      type: Number,
      min: 1,
      max: 10,
      default: 7
    }
  }],
  
  // Memory palace / spatial technique
  spatialTechniques: [{
    location: {
      type: String,
      required: true
    },
    locationVietnamese: String,
    placement: {
      type: String,
      required: true
    },
    placementVietnamese: String,
    interaction: {
      type: String,
      required: true
    },
    interactionVietnamese: String,
    visualization: String,
    visualizationVietnamese: String
  }],
  
  // Association chains
  associations: [{
    associationType: {
      type: String,
      enum: ['sound', 'meaning', 'personal experience', 'cultural reference', 'similar word', 'opposite'],
      required: true
    },
    connection: {
      type: String,
      required: true
    },
    connectionVietnamese: String,
    explanation: {
      type: String,
      required: true
    },
    explanationVietnamese: String,
    strength: {
      type: String,
      enum: ['very strong', 'strong', 'moderate', 'weak'],
      default: 'moderate'
    }
  }],
  
  // Story-based mnemonics
  stories: [{
    title: {
      type: String,
      required: true
    },
    titleVietnamese: String,
    story: {
      type: String,
      required: true
    },
    storyVietnamese: String,
    keyWords: [String],
    keyWordsVietnamese: [String],
    moralOrLesson: String,
    moralOrLessonVietnamese: String,
    difficulty: {
      type: String,
      enum: ['simple', 'moderate', 'complex'],
      default: 'moderate'
    }
  }],
  
  // Phonetic/sound-based techniques
  phoneticTechniques: [{
    soundPattern: {
      type: String,
      required: true
    },
    similarSoundingWord: String,
    similarSoundingWordVietnamese: String,
    rhyme: String,
    rhymeVietnamese: String,
    explanation: String,
    explanationVietnamese: String
  }],
  
  // Chunking techniques
  chunkingMethods: [{
    method: {
      type: String,
      required: true
    },
    methodVietnamese: String,
    breakdown: {
      type: String,
      required: true
    },
    breakdownVietnamese: String,
    explanation: String,
    explanationVietnamese: String,
    example: String,
    exampleVietnamese: String
  }],
  
  // Memory tips and best practices
  memoryTips: [{
    tip: {
      type: String,
      required: true
    },
    tipVietnamese: String,
    category: {
      type: String,
      enum: ['repetition', 'emotion', 'personalization', 'multisensory', 'timing', 'practice'],
      required: true
    },
    effectiveness: String,
    effectivenessVietnamese: String
  }],
  
  // Recall strategies
  recallStrategies: [{
    strategy: {
      type: String,
      required: true
    },
    strategyVietnamese: String,
    whenToUse: String,
    whenToUseVietnamese: String,
    steps: [String],
    stepsVietnamese: [String]
  }],
  
  // Review schedule recommendations
  reviewSchedule: {
    immediate: String,
    immediateVietnamese: String,
    after1Hour: String,
    after1HourVietnamese: String,
    after1Day: String,
    after1DayVietnamese: String,
    after1Week: String,
    after1WeekVietnamese: String,
    after1Month: String,
    after1MonthVietnamese: String,
    reasoning: String,
    reasoningVietnamese: String
  },
  
  // Metadata
  aiModel: {
    type: String,
    default: 'gemini-2.5-flash'
  },
  requestCount: {
    type: Number,
    default: 1
  },
  lastRequested: {
    type: Date,
    default: Date.now
  },
  
  // Ratings
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    mnemonicType: String, // which type was most helpful
    feedback: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Caching
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
}, {
  timestamps: true
});

// Indexes
MnemonicSchema.index({ word: 1 });
MnemonicSchema.index({ expiresAt: 1 });
MnemonicSchema.index({ createdAt: -1 });

// Update request count
MnemonicSchema.methods.incrementRequestCount = function() {
  this.requestCount += 1;
  this.lastRequested = new Date();
  return this.save();
};

// Add rating
MnemonicSchema.methods.addRating = function(userId, rating, mnemonicType, feedback) {
  this.ratings.push({
    user: userId,
    rating,
    mnemonicType,
    feedback
  });
  
  // Recalculate average
  const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
  this.averageRating = sum / this.ratings.length;
  this.totalRatings = this.ratings.length;
  
  return this.save();
};

// Visualization Suggestion Schema (for complex visualizations)
const VisualizationSuggestionSchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true
  },
  wordVietnamese: String,
  
  // Detailed visualization
  mainVisualization: {
    scene: {
      type: String,
      required: true
    },
    sceneVietnamese: String,
    detailedDescription: {
      type: String,
      required: true
    },
    detailedDescriptionVietnamese: String,
    keyElements: [{
      element: String,
      elementVietnamese: String,
      role: String,
      roleVietnamese: String,
      visualDetails: String,
      visualDetailsVietnamese: String
    }],
    colors: [{
      color: String,
      meaning: String,
      meaningVietnamese: String
    }],
    movements: [{
      action: String,
      actionVietnamese: String,
      purpose: String,
      purposeVietnamese: String
    }],
    emotions: [{
      emotion: String,
      emotionVietnamese: String,
      intensity: String,
      trigger: String,
      triggerVietnamese: String
    }]
  },
  
  // Multi-sensory experience
  sensoryDetails: {
    visual: {
      description: String,
      descriptionVietnamese: String,
      focus: [String],
      focusVietnamese: [String]
    },
    auditory: {
      sounds: [String],
      soundsVietnamese: [String],
      description: String,
      descriptionVietnamese: String
    },
    tactile: {
      textures: [String],
      texturesVietnamese: [String],
      description: String,
      descriptionVietnamese: String
    },
    olfactory: {
      smells: [String],
      smellsVietnamese: [String],
      description: String,
      descriptionVietnamese: String
    },
    kinesthetic: {
      movements: [String],
      movementsVietnamese: [String],
      description: String,
      descriptionVietnamese: String
    }
  },
  
  // Step-by-step visualization guide
  visualizationSteps: [{
    step: Number,
    instruction: String,
    instructionVietnamese: String,
    duration: String,
    focus: String,
    focusVietnamese: String
  }],
  
  // Personalization suggestions
  personalizationTips: [{
    tip: String,
    tipVietnamese: String,
    example: String,
    exampleVietnamese: String
  }],
  
  // Practice exercises
  practiceExercises: [{
    exercise: String,
    exerciseVietnamese: String,
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced']
    },
    duration: String,
    expectedOutcome: String,
    expectedOutcomeVietnamese: String
  }],
  
  // Effectiveness tracking
  helpfulCount: {
    type: Number,
    default: 0
  },
  notHelpfulCount: {
    type: Number,
    default: 0
  },
  feedback: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isHelpful: Boolean,
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Metadata
  aiModel: {
    type: String,
    default: 'gemini-2.5-flash'
  },
  requestCount: {
    type: Number,
    default: 1
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }
}, {
  timestamps: true
});

// Indexes
VisualizationSuggestionSchema.index({ word: 1 });
VisualizationSuggestionSchema.index({ expiresAt: 1 });

// Memory Technique Template Schema
const MemoryTechniqueSchema = new mongoose.Schema({
  techniqueName: {
    type: String,
    required: true,
    unique: true
  },
  techniqueNameVietnamese: String,
  category: {
    type: String,
    enum: ['mnemonic', 'visualization', 'spatial', 'association', 'story', 'phonetic', 'chunking', 'multisensory'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  descriptionVietnamese: String,
  
  // When to use
  bestFor: [{
    wordType: String,
    wordTypeVietnamese: String,
    reason: String,
    reasonVietnamese: String
  }],
  
  // Step-by-step guide
  steps: [{
    step: Number,
    instruction: String,
    instructionVietnamese: String,
    example: String,
    exampleVietnamese: String
  }],
  
  // Pros and cons
  advantages: [{
    advantage: String,
    advantageVietnamese: String
  }],
  disadvantages: [{
    disadvantage: String,
    disadvantageVietnamese: String
  }],
  
  // Example applications
  examples: [{
    word: String,
    wordVietnamese: String,
    application: String,
    applicationVietnamese: String,
    result: String,
    resultVietnamese: String
  }],
  
  // Difficulty and effectiveness
  difficulty: {
    type: String,
    enum: ['easy', 'moderate', 'hard'],
    default: 'moderate'
  },
  effectiveness: {
    type: String,
    enum: ['very high', 'high', 'moderate', 'low'],
    default: 'high'
  },
  
  // Usage stats
  timesUsed: {
    type: Number,
    default: 0
  },
  successRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, {
  timestamps: true
});

const Mnemonic = mongoose.model('Mnemonic', MnemonicSchema);
const VisualizationSuggestion = mongoose.model('VisualizationSuggestion', VisualizationSuggestionSchema);
const MemoryTechnique = mongoose.model('MemoryTechnique', MemoryTechniqueSchema);

module.exports = {
  Mnemonic,
  VisualizationSuggestion,
  MemoryTechnique
};
