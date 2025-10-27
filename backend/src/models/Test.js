const mongoose = require('mongoose');

<<<<<<< HEAD
const TestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tiêu đề bài test'],
      trim: true,
      maxlength: [100, 'Tiêu đề không được vượt quá 100 ký tự']
    },
    description: {
      type: String,
      required: [true, 'Vui lòng nhập mô tả bài test'],
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
    timeLimit: {
      type: Number,
      default: 0 // 0 = không giới hạn thời gian
    },
    passingScore: {
      type: Number,
      default: 70 // Điểm đạt (%)
    },
    xpReward: {
      type: Number,
      default: 20
    },
    isPublished: {
      type: Boolean,
      default: false
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
TestSchema.virtual('exercises', {
  ref: 'TestExercise',
  localField: '_id',
  foreignField: 'test',
  justOne: false
});

// Middleware để cập nhật updatedAt trước khi lưu
TestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Test', TestSchema);
=======
const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    required: false
  },
  
  type: {
    type: String,
    required: true,
    enum: ['PRACTICE', 'TEST', 'EXAM', 'QUIZ'],
    default: 'PRACTICE'
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
  
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  exercises: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise' // Hoặc model phù hợp
  }],
  
  totalQuestions: {
    type: Number,
    required: true
  },
  
  totalPoints: {
    type: Number,
    required: true
  },
  
  passingScore: {
    type: Number,
    default: 70
  },
  
  timeLimit: {
    type: Number,
    required: false
  },
  
  attempts: {
    type: Number,
    default: -1
  },
  
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: false
  },
  
  isPublic: {
    type: Boolean,
    default: true
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
testSchema.index({ skill: 1, level: 1, isActive: 1, isPublic: 1 });
testSchema.index({ courseId: 1 });

const Test = mongoose.model('Test', testSchema);

module.exports = Test;
>>>>>>> main
