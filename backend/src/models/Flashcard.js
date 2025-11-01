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
  
  imageUrl: {
    type: String
  },
  audioUrl: {
    type: String
  },
  
  // Additional metadata
  hints: {
    type: String,
    trim: true
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