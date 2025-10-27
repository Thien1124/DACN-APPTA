const mongoose = require('mongoose');

<<<<<<< HEAD
const ExerciseSchema = new mongoose.Schema({
=======
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

const exerciseSchema = new mongoose.Schema({
>>>>>>> main
  question: {
    type: String,
    required: [true, 'Vui lòng nhập câu hỏi'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Vui lòng chọn loại bài tập'],
<<<<<<< HEAD
    enum: {
      values: ['multiple-choice', 'fill-in-blank', 'matching', 'reorder', 'listening', 'speaking'],
      message: 'Loại bài tập không hợp lệ'
    }
  },
  options: {
    type: [String],
    validate: {
      validator: function(v) {
        return this.type === 'multiple-choice' ? v.length >= 2 : true;
      },
      message: 'Bài tập trắc nghiệm phải có ít nhất 2 lựa chọn'
    }
  },
  correctAnswer: {
    type: String,
    required: [true, 'Vui lòng nhập đáp án đúng'],
    trim: true
  },
  explanation: {
    type: String,
    trim: true
=======
    enum: ['multiple-choice', 'fill-in-blank', 'matching', 'listening', 'speaking', 'translation'],
    default: 'multiple-choice'
  },
  options: [optionSchema],
  correctAnswer: {
    type: String,
    required: function() {
      return this.type === 'fill-in-blank' || this.type === 'translation';
    }
  },
  explanation: {
    type: String
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: [true, 'Bài tập phải thuộc về một bài học']
>>>>>>> main
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
<<<<<<< HEAD
  lesson: {
    type: mongoose.Schema.ObjectId,
    ref: 'Lesson',
    required: [true, 'Bài tập phải thuộc về một bài học']
=======
  points: {
    type: Number,
    default: 10
>>>>>>> main
  },
  imageUrl: {
    type: String
  },
  audioUrl: {
    type: String
  },
<<<<<<< HEAD
  xpReward: {
    type: Number,
    default: 5
  },
=======
>>>>>>> main
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
ExerciseSchema.pre('save', function(next) {
=======
}, {
  timestamps: true
});

// Middleware trước khi lưu để cập nhật updatedAt
exerciseSchema.pre('save', function(next) {
>>>>>>> main
  this.updatedAt = Date.now();
  next();
});

<<<<<<< HEAD
module.exports = mongoose.model('Exercise', ExerciseSchema);
=======
const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;
>>>>>>> main
