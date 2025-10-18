const Exercise = require('../models/Exercise');
const Lesson = require('../models/Lesson');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Lấy tất cả bài tập
// @route   GET /api/v1/exercises
// @route   GET /api/v1/lessons/:lessonId/exercises
// @access  Public
exports.getExercises = asyncHandler(async (req, res, next) => {
  let query;

  if (req.params.lessonId) {
    query = Exercise.find({ lesson: req.params.lessonId });
  } else {
    query = Exercise.find().populate({
      path: 'lesson',
      select: 'title type'
    });
  }

  const exercises = await query;

  res.status(200).json({
    success: true,
    count: exercises.length,
    data: exercises
  });
});

// @desc    Lấy một bài tập
// @route   GET /api/v1/exercises/:id
// @access  Public
exports.getExercise = asyncHandler(async (req, res, next) => {
  const exercise = await Exercise.findById(req.params.id).populate({
    path: 'lesson',
    select: 'title type'
  });

  if (!exercise) {
    return next(
      new ErrorResponse(`Không tìm thấy bài tập với id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: exercise
  });
});

// @desc    Tạo bài tập mới
// @route   POST /api/v1/lessons/:lessonId/exercises
// @access  Private
exports.createExercise = asyncHandler(async (req, res, next) => {
  req.body.lesson = req.params.lessonId;

  const lesson = await Lesson.findById(req.params.lessonId);

  if (!lesson) {
    return next(
      new ErrorResponse(`Không tìm thấy bài học với id ${req.params.lessonId}`, 404)
    );
  }

  const exercise = await Exercise.create(req.body);

  res.status(201).json({
    success: true,
    data: exercise
  });
});

// @desc    Tạo nhiều bài tập cùng lúc
// @route   POST /api/v1/lessons/:lessonId/exercises/bulk
// @access  Private
exports.createExercisesBulk = asyncHandler(async (req, res, next) => {
  const { exercises } = req.body;
  
  if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
    return next(new ErrorResponse('Vui lòng cung cấp mảng bài tập hợp lệ', 400));
  }

  const lesson = await Lesson.findById(req.params.lessonId);

  if (!lesson) {
    return next(
      new ErrorResponse(`Không tìm thấy bài học với id ${req.params.lessonId}`, 404)
    );
  }

  // Thêm lessonId vào mỗi bài tập
  const exercisesWithLesson = exercises.map(exercise => ({
    ...exercise,
    lesson: req.params.lessonId
  }));

  const createdExercises = await Exercise.insertMany(exercisesWithLesson);

  res.status(201).json({
    success: true,
    count: createdExercises.length,
    data: createdExercises
  });
});

// @desc    Cập nhật bài tập
// @route   PUT /api/v1/exercises/:id
// @access  Private
exports.updateExercise = asyncHandler(async (req, res, next) => {
  let exercise = await Exercise.findById(req.params.id);

  if (!exercise) {
    return next(
      new ErrorResponse(`Không tìm thấy bài tập với id ${req.params.id}`, 404)
    );
  }

  exercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: exercise
  });
});

// @desc    Xóa bài tập
// @route   DELETE /api/v1/exercises/:id
// @access  Private
exports.deleteExercise = asyncHandler(async (req, res, next) => {
  const exercise = await Exercise.findById(req.params.id);

  if (!exercise) {
    return next(
      new ErrorResponse(`Không tìm thấy bài tập với id ${req.params.id}`, 404)
    );
  }

  await exercise.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});