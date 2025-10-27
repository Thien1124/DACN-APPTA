const Unit = require('../models/Unit');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson'); // Lấy từ nhánh main
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Lấy tất cả unit (có thể lọc theo course)
// @route   GET /api/v1/units
// @route   GET /api/v1/courses/:courseId/units
// @access  Public
exports.getUnits = asyncHandler(async (req, res, next) => {
  let query;

  if (req.params.courseId) {
    // Lấy unit theo một khóa học cụ thể
    query = Unit.find({ course: req.params.courseId }).sort('order');
  } else {
    // Lấy tất cả unit và thông tin khóa học liên quan
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
    .populate({ // Lấy luôn các bài học thuộc unit, sắp xếp theo thứ tự
      path: 'lessons',
      options: { sort: 'order' }
    });

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

// @desc    Tạo unit mới cho một khóa học
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

  // **Hợp nhất logic:** Kiểm tra xem unit có bài học nào không trước khi xóa
  const lessons = await Lesson.find({ unit: req.params.id });
  if (lessons.length > 0) {
    return next(
      new ErrorResponse('Không thể xóa unit vì vẫn còn bài học thuộc về nó', 400)
    );
  }

  await unit.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
    message: 'Unit đã được xóa thành công'
  });
});

// @desc    Thay đổi trạng thái xuất bản của unit
// @route   PATCH /api/v1/units/:id/publish
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