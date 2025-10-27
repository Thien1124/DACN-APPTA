const Lesson = require('../models/Lesson');
const Unit = require('../models/Unit');
const Vocabulary = require('../models/Vocabulary');
const Exercise = require('../models/Exercise');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Lấy tất cả bài học (có thể lọc theo unit)
// @route   GET /api/v1/lessons
// @route   GET /api/v1/units/:unitId/lessons
// @access  Public
exports.getLessons = asyncHandler(async (req, res, next) => {
  let query;

  if (req.params.unitId) {
    query = Lesson.find({ unit: req.params.unitId }).sort('order');
  } else {
    query = Lesson.find().populate({
      path: 'unit',
      select: 'title description'
    });
  }

  const lessons = await query;

  res.status(200).json({
    success: true,
    count: lessons.length,
    data: lessons
  });
});

// @desc    Lấy một bài học
// @route   GET /api/v1/lessons/:id
// @access  Public
exports.getLesson = asyncHandler(async (req, res, next) => {
  // **Hợp nhất logic:** Sử dụng nested populate để lấy đầy đủ thông tin
  const lesson = await Lesson.findById(req.params.id)
    .populate({
      path: 'unit',
      select: 'title description',
      populate: {
        path: 'course',
        select: 'title'
      }
    })
    .populate('vocabularies')
    .populate('exercises');

  if (!lesson) {
    return next(
      new ErrorResponse(`Không tìm thấy bài học với id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: lesson
  });
});

// @desc    Tạo bài học mới
// @route   POST /api/v1/units/:unitId/lessons
// @access  Private
exports.createLesson = asyncHandler(async (req, res, next) => {
  req.body.unit = req.params.unitId;

  const unit = await Unit.findById(req.params.unitId);

  if (!unit) {
    return next(
      new ErrorResponse(`Không tìm thấy unit với id ${req.params.unitId}`, 404)
    );
  }

  const lesson = await Lesson.create(req.body);

  res.status(201).json({
    success: true,
    data: lesson
  });
});

// @desc    Cập nhật bài học
// @route   PUT /api/v1/lessons/:id
// @access  Private
exports.updateLesson = asyncHandler(async (req, res, next) => {
  let lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    return next(
      new ErrorResponse(`Không tìm thấy bài học với id ${req.params.id}`, 404)
    );
  }

  lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: lesson
  });
});

// @desc    Xóa bài học
// @route   DELETE /api/v1/lessons/:id
// @access  Private
exports.deleteLesson = asyncHandler(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    return next(
      new ErrorResponse(`Không tìm thấy bài học với id ${req.params.id}`, 404)
    );
  }

  // **Hợp nhất logic:** Kiểm tra xem có từ vựng hoặc bài tập nào không trước khi xóa
  const vocabularies = await Vocabulary.find({ lesson: req.params.id });
  const exercises = await Exercise.find({ lesson: req.params.id });

  if (vocabularies.length > 0 || exercises.length > 0) {
    return next(
      new ErrorResponse('Không thể xóa bài học vì vẫn còn từ vựng hoặc bài tập', 400)
    );
  }

  await lesson.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
    message: 'Bài học đã được xóa thành công'
  });
});

// @desc    Thay đổi trạng thái xuất bản của bài học
// @route   PATCH /api/v1/lessons/:id/publish
// @access  Private
exports.togglePublishLesson = asyncHandler(async (req, res, next) => {
  let lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    return next(
      new ErrorResponse(`Không tìm thấy bài học với id ${req.params.id}`, 404)
    );
  }

  lesson.isPublished = !lesson.isPublished;
  await lesson.save();

  res.status(200).json({
    success: true,
    data: lesson
  });
});