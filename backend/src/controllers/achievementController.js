const Achievement = require('../models/Achievement');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Lấy tất cả thành tích
// @route   GET /api/v1/achievements
// @access  Public
exports.getAchievements = asyncHandler(async (req, res, next) => {
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
  query = Achievement.find(JSON.parse(queryStr));

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
  const total = await Achievement.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const achievements = await query;

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
    count: achievements.length,
    pagination,
    data: achievements
  });
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
    data: {}
  });
});

// @desc    Thay đổi trạng thái hoạt động của thành tích
// @route   PUT /api/v1/achievements/:id/toggle
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