const mongoose = require('mongoose');

const DeckSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tiêu đề bộ thẻ'],
    trim: true,
    maxlength: [100, 'Tiêu đề không được vượt quá 100 ký tự'],
    index: true
  },
  
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả bộ thẻ'],
    trim: true
  },
  
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit'
  },
  
  // Các trường mới từ nhánh 'main' cho tính năng duyệt và lọc
  category: {
    type: String,
    required: true,
    enum: [
      'ACADEMIC', 'TRAVEL', 'BUSINESS', 'DAILY_LIFE',
      'TECHNOLOGY', 'HEALTH', 'ENTERTAINMENT', 'FOOD', 'GENERAL'
    ],
    default: 'GENERAL',
    index: true
  },
  
  level: {
    type: String,
    required: true,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    default: 'A1',
    index: true
  },
  
  difficulty: {
    type: String,
    required: true,
    enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
    default: 'BEGINNER',
    index: true
  },
  
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
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Các trường thống kê
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
  }
}, {
  // Sử dụng timestamps tích hợp, sạch sẽ hơn
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate để lấy các flashcard thuộc deck
DeckSchema.virtual('flashcards', {
  ref: 'Flashcard',
  foreignField: 'deck',
  localField: '_id'
});

// Virtual để tính rating trung bình
DeckSchema.virtual('averageRating').get(function() {
  return this.ratingCount > 0 ? (this.rating / this.ratingCount).toFixed(1) : 0;
});

// Không cần pre-save hook cho 'updatedAt' vì `timestamps: true` đã tự động xử lý

module.exports = mongoose.model('Deck', DeckSchema);