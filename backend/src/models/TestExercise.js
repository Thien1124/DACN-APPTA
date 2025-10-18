const mongoose = require('mongoose');

const TestExerciseSchema = new mongoose.Schema({
  test: {
    type: mongoose.Schema.ObjectId,
    ref: 'Test',
    required: [true, 'Bài tập phải thuộc về một bài test']
  },
  exercise: {
    type: mongoose.Schema.ObjectId,
    ref: 'Exercise',
    required: [true, 'Vui lòng chọn bài tập']
  },
  order: {
    type: Number,
    default: 0
  },
  points: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Đảm bảo mỗi bài tập chỉ xuất hiện một lần trong một bài test
TestExerciseSchema.index({ test: 1, exercise: 1 }, { unique: true });

module.exports = mongoose.model('TestExercise', TestExerciseSchema);