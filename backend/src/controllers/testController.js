const Test = require('../models/Test');
const TestExercise = require('../models/TestExercise');
const Exercise = require('../models/Exercise');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Lấy tất cả bài test
// @route   GET /api/v1/tests
// @access  Public
exports.getTests = asyncHandler(async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  query = Test.find(JSON.parse(queryStr));

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Test.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const tests = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: tests.length,
    pagination,
    data: tests
  });
});

// @desc    Lấy một bài test
// @route   GET /api/v1/tests/:id
// @access  Public
exports.getTest = asyncHandler(async (req, res, next) => {
  const test = await Test.findById(req.params.id).populate({
    path: 'exercises',
    populate: {
      path: 'exercise',
      select: 'question type options correctAnswer difficulty'
    }
  });

  if (!test) {
    return next(
      new ErrorResponse(`Không tìm thấy bài test với id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: test
  });
});

// @desc    Tạo bài test mới
// @route   POST /api/v1/tests
// @access  Private
exports.createTest = asyncHandler(async (req, res, next) => {
  const test = await Test.create(req.body);

  res.status(201).json({
    success: true,
    data: test
  });
});

// @desc    Cập nhật bài test
// @route   PUT /api/v1/tests/:id
// @access  Private
exports.updateTest = asyncHandler(async (req, res, next) => {
  let test = await Test.findById(req.params.id);

  if (!test) {
    return next(
      new ErrorResponse(`Không tìm thấy bài test với id ${req.params.id}`, 404)
    );
  }

  test = await Test.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: test
  });
});

// @desc    Xóa bài test
// @route   DELETE /api/v1/tests/:id
// @access  Private
exports.deleteTest = asyncHandler(async (req, res, next) => {
  const test = await Test.findById(req.params.id);

  if (!test) {
    return next(
      new ErrorResponse(`Không tìm thấy bài test với id ${req.params.id}`, 404)
    );
  }

  // Xóa tất cả các liên kết TestExercise
  await TestExercise.deleteMany({ test: req.params.id });

  await test.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Thay đổi trạng thái xuất bản của bài test
// @route   PUT /api/v1/tests/:id/publish
// @access  Private
exports.togglePublishTest = asyncHandler(async (req, res, next) => {
  let test = await Test.findById(req.params.id);

  if (!test) {
    return next(
      new ErrorResponse(`Không tìm thấy bài test với id ${req.params.id}`, 404)
    );
  }

  test.isPublished = !test.isPublished;
  await test.save();

  res.status(200).json({
    success: true,
    data: test
  });
});

// @desc    Lấy bài test theo khóa học
// @route   GET /api/v1/courses/:courseId/tests
// @access  Public
exports.getTestsByCourse = asyncHandler(async (req, res, next) => {
  const tests = await Test.find({ course: req.params.courseId });

  res.status(200).json({
    success: true,
    count: tests.length,
    data: tests
  });
});

// @desc    Lấy bài test theo unit
// @route   GET /api/v1/units/:unitId/tests
// @access  Public
exports.getTestsByUnit = asyncHandler(async (req, res, next) => {
  const tests = await Test.find({ unit: req.params.unitId });

  res.status(200).json({
    success: true,
    count: tests.length,
    data: tests
  });
});

// @desc    Thêm bài tập vào bài test
// @route   POST /api/v1/tests/:id/exercises
// @access  Private
exports.addExerciseToTest = asyncHandler(async (req, res, next) => {
  const { exerciseId, order, points } = req.body;

  // Kiểm tra bài test có tồn tại không
  const test = await Test.findById(req.params.id);
  if (!test) {
    return next(
      new ErrorResponse(`Không tìm thấy bài test với id ${req.params.id}`, 404)
    );
  }

  // Kiểm tra bài tập có tồn tại không
  const exercise = await Exercise.findById(exerciseId);
  if (!exercise) {
    return next(
      new ErrorResponse(`Không tìm thấy bài tập với id ${exerciseId}`, 404)
    );
  }

  // Kiểm tra xem bài tập đã được thêm vào bài test chưa
  const existingTestExercise = await TestExercise.findOne({
    test: req.params.id,
    exercise: exerciseId
  });

  if (existingTestExercise) {
    return next(
      new ErrorResponse('Bài tập này đã được thêm vào bài test', 400)
    );
  }

  // Tạo liên kết giữa bài test và bài tập
  const testExercise = await TestExercise.create({
    test: req.params.id,
    exercise: exerciseId,
    order: order || 0,
    points: points || 1
  });

  res.status(201).json({
    success: true,
    data: testExercise
  });
});

// @desc    Xóa bài tập khỏi bài test
// @route   DELETE /api/v1/tests/:id/exercises/:exerciseId
// @access  Private
exports.removeExerciseFromTest = asyncHandler(async (req, res, next) => {
  const testExercise = await TestExercise.findOne({
    test: req.params.id,
    exercise: req.params.exerciseId
  });

  if (!testExercise) {
    return next(
      new ErrorResponse(
        `Không tìm thấy bài tập với id ${req.params.exerciseId} trong bài test này`,
        404
      )
    );
  }

  await testExercise.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});