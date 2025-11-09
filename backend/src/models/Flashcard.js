const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
  // Kiểu note (TASK 19)
  noteType: {
    type: String,
    enum: ['WORD', 'PHRASE', 'SENTENCE', 'CLOZE'],
    default: 'WORD',
    required: true
  },
  
  front: {
    type: String,
    required: [true, 'Vui lòng nhập nội dung mặt trước'],
    trim: true
  },
  back: {
    type: String,
    required: [true, 'Vui lòng nhập nội dung mặt sau'],
    trim: true
  },
  example: {
    type: String,
    trim: true
  },
  
  // CLOZE-specific fields
  clozeText: {
    type: String,
    trim: true
  },
  clozeAnswers: [{
    type: String,
    trim: true
  }],
  
  // Pronunciation (IPA)
  pronunciation: {
    type: String,
    trim: true
  },
  
  // ==================== TASK 20: RICH DATA FIELDS ====================
  
  // Vocabulary data
  partOfSpeech: {
    type: String,
    enum: ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun', 'interjection', 'phrase', 'idiom', 'other'],
    trim: true
  },
  
  // Meanings (multiple definitions)
  meanings: [{
    definition: String,
    example: String,
    translation: String
  }],
  
  // Synonyms (đồng nghĩa)
  synonyms: [{
    word: String,
    note: String
  }],
  
  // Antonyms (trái nghĩa)
  antonyms: [{
    word: String,
    note: String
  }],
  
  // Collocations (kết hợp từ)
  collocations: [{
    phrase: String,
    meaning: String,
    example: String
  }],
  
  // Media
  imageUrl: {
    type: String
  },
  audioUrl: {
    type: String
  },
  
  // Multiple images
  images: [{
    url: String,
    caption: String
  }],
  
  // Multiple audio files
  audios: [{
    url: String,
    accent: {
      type: String,
      enum: ['US', 'UK', 'AU', 'other']
    },
    speaker: String
  }],
  
  // Usage notes
  usageNotes: {
    type: String,
    trim: true
  },
  
  // Grammar notes
  grammarNotes: {
    type: String,
    trim: true
  },
  
  // Additional metadata
  hints: {
    type: String,
    trim: true
  },
  
  // Tags for categorization
  tags: [{
    type: String,
    trim: true
  }],
  partOfSpeech: {
    type: String,
    enum: ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun', 'interjection', 'phrase', 'idiom', 'other'],
    trim: true
  },
  
  // Difficulty level
  difficulty: {
    type: String,
    enum: ['beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced'],
    default: 'intermediate'
  },
  
  // CEFR level
  cefrLevel: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  },
  
  deck: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deck',
    required: [true, 'Flashcard phải thuộc về một deck']
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

// Middleware trước khi lưu để cập nhật updatedAt
flashcardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Flashcard = mongoose.model('Flashcard', flashcardSchema);

module.exports = Flashcard;