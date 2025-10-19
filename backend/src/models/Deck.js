const mongoose = require('mongoose');

const deckSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tên deck'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả deck'],
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  imageUrl: {
    type: String,
    default: '/images/default-deck.png'
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate để lấy các flashcard thuộc deck
deckSchema.virtual('flashcards', {
  ref: 'Flashcard',
  foreignField: 'deck',
  localField: '_id'
});

// Middleware trước khi lưu để cập nhật updatedAt
deckSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Deck = mongoose.model('Deck', deckSchema);

module.exports = Deck;