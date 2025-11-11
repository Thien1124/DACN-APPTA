const mongoose = require('mongoose');

/**
 * WordExplanation Schema
 * Stores AI-generated explanations for vocabulary words
 * Includes caching to avoid repeated AI calls
 */
const wordExplanationSchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  
  // Basic explanation
  basicMeaning: {
    type: String,
    required: true
  },
  
  basicMeaningVietnamese: String,
  
  // Detailed explanation
  detailedExplanation: {
    type: String,
    required: true
  },
  
  detailedExplanationVietnamese: String,
  
  // Nuances (sắc thái)
  nuances: [{
    context: String,              // "formal", "informal", "casual", "academic", etc.
    description: String,          // How the word is used in this context
    descriptionVietnamese: String,
    example: String,
    exampleVietnamese: String
  }],
  
  // Usage contexts
  usageContexts: [{
    situation: String,            // "business meeting", "casual conversation", etc.
    appropriateness: String,      // "appropriate", "inappropriate", "neutral"
    explanation: String,
    explanationVietnamese: String,
    example: String,
    exampleVietnamese: String
  }],
  
  // Common collocations
  commonCollocations: [{
    phrase: String,
    meaning: String,
    meaningVietnamese: String,
    example: String,
    exampleVietnamese: String,
    frequency: {
      type: String,
      enum: ['very common', 'common', 'occasional', 'rare']
    }
  }],
  
  // Common mistakes
  commonMistakes: [{
    mistake: String,
    correction: String,
    explanation: String,
    explanationVietnamese: String
  }],
  
  // Tips for usage
  usageTips: [{
    tip: String,
    tipVietnamese: String,
    category: {
      type: String,
      enum: ['grammar', 'pronunciation', 'usage', 'cultural', 'formality']
    }
  }],
  
  // Related words explanation
  relatedWords: [{
    word: String,
    relationship: String,         // "synonym", "antonym", "related concept"
    difference: String,           // How it differs from the main word
    differenceVietnamese: String,
    whenToUse: String,
    whenToUseVietnamese: String
  }],
  
  // Formality level
  formalityAnalysis: {
    level: {
      type: String,
      enum: ['very formal', 'formal', 'neutral', 'informal', 'very informal', 'slang']
    },
    explanation: String,
    explanationVietnamese: String,
    alternatives: [{
      word: String,
      level: String,
      context: String
    }]
  },
  
  // Emotional connotation
  emotionalConnotation: {
    type: {
      type: String,
      enum: ['positive', 'negative', 'neutral']
    },
    intensity: String,            // "mild", "moderate", "strong"
    explanation: String,
    explanationVietnamese: String
  },
  
  // Cultural notes
  culturalNotes: [{
    note: String,
    noteVietnamese: String,
    region: String                // "US", "UK", "Australia", etc.
  }],
  
  // AI model used (Gemini 2.5 Flash - same as Task 21)
  aiModel: {
    type: String,
    default: 'gemini-2.5-flash'
  },
  
  // Cache metadata
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  requestCount: {
    type: Number,
    default: 1
  },
  
  lastRequested: {
    type: Date,
    default: Date.now
  },
  
  // Quality metrics
  userRatings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  
  // Cache control
  expiresAt: {
    type: Date,
    index: true
  },
  
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
wordExplanationSchema.index({ word: 1, aiModel: 1 });
wordExplanationSchema.index({ expiresAt: 1 });
wordExplanationSchema.index({ averageRating: -1 });

// Update average rating when new rating is added
wordExplanationSchema.methods.updateAverageRating = function() {
  if (this.userRatings.length > 0) {
    const sum = this.userRatings.reduce((acc, r) => acc + r.rating, 0);
    this.averageRating = sum / this.userRatings.length;
  }
};

/**
 * SynonymComparison Schema
 * Stores AI-generated comparisons between synonyms
 */
const synonymComparisonSchema = new mongoose.Schema({
  words: [{
    type: String,
    required: true,
    lowercase: true,
    trim: true
  }],
  
  // Overall comparison
  summary: {
    type: String,
    required: true
  },
  
  summaryVietnamese: String,
  
  // Detailed comparison for each word
  wordDetails: [{
    word: String,
    
    // Core characteristics
    mainMeaning: String,
    mainMeaningVietnamese: String,
    
    // Distinguishing features
    distinctiveFeatures: [{
      feature: String,
      featureVietnamese: String,
      explanation: String,
      explanationVietnamese: String
    }],
    
    // Formality level
    formality: String,
    
    // Frequency of use
    frequency: String,
    
    // Best contexts
    bestContexts: [String],
    
    // Example sentences
    examples: [{
      sentence: String,
      sentenceVietnamese: String,
      context: String
    }]
  }],
  
  // When to use each word
  usageGuidelines: [{
    scenario: String,
    scenarioVietnamese: String,
    recommendedWord: String,
    reason: String,
    reasonVietnamese: String,
    example: String,
    exampleVietnamese: String
  }],
  
  // Common confusions
  commonConfusions: [{
    confusion: String,
    confusionVietnamese: String,
    clarification: String,
    clarificationVietnamese: String
  }],
  
  // Visual comparison table data
  comparisonMatrix: [{
    criterion: String,              // "Formality", "Intensity", "Frequency", etc.
    criterionVietnamese: String,
    values: mongoose.Schema.Types.Mixed  // Object with word: value pairs
  }],
  
  // AI model used (Gemini 2.5 Flash)
  aiModel: {
    type: String,
    default: 'gemini-2.5-flash'
  },
  
  // Cache metadata
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  requestCount: {
    type: Number,
    default: 1
  },
  
  lastRequested: {
    type: Date,
    default: Date.now
  },
  
  // Quality metrics
  helpfulCount: {
    type: Number,
    default: 0
  },
  
  notHelpfulCount: {
    type: Number,
    default: 0
  },
  
  // Cache control
  expiresAt: {
    type: Date,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for words array
synonymComparisonSchema.index({ words: 1 });

/**
 * ContextExample Schema
 * Stores AI-generated context-specific examples
 */
const contextExampleSchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  
  context: {
    type: String,
    required: true,
    index: true
  },
  
  // Examples for this context
  examples: [{
    situation: String,
    situationVietnamese: String,
    dialogue: [{
      speaker: String,
      text: String,
      textVietnamese: String,
      explanation: String
    }],
    keyPoints: [String],
    keyPointsVietnamese: [String]
  }],
  
  // Do's and Don'ts
  dos: [{
    point: String,
    pointVietnamese: String,
    example: String,
    exampleVietnamese: String
  }],
  
  donts: [{
    point: String,
    pointVietnamese: String,
    wrongExample: String,
    correctExample: String,
    explanation: String,
    explanationVietnamese: String
  }],
  
  // AI model used (Gemini 2.5 Flash)
  aiModel: {
    type: String,
    default: 'gemini-2.5-flash'
  },
  
  // Cache metadata
  requestCount: {
    type: Number,
    default: 1
  },
  
  lastRequested: {
    type: Date,
    default: Date.now
  },
  
  // Cache control
  expiresAt: {
    type: Date,
    index: true
  }
}, {
  timestamps: true
});

// Compound index
contextExampleSchema.index({ word: 1, context: 1 });

const WordExplanation = mongoose.model('WordExplanation', wordExplanationSchema);
const SynonymComparison = mongoose.model('SynonymComparison', synonymComparisonSchema);
const ContextExample = mongoose.model('ContextExample', contextExampleSchema);

module.exports = {
  WordExplanation,
  SynonymComparison,
  ContextExample
};
