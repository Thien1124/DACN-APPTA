const mongoose = require('mongoose');

/**
 * Model SupplementaryQuiz - Bộ quiz phụ từ các thẻ/yếu điểm hay sai
 * Task 19: Tập trung củng cố kiến thức yếu
 */
const supplementaryQuizItemSchema = new mongoose.Schema({
  type: {
    type: String, // flashcard | practice | grammar
    enum: ['flashcard', 'practice', 'grammar'],
    required: true
  },
  refId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  source: {
    type: String, // studyProgress | practiceResult | grammarQuizResult | mixed
    default: 'mixed'
  },
  reason: {
    type: String // vì sao được chọn (high-error-rate, due, slow-response, recent-wrong)
  }
}, { _id: false });

const supplementaryQuizSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  title: {
    type: String,
    default: 'Weakness Drill'
  },

  deck: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deck',
    required: false,
    index: true
  },

  items: [supplementaryQuizItemSchema],

  totalItems: {
    type: Number,
    default: 0
  },

  generatedFrom: {
    type: [String], // ['studyProgress', 'practiceResult', 'grammarQuizResult']
    default: ['studyProgress', 'practiceResult', 'grammarQuizResult']
  },

  isActive: {
    type: Boolean,
    default: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

supplementaryQuizSchema.index({ user: 1, createdAt: -1 });

const SupplementaryQuiz = mongoose.model('SupplementaryQuiz', supplementaryQuizSchema);

module.exports = SupplementaryQuiz;


