const mongoose = require('mongoose');

// **Hợp nhất:** Sử dụng optionSchema từ nhánh 'main' vì nó tốt hơn
const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true,
    default: false
  }
});

const ExerciseSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Vui lòng nhập câu hỏi'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Vui lòng chọn loại bài tập'],
    // Hợp nhất các enum từ cả hai nhánh
    enum: {
      values: ['multiple-choice', 'fill-in-blank', 'matching', 'reorder', 'listening', 'speaking', 'translation'],
      message: 'Loại bài tập không hợp lệ'
    },
    default: 'multiple-choice'
  },
  // Sử dụng [optionSchema] cho các loại bài tập có lựa chọn
  options: [optionSchema],
  // correctAnswer chỉ bắt buộc cho các loại không có lựa chọn
  correctAnswer: {
    type: String,
    trim: true,
    required: function() {
      // Chỉ bắt buộc khi không phải là trắc nghiệm
      return this.type !== 'multiple-choice';
    }
  },
  explanation: {
    type: String,
    trim: true
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: [true, 'Bài tập phải thuộc về một bài học']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  // Sử dụng 'points' thay vì 'xpReward' cho linh hoạt hơn
  points: {
    type: Number,
    default: 10
  },
  imageUrl: {
    type: String
  },
  audioUrl: {
    type: String
  }
}, {
  // Sử dụng timestamps tích hợp, sạch sẽ hơn
  timestamps: true
});

// Không cần pre-save hook cho 'updatedAt' vì `timestamps: true` đã tự động xử lý

module.exports = mongoose.model('Exercise', ExerciseSchema);