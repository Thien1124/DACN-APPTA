const Achievement = require('../models/Achievement');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Lấy tất cả thành tích (với filter, sort, pagination)
// @route   GET /api/v1/achievements
// @access  Public
exports.getAchievements = asyncHandler(async (req, res, next) => {
  // Logic này sau này có thể được chuyển vào một middleware "advancedResults"
  // nhưng hiện tại giữ ở đây vẫn hoạt động tốt.
  res.status(200).json(res.advancedResults);
});

// @desc    Lấy một thành tích
// @route   GET /api/v1/achievements/:id
// @access  Public
exports.getAchievement = asyncHandler(async (req, res, next) => {
  const achievement = await Achievement.findById(req.params.id);

  if (!achievement) {
    return next(
      new ErrorResponse(`Không tìm thấy thành tích với id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: achievement
  });
});

// @desc    Tạo thành tích mới
// @route   POST /api/v1/achievements
// @access  Private
exports.createAchievement = asyncHandler(async (req, res, next) => {
  const achievement = await Achievement.create(req.body);

  res.status(201).json({
    success: true,
    data: achievement
  });
});

// @desc    Cập nhật thành tích
// @route   PUT /api/v1/achievements/:id
// @access  Private
exports.updateAchievement = asyncHandler(async (req, res, next) => {
  let achievement = await Achievement.findById(req.params.id);

  if (!achievement) {
    return next(
      new ErrorResponse(`Không tìm thấy thành tích với id ${req.params.id}`, 404)
    );
  }

  achievement = await Achievement.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: achievement
  });
});

// @desc    Xóa thành tích
// @route   DELETE /api/v1/achievements/:id
// @access  Private
exports.deleteAchievement = asyncHandler(async (req, res, next) => {
  const achievement = await Achievement.findById(req.params.id);

  if (!achievement) {
    return next(
      new ErrorResponse(`Không tìm thấy thành tích với id ${req.params.id}`, 404)
    );
  }

  await achievement.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
    message: 'Thành tích đã được xóa thành công'
  });
});

// @desc    Thay đổi trạng thái hoạt động của thành tích
// @route   PATCH /api/v1/achievements/:id/toggle
// @access  Private
exports.toggleActiveAchievement = asyncHandler(async (req, res, next) => {
  let achievement = await Achievement.findById(req.params.id);

  if (!achievement) {
    return next(
      new ErrorResponse(`Không tìm thấy thành tích với id ${req.params.id}`, 404)
    );
  }

  achievement.isActive = !achievement.isActive;
  await achievement.save();

  res.status(200).json({
    success: true,
    data: achievement
  });
});