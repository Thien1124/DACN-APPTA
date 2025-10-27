const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'MULTIPLE_CHOICE',      // Trắc nghiệm
      'FILL_BLANK',           // Điền từ
      'LISTENING',            // Nghe
      'READING',              // Đọc hiểu
      'SPEAKING',             // Nói (record audio)
      'WRITING',              // Viết
      'MATCHING',             // Nối câu
      'ORDERING',             // Sắp xếp từ
      'TRUE_FALSE',           // Đúng/Sai
      'TRANSLATION'           // Dịch
    ],
    index: true
  },
  
  skill: {
    type: String,
    required: true,
    enum: ['LISTENING', 'READING', 'SPEAKING', 'WRITING', 'VOCABULARY', 'GRAMMAR', 'MIXED'],
    index: true
  },
  
  level: {
    type: String,
    required: true,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    index: true
  },
  
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  question: {
    type: String,
    required: true
  },
  
  audioUrl: {
    type: String,
    required: false
  },
  
  imageUrl: {
    type: String,
    required: false
  },
  
  options: [{
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false }
  }],
  
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  explanation: {
    type: String,
    required: false
  },
  
  hints: [{
    type: String
  }],
  
  tags: [{
    type: String,
    index: true
  }],
  
  difficulty: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  
  points: {
    type: Number,
    default: 10
  },
  
  timeLimit: {
    type: Number,
    default: 60
  },
  
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: false,
    index: true
  },
  
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: false,
    index: true
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Indexes
questionSchema.index({ skill: 1, level: 1, isActive: 1 });
questionSchema.index({ type: 1, difficulty: 1 });
questionSchema.index({ tags: 1 });

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;