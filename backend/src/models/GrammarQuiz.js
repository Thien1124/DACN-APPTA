const mongoose = require('mongoose');

/**
 * Model GrammarQuiz - Mini-quiz ngữ pháp gắn với flashcard
 * Task 17: Mini-quiz ngữ pháp - Tập trung vào từ loại, chia thì, mạo từ
 */
const grammarQuizSchema = new mongoose.Schema({
  // Flashcard liên quan (bắt buộc)
  flashcard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flashcard',
    required: [true, 'Quiz phải gắn với một flashcard'],
    index: true
  },

  // Chủ đề ngữ pháp
  grammarTopic: {
    type: String,
    required: [true, 'Vui lòng chọn chủ đề ngữ pháp'],
    enum: [
      'word-class',        // Từ loại (noun, verb, adjective, adverb)
      'tense',            // Chia thì (present, past, future)
      'article',          // Mạo từ (a, an, the)
      'preposition',      // Giới từ
      'pronoun',          // Đại từ
      'conjunction',      // Liên từ
      'passive-voice',    // Thể bị động
      'conditional',      // Câu điều kiện
      'relative-clause',  // Mệnh đề quan hệ
      'mixed'             // Tổng hợp
    ],
    index: true
  },

  // Câu hỏi
  question: {
    type: String,
    required: [true, 'Vui lòng nhập câu hỏi'],
    trim: true
  },

  // Câu ví dụ với chỗ trống
  sentence: {
    type: String,
    required: [true, 'Vui lòng nhập câu ví dụ'],
    trim: true
  },

  // Vị trí cần điền/trả lời trong câu
  blankPosition: {
    type: Number, // Vị trí từ trong câu (index)
    required: false
  },

  // Loại câu hỏi
  questionType: {
    type: String,
    required: [true, 'Vui lòng chọn loại câu hỏi'],
    enum: ['multiple-choice', 'fill-in-blank', 'choose-correct-form', 'sentence-correction'],
    default: 'multiple-choice'
  },

  // Các lựa chọn (cho multiple-choice và choose-correct-form)
  options: [{
    text: {
      type: String,
      required: true,
      trim: true
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    grammarNote: {
      type: String, // Giải thích ngữ pháp cho lựa chọn này
      trim: true
    }
  }],

  // Đáp án đúng
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed, // String hoặc Array
    required: [true, 'Vui lòng nhập đáp án đúng']
  },

  // Đáp án sai phổ biến (để giải thích)
  commonMistakes: [{
    wrongAnswer: {
      type: String,
      trim: true
    },
    explanation: {
      type: String,
      trim: true
    },
    grammarRule: {
      type: String, // Quy tắc ngữ pháp liên quan
      trim: true
    }
  }],

  // Giải thích ngữ pháp chi tiết
  grammarExplanation: {
    type: String,
    required: [true, 'Vui lòng nhập giải thích ngữ pháp'],
    trim: true
  },

  // Quy tắc ngữ pháp liên quan
  grammarRule: {
    type: String,
    trim: true
  },

  // Ví dụ minh họa
  examples: [{
    sentence: {
      type: String,
      required: true,
      trim: true
    },
    explanation: {
      type: String,
      trim: true
    }
  }],

  // Câu đúng và câu sai để so sánh
  correctSentence: {
    type: String,
    trim: true
  },
  incorrectSentences: [{
    sentence: {
      type: String,
      trim: true
    },
    whyWrong: {
      type: String,
      trim: true
    }
  }],

  // Mức độ khó
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
    index: true
  },

  // Level
  level: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    default: 'A1',
    index: true
  },

  // Điểm số
  points: {
    type: Number,
    default: 10,
    min: 1
  },

  // Audio (nếu có)
  audioUrl: {
    type: String
  },

  // Image (nếu có)
  imageUrl: {
    type: String
  },

  // Trạng thái
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },

  // Thống kê
  stats: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    correctAttempts: {
      type: Number,
      default: 0
    },
    averageTime: {
      type: Number, // seconds
      default: 0
    }
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

// Indexes để tối ưu query
grammarQuizSchema.index({ flashcard: 1, isActive: 1 });
grammarQuizSchema.index({ grammarTopic: 1, level: 1, isActive: 1 });
grammarQuizSchema.index({ flashcard: 1, grammarTopic: 1 });

// Middleware trước khi lưu
grammarQuizSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const GrammarQuiz = mongoose.model('GrammarQuiz', grammarQuizSchema);

module.exports = GrammarQuiz;

