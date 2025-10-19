const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tên bài học'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả bài học'],
  },
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: [true, 'Bài học phải thuộc về một unit']
  },
  order: {
    type: Number,
    required: [true, 'Vui lòng nhập thứ tự bài học'],
    default: 1
  },
  type: {
    type: String,
    enum: ['vocabulary', 'grammar', 'reading', 'listening', 'speaking', 'writing', 'mixed'],
    default: 'mixed'
  },
  xpReward: {
    type: Number,
    default: 10
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  imageUrl: {
    type: String,
    default: '/images/default-lesson.png'
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate để lấy các từ vựng thuộc bài học
lessonSchema.virtual('vocabularies', {
  ref: 'Vocabulary',
  foreignField: 'lesson',
  localField: '_id'
});

// Virtual populate để lấy các bài tập thuộc bài học
lessonSchema.virtual('exercises', {
  ref: 'Exercise',
  foreignField: 'lesson',
  localField: '_id'
});

// Middleware trước khi lưu để cập nhật updatedAt
lessonSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;