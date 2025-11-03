const mongoose = require('mongoose');

/**
 * Model PracticeExercise - Bài tập luyện tập collocation, phrasal verbs, word family
 * Task 16: Luyện collocation/phrasal verbs/word family
 */
const practiceExerciseSchema = new mongoose.Schema({
  // Loại bài tập
  category: {
    type: String,
    required: [true, 'Vui lòng chọn loại bài tập'],
    enum: ['collocation', 'phrasal-verb', 'word-family'],
    index: true
  },

  // Từ khóa chính (word/phrase)
  targetWord: {
    type: String,
    required: [true, 'Vui lòng nhập từ khóa chính'],
    trim: true,
    index: true
  },

  // Nghĩa của từ
  meaning: {
    type: String,
    required: false,
    trim: true
  },

  // Câu hỏi
  question: {
    type: String,
    required: [true, 'Vui lòng nhập câu hỏi'],
    trim: true
  },

  // Loại câu hỏi
  questionType: {
    type: String,
    required: [true, 'Vui lòng chọn loại câu hỏi'],
    enum: ['multiple-choice', 'fill-in-blank', 'matching', 'complete-sentence'],
    default: 'multiple-choice'
  },

  // Câu văn cảnh (sentence với chỗ trống hoặc cần điền)
  contextSentence: {
    type: String,
    required: [true, 'Vui lòng nhập câu văn cảnh'],
    trim: true
  },

  // Vị trí cần điền (cho fill-in-blank)
  blankPosition: {
    type: Number,
    required: function() {
      return this.questionType === 'fill-in-blank';
    }
  },

  // Các lựa chọn (cho multiple-choice)
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
    explanation: {
      type: String,
      trim: true
    }
  }],

  // Đáp án đúng
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed, // String hoặc Array
    required: [true, 'Vui lòng nhập đáp án đúng']
  },

  // Giải thích
  explanation: {
    type: String,
    trim: true
  },

  // Ví dụ sử dụng
  examples: [{
    sentence: {
      type: String,
      required: true,
      trim: true
    },
    translation: {
      type: String,
      trim: true
    }
  }],

  // Dữ liệu đặc biệt theo loại
  // Cho collocation: các từ thường đi kèm
  collocations: [{
    word: {
      type: String,
      trim: true
    },
    example: {
      type: String,
      trim: true
    }
  }],

  // Cho phrasal verb: các dạng khác nhau
  phrasalVerbForms: [{
    form: {
      type: String, // VD: "take up", "take down", "take off"
      trim: true
    },
    meaning: {
      type: String,
      trim: true
    }
  }],

  // Cho word family: các từ cùng họ
  wordFamily: [{
    word: {
      type: String, // VD: "happy", "happiness", "happily", "unhappy"
      trim: true
    },
    type: {
      type: String, // noun, verb, adjective, adverb
      enum: ['noun', 'verb', 'adjective', 'adverb']
    },
    meaning: {
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

  // Flashcard liên quan (optional)
  relatedFlashcard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flashcard',
    required: false,
    index: true
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
practiceExerciseSchema.index({ category: 1, level: 1, isActive: 1 });
practiceExerciseSchema.index({ targetWord: 1, category: 1 });
practiceExerciseSchema.index({ relatedFlashcard: 1 });

// Middleware trước khi lưu
practiceExerciseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const PracticeExercise = mongoose.model('PracticeExercise', practiceExerciseSchema);

module.exports = PracticeExercise;

