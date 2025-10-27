const Course = require('../models/Course');
const Unit = require('../models/Unit'); // Thêm import từ nhánh main
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Lấy tất cả khóa học (với filter, sort, pagination)
// @route   GET /api/v1/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  // Logic này sau này có thể được chuyển vào một middleware "advancedResults"
  // nhưng hiện tại giữ ở đây vẫn hoạt động tốt.
  res.status(200).json(res.advancedResults);
});

// @desc    Lấy một khóa học
// @route   GET /api/v1/courses/:id
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'units',
    options: { sort: 'order' } // Sắp xếp các unit theo thứ tự
  });

  if (!course) {
    return next(
      new ErrorResponse(`Không tìm thấy khóa học với id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Tạo khóa học mới
// @route   POST /api/v1/courses
// @access  Private
exports.createCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    data: course
  });
});

// @desc    Cập nhật khóa học
// @route   PUT /api/v1/courses/:id
// @access  Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`Không tìm thấy khóa học với id ${req.params.id}`, 404)
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Xóa khóa học
// @route   DELETE /api/v1/courses/:id
// @access  Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`Không tìm thấy khóa học với id ${req.params.id}`, 404)
    );
  }

  // **Hợp nhất logic:** Kiểm tra xem có unit nào thuộc khóa học này không
  const units = await Unit.find({ course: req.params.id });
  if (units.length > 0) {
    return next(
      new ErrorResponse('Không thể xóa khóa học vì vẫn còn các unit thuộc về nó', 400)
    );
  }

  await course.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
    message: 'Khóa học đã được xóa thành công'
  });
});

// @desc    Thay đổi trạng thái xuất bản của khóa học
// @route   PATCH /api/v1/courses/:id/publish
// @access  Private
exports.togglePublishCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`Không tìm thấy khóa học với id ${req.params.id}`, 404)
    );
  }

  course.isPublished = !course.isPublished;
  await course.save();

  res.status(200).json({
    success: true,
    data: course
  });
});