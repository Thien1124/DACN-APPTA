const mongoose = require('mongoose');

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
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Deck', DeckSchema);