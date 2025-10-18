const Unit = require('../models/Unit');
const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Lấy tất cả unit
// @route   GET /api/v1/units
// @route   GET /api/v1/courses/:courseId/units
// @access  Public
exports.getUnits = asyncHandler(async (req, res, next) => {
  let query;

  if (req.params.courseId) {
    query = Unit.find({ course: req.params.courseId }).sort('order');
  } else {
    query = Unit.find().populate({
      path: 'course',
      select: 'title description'
    });
  }

  const units = await query;

  res.status(200).json({
    success: true,
    count: units.length,
    data: units
  });
});

// @desc    Lấy một unit
// @route   GET /api/v1/units/:id
// @access  Public
exports.getUnit = asyncHandler(async (req, res, next) => {
  const unit = await Unit.findById(req.params.id)
    .populate({
      path: 'course',
      select: 'title description'
    })
    .populate('lessons');

  if (!unit) {
    return next(
      new ErrorResponse(`Không tìm thấy unit với id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: unit
  });
});

// @desc    Tạo unit mới
// @route   POST /api/v1/courses/:courseId/units
// @access  Private
exports.createUnit = asyncHandler(async (req, res, next) => {
  req.body.course = req.params.courseId;

  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(
      new ErrorResponse(`Không tìm thấy khóa học với id ${req.params.courseId}`, 404)
    );
  }

  const unit = await Unit.create(req.body);

  res.status(201).json({
    success: true,
    data: unit
  });
});

// @desc    Cập nhật unit
// @route   PUT /api/v1/units/:id
// @access  Private
exports.updateUnit = asyncHandler(async (req, res, next) => {
  let unit = await Unit.findById(req.params.id);

  if (!unit) {
    return next(
      new ErrorResponse(`Không tìm thấy unit với id ${req.params.id}`, 404)
    );
  }

  unit = await Unit.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: unit
  });
});

// @desc    Xóa unit
// @route   DELETE /api/v1/units/:id
// @access  Private
exports.deleteUnit = asyncHandler(async (req, res, next) => {
  const unit = await Unit.findById(req.params.id);

  if (!unit) {
    return next(
      new ErrorResponse(`Không tìm thấy unit với id ${req.params.id}`, 404)
    );
  }

  await unit.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Thay đổi trạng thái xuất bản của unit
// @route   PUT /api/v1/units/:id/publish
// @access  Private
exports.togglePublishUnit = asyncHandler(async (req, res, next) => {
  let unit = await Unit.findById(req.params.id);

  if (!unit) {
    return next(
      new ErrorResponse(`Không tìm thấy unit với id ${req.params.id}`, 404)
    );
  }

  unit.isPublished = !unit.isPublished;
  await unit.save();

  res.status(200).json({
    success: true,
    data: unit
  });
});

// @desc    Lấy units theo khóa học
// @route   GET /api/v1/courses/:courseId/units
// @access  Public
exports.getUnitsByCourse = asyncHandler(async (req, res, next) => {
  const units = await Unit.find({ course: req.params.courseId }).sort('order');

  res.status(200).json({
    success: true,
    count: units.length,
    data: units
  });
});