const Vocabulary = require('../models/Vocabulary');
const Lesson = require('../models/Lesson');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Lấy tất cả từ vựng
// @route   GET /api/v1/vocabularies
// @route   GET /api/v1/lessons/:lessonId/vocabularies
// @access  Public
exports.getVocabularies = asyncHandler(async (req, res, next) => {
  let query;

  if (req.params.lessonId) {
    query = Vocabulary.find({ lesson: req.params.lessonId });
  } else {
    query = Vocabulary.find().populate({
      path: 'lesson',
      select: 'title type'
    });
  }

  const vocabularies = await query;

  res.status(200).json({
    success: true,
    count: vocabularies.length,
    data: vocabularies
  });
});

// @desc    Lấy một từ vựng
// @route   GET /api/v1/vocabularies/:id
// @access  Public
exports.getVocabulary = asyncHandler(async (req, res, next) => {
  const vocabulary = await Vocabulary.findById(req.params.id).populate({
    path: 'lesson',
    select: 'title type'
  });

  if (!vocabulary) {
    return next(
      new ErrorResponse(`Không tìm thấy từ vựng với id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: vocabulary
  });
});

// @desc    Tạo từ vựng mới
// @route   POST /api/v1/lessons/:lessonId/vocabularies
// @access  Private
exports.createVocabulary = asyncHandler(async (req, res, next) => {
  req.body.lesson = req.params.lessonId;

  const lesson = await Lesson.findById(req.params.lessonId);

  if (!lesson) {
    return next(
      new ErrorResponse(`Không tìm thấy bài học với id ${req.params.lessonId}`, 404)
    );
  }

  const vocabulary = await Vocabulary.create(req.body);

  res.status(201).json({
    success: true,
    data: vocabulary
  });
});

// @desc    Tạo nhiều từ vựng cùng lúc
// @route   POST /api/v1/lessons/:lessonId/vocabularies/bulk
// @access  Private
exports.createVocabulariesBulk = asyncHandler(async (req, res, next) => {
  const { vocabularies } = req.body;
  
  if (!vocabularies || !Array.isArray(vocabularies) || vocabularies.length === 0) {
    return next(new ErrorResponse('Vui lòng cung cấp mảng từ vựng hợp lệ', 400));
  }

  const lesson = await Lesson.findById(req.params.lessonId);

  if (!lesson) {
    return next(
      new ErrorResponse(`Không tìm thấy bài học với id ${req.params.lessonId}`, 404)
    );
  }

  // Thêm lessonId vào mỗi từ vựng
  const vocabulariesWithLesson = vocabularies.map(vocab => ({
    ...vocab,
    lesson: req.params.lessonId
  }));

  const createdVocabularies = await Vocabulary.insertMany(vocabulariesWithLesson);

  res.status(201).json({
    success: true,
    count: createdVocabularies.length,
    data: createdVocabularies
  });
});

// @desc    Cập nhật từ vựng
// @route   PUT /api/v1/vocabularies/:id
// @access  Private
exports.updateVocabulary = asyncHandler(async (req, res, next) => {
  let vocabulary = await Vocabulary.findById(req.params.id);

  if (!vocabulary) {
    return next(
      new ErrorResponse(`Không tìm thấy từ vựng với id ${req.params.id}`, 404)
    );
  }

  vocabulary = await Vocabulary.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: vocabulary
  });
});

// @desc    Xóa từ vựng
// @route   DELETE /api/v1/vocabularies/:id
// @access  Private
exports.deleteVocabulary = asyncHandler(async (req, res, next) => {
  const vocabulary = await Vocabulary.findById(req.params.id);

  if (!vocabulary) {
    return next(
      new ErrorResponse(`Không tìm thấy từ vựng với id ${req.params.id}`, 404)
    );
  }

  await vocabulary.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});