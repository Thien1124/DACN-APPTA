const mongoose = require('mongoose');

/**
 * WordbankEntry Schema
 * Represents a vocabulary word from the Wordbank with comprehensive information
 */
const wordbankEntrySchema = new mongoose.Schema({
  // Core word information
  word: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  
  // Pronunciation
  pronunciation: {
    ipa: String,                    // International Phonetic Alphabet
    audio: String,                   // URL to pronunciation audio
    syllables: String                // Syllable breakdown (e.g., "com-mu-ni-cate")
  },
  
  // Part of speech and definitions
  definitions: [{
    partOfSpeech: {
      type: String,
      enum: ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection', 'phrasal verb'],
      required: true
    },
    meaning: {
      type: String,
      required: true
    },
    translation: String,             // Vietnamese translation
    examples: [{
      english: String,
      vietnamese: String
    }]
  }],
  
  // Categorization
  topics: [{
    type: String,
    index: true
  }],
  
  tags: [{
    type: String,
    index: true
  }],
  
  difficulty: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    default: 'B1',
    index: true
  },
  
  frequency: {
    type: Number,                    // Word frequency (1-100, higher = more common)
    min: 0,
    max: 100,
    default: 50
  },
  
  // Related words
  synonyms: [String],
  antonyms: [String],
  
  collocations: [{
    phrase: String,
    meaning: String,
    example: String
  }],
  
  wordFamilies: [{
    word: String,
    partOfSpeech: String,
    meaning: String
  }],
  
  // Usage information
  usageNotes: String,                // Tips on how to use the word
  formalityLevel: {
    type: String,
    enum: ['very formal', 'formal', 'neutral', 'informal', 'slang']
  },
  
  registerType: {
    type: String,
    enum: ['academic', 'business', 'casual', 'literary', 'technical', 'medical', 'legal']
  },
  
  // Origin and etymology
  etymology: String,
  origin: String,                    // e.g., "Latin", "French", "Greek"
  
  // Images for visual learning
  imageUrl: String,
  
  // Source information
  source: {
    type: String,
    default: 'Worldbank'
  },
  
  sourceUrl: String,
  
  // Statistics
  totalLearners: {
    type: Number,
    default: 0
  },
  
  totalAddedToDecks: {
    type: Number,
    default: 0
  },
  
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  
  // Status
  isVerified: {
    type: Boolean,
    default: false
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
wordbankEntrySchema.index({ word: 'text', 'definitions.meaning': 'text' });
wordbankEntrySchema.index({ topics: 1, difficulty: 1 });
wordbankEntrySchema.index({ tags: 1, frequency: -1 });
wordbankEntrySchema.index({ difficulty: 1, frequency: -1 });

// Virtual for word length
wordbankEntrySchema.virtual('length').get(function() {
  return this.word.length;
});

/**
 * UserWordbank Schema
 * Tracks user's personal wordbank collection and learning progress
 */
const userWordbankSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  word: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WordbankEntry',
    required: true,
    index: true
  },
  
  // Learning status
  status: {
    type: String,
    enum: ['new', 'learning', 'reviewing', 'mastered'],
    default: 'new',
    index: true
  },
  
  // Progress tracking
  timesReviewed: {
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
  
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Personal notes
  personalNotes: String,
  
  personalExamples: [{
    sentence: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Tags user added
  personalTags: [String],
  
  // Context where user encountered this word
  sourceContext: String,             // Where did user find this word?
  
  // Spaced repetition
  nextReviewDate: Date,
  reviewInterval: {
    type: Number,
    default: 1                       // Days until next review
  },
  
  easeFactor: {
    type: Number,
    default: 2.5                     // SM-2 algorithm ease factor
  },
  
  // Ratings
  userRating: {
    type: Number,
    min: 1,
    max: 5
  },
  
  // Bookmarking
  isFavorite: {
    type: Boolean,
    default: false
  },
  
  isPriority: {
    type: Boolean,
    default: false                   // High priority to learn
  },
  
  // Dates
  addedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  lastReviewedAt: Date,
  
  masteredAt: Date
}, {
  timestamps: true
});

// Compound index for user-word uniqueness
userWordbankSchema.index({ user: 1, word: 1 }, { unique: true });

// Indexes for queries
userWordbankSchema.index({ user: 1, status: 1, nextReviewDate: 1 });
userWordbankSchema.index({ user: 1, isFavorite: 1 });
userWordbankSchema.index({ user: 1, isPriority: 1 });

// Pre-save hook to update mastered date
userWordbankSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'mastered' && !this.masteredAt) {
    this.masteredAt = new Date();
  }
  next();
});

/**
 * Static method: Get user statistics
 */
userWordbankSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$confidence' }
      }
    }
  ]);
  
  const totalWords = await this.countDocuments({ user: userId });
  const masteredWords = await this.countDocuments({ user: userId, status: 'mastered' });
  const reviewsDue = await this.countDocuments({
    user: userId,
    status: { $in: ['learning', 'reviewing'] },
    nextReviewDate: { $lte: new Date() }
  });
  
  return {
    totalWords,
    masteredWords,
    reviewsDue,
    byStatus: stats,
    masteryPercentage: totalWords > 0 ? (masteredWords / totalWords * 100).toFixed(2) : 0
  };
};

/**
 * WordbankCollection Schema
 * Predefined collections of words by topic/theme
 */
const wordbankCollectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  
  nameVietnamese: String,
  
  description: String,
  descriptionVietnamese: String,
  
  icon: String,                      // Icon for the collection
  color: String,                     // Theme color
  
  category: {
    type: String,
    enum: ['academic', 'business', 'daily-life', 'travel', 'technology', 'health', 'entertainment', 'sports', 'food', 'education', 'exam-prep', 'other'],
    required: true
  },
  
  words: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WordbankEntry'
  }],
  
  difficulty: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Mixed']
  },
  
  estimatedStudyTime: Number,        // Minutes
  
  tags: [String],
  
  // Statistics
  totalWords: {
    type: Number,
    default: 0
  },
  
  subscriberCount: {
    type: Number,
    default: 0
  },
  
  // Status
  isPublic: {
    type: Boolean,
    default: true
  },
  
  isOfficial: {
    type: Boolean,
    default: true
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index
wordbankCollectionSchema.index({ category: 1, difficulty: 1 });
wordbankCollectionSchema.index({ tags: 1 });

// Update totalWords before save
wordbankCollectionSchema.pre('save', function(next) {
  this.totalWords = this.words.length;
  next();
});

const WordbankEntry = mongoose.model('WordbankEntry', wordbankEntrySchema);
const UserWordbank = mongoose.model('UserWordbank', userWordbankSchema);
const WordbankCollection = mongoose.model('WordbankCollection', wordbankCollectionSchema);

module.exports = {
  WordbankEntry,
  UserWordbank,
  WordbankCollection
};
