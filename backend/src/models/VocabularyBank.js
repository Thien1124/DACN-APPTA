const mongoose = require('mongoose');

const vocabularyBankSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  word: {
    type: String,
    required: [true, 'Vui lòng nhập từ vựng'],
    trim: true
  },
  pronunciation: {
    type: String,
    trim: true
  },
  meaning: {
    type: String,
    required: [true, 'Vui lòng nhập nghĩa'],
    trim: true
  },
  partOfSpeech: {
    type: String,
    enum: ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun', 'interjection', 'phrase', 'idiom', 'other'],
    trim: true
  },
  example: {
    type: String,
    trim: true
  },
  synonyms: [String],
  antonyms: [String],
  imageUrl: String,
  audioUrl: String,
  tags: [String],
  difficulty: {
    type: String,
    enum: ['beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced'],
    default: 'intermediate'
  },
  cefrLevel: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  },
  source: {
    type: String,
    enum: ['manual', 'flashcard', 'lesson', 'exercise'],
    default: 'manual'
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'sourceModel'
  },
  sourceModel: {
    type: String,
    enum: ['Flashcard', 'Vocabulary', 'Lesson', 'Exercise']
  },
  isStarred: {
    type: Boolean,
    default: false
  },
  isLearned: {
    type: Boolean,
    default: false
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  mastery: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lastReviewed: Date,
  nextReview: Date,
  notes: String
}, {
  timestamps: true
});

// Index for faster queries
vocabularyBankSchema.index({ user: 1, word: 1 }, { unique: true });
vocabularyBankSchema.index({ user: 1, isStarred: 1 });
vocabularyBankSchema.index({ user: 1, isLearned: 1 });

module.exports = mongoose.model('VocabularyBank', vocabularyBankSchema);