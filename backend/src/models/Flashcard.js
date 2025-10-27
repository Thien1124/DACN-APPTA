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
  }
}, {
  // Sử dụng timestamps tích hợp của Mongoose, sạch sẽ hơn
  timestamps: true
});

// Không cần pre-save hook cho 'updatedAt' vì `timestamps: true` đã tự động xử lý

module.exports = mongoose.model('Flashcard', FlashcardSchema);