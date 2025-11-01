const mongoose = require('mongoose');

const deckReviewSchema = new mongoose.Schema({
  deck: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deck',
    required: true,
    index: true
  },
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  rating: {
    type: Number,
    required: [true, 'Vui lòng chọn đánh giá'],
    min: 1,
    max: 5,
    validate: {
      validator: function(v) {
        return Number.isInteger(v);
      },
      message: 'Rating phải là số nguyên từ 1-5'
    }
  },
  
  comment: {
    type: String,
    trim: true,
    maxlength: [1000, 'Nhận xét không được quá 1000 ký tự']
  },
  
  // Các khía cạnh đánh giá chi tiết (optional)
  aspects: {
    content: {
      type: Number,
      min: 1,
      max: 5
    },
    difficulty: {
      type: Number,
      min: 1,
      max: 5
    },
    organization: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  
  // Helpful votes (like/dislike)
  helpfulCount: {
    type: Number,
    default: 0
  },
  
  helpfulUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Report/Flag
  isReported: {
    type: Boolean,
    default: false
  },
  
  reportCount: {
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
  timestamps: true
});

// Compound index: 1 user chỉ review 1 deck 1 lần
deckReviewSchema.index({ deck: 1, user: 1 }, { unique: true });

// Index cho sort by helpful
deckReviewSchema.index({ helpfulCount: -1, createdAt: -1 });

// Middleware: Update deck rating khi review được tạo/sửa/xóa
deckReviewSchema.post('save', async function() {
  await updateDeckRating(this.deck);
});

deckReviewSchema.post('remove', async function() {
  await updateDeckRating(this.deck);
});

// Helper function để cập nhật rating của deck
async function updateDeckRating(deckId) {
  const Deck = mongoose.model('Deck');
  const reviews = await mongoose.model('DeckReview').find({ deck: deckId });
  
  if (reviews.length === 0) {
    await Deck.findByIdAndUpdate(deckId, {
      rating: 0,
      ratingCount: 0
    });
  } else {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = totalRating / reviews.length;
    
    await Deck.findByIdAndUpdate(deckId, {
      rating: avgRating,
      ratingCount: reviews.length
    });
  }
}

const DeckReview = mongoose.model('DeckReview', deckReviewSchema);

module.exports = DeckReview;
