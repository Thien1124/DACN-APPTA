const mongoose = require('mongoose');

<<<<<<< HEAD
const FlashcardSchema = new mongoose.Schema({
=======
const flashcardSchema = new mongoose.Schema({
>>>>>>> main
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
<<<<<<< HEAD
    type: mongoose.Schema.ObjectId,
    ref: 'Deck',
    required: [true, 'Flashcard phải thuộc về một bộ thẻ']
=======
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deck',
    required: [true, 'Flashcard phải thuộc về một deck']
>>>>>>> main
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
<<<<<<< HEAD
});

// Middleware để cập nhật updatedAt trước khi lưu
FlashcardSchema.pre('save', function(next) {
=======
}, {
  timestamps: true
});

// Middleware trước khi lưu để cập nhật updatedAt
flashcardSchema.pre('save', function(next) {
>>>>>>> main
  this.updatedAt = Date.now();
  next();
});

<<<<<<< HEAD
module.exports = mongoose.model('Flashcard', FlashcardSchema);
=======
const Flashcard = mongoose.model('Flashcard', flashcardSchema);

module.exports = Flashcard;
>>>>>>> main
