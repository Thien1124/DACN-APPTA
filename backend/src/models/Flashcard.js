const mongoose = require('mongoose');

const FlashcardSchema = new mongoose.Schema({
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
  imageUrl: {
    type: String
  },
  audioUrl: {
    type: String
  },
  deck: {
    type: mongoose.Schema.ObjectId,
    ref: 'Deck',
    required: [true, 'Flashcard phải thuộc về một bộ thẻ']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware để cập nhật updatedAt trước khi lưu
FlashcardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Flashcard', FlashcardSchema);