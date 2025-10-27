const mongoose = require('mongoose');

<<<<<<< HEAD
const DeckSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tiêu đề bộ thẻ'],
      trim: true,
      maxlength: [100, 'Tiêu đề không được vượt quá 100 ký tự']
    },
    description: {
      type: String,
      required: [true, 'Vui lòng nhập mô tả bộ thẻ'],
      trim: true
    },
    course: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course'
    },
    unit: {
      type: mongoose.Schema.ObjectId,
      ref: 'Unit'
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    imageUrl: {
      type: String,
      default: 'default-deck.jpg'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate
DeckSchema.virtual('flashcards', {
  ref: 'Flashcard',
  localField: '_id',
  foreignField: 'deck',
  justOne: false
});

// Middleware để cập nhật updatedAt trước khi lưu
DeckSchema.pre('save', function(next) {
=======
const deckSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tên deck'],
    trim: true,
    index: true
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
  
  // Category/Topic cho browse & filter
  category: {
    type: String,
    required: true,
    enum: [
      'ACADEMIC',
      'TRAVEL',
      'BUSINESS',
      'DAILY_LIFE',
      'TECHNOLOGY',
      'HEALTH',
      'ENTERTAINMENT',
      'FOOD',
      'GENERAL'
    ],
    default: 'GENERAL',
    index: true
  },
  
  subcategory: {
    type: String,
    trim: true
  },
  
  // CEFR Level
  level: {
    type: String,
    required: true,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    default: 'A1',
    index: true
  },
  
  // Difficulty
  difficulty: {
    type: String,
    required: true,
    enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
    default: 'BEGINNER',
    index: true
  },
  
  // Tags cho tìm kiếm
  tags: [{
    type: String,
    trim: true
  }],
  
  isPublished: {
    type: Boolean,
    default: false
  },
  
  isPublic: {
    type: Boolean,
    default: true,
    index: true
  },
  
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  
  imageUrl: {
    type: String,
    default: '/images/default-deck.png'
  },
  
  // Created by user
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Statistics
  totalCards: {
    type: Number,
    default: 0
  },
  
  viewCount: {
    type: Number,
    default: 0,
    index: true
  },
  
  studyCount: {
    type: Number,
    default: 0,
    index: true
  },
  
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  
  ratingCount: {
    type: Number,
    default: 0
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
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

// Virtual: Average rating
deckSchema.virtual('averageRating').get(function() {
  return this.ratingCount > 0 ? (this.rating / this.ratingCount).toFixed(1) : 0;
});

// Indexes for filtering
deckSchema.index({ category: 1, level: 1, isPublic: 1 });
deckSchema.index({ difficulty: 1, isPublic: 1 });
deckSchema.index({ isFeatured: 1, isPublic: 1 });
deckSchema.index({ studyCount: -1 });
deckSchema.index({ createdAt: -1 });

// Middleware trước khi lưu
deckSchema.pre('save', function(next) {
>>>>>>> main
  this.updatedAt = Date.now();
  next();
});

<<<<<<< HEAD
module.exports = mongoose.model('Deck', DeckSchema);
=======
const Deck = mongoose.model('Deck', deckSchema);

module.exports = Deck;
>>>>>>> main
