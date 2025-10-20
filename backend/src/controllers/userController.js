const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

/**
 * @desc    Lấy danh sách tất cả người dùng
 * @route   GET /api/v1/users
 * @access  Private/Admin
 */
exports.getUsers = asyncHandler(async (req, res, next) => {
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await User.countDocuments();

  // Query với pagination
  const users = await User.find()
    .select('-password -registrationOtp -passwordResetOtp')
    .skip(startIndex)
    .limit(limit);

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
    count: users.length,
    pagination,
    data: users
  });
});

/**
 * @desc    Lấy thông tin một người dùng cụ thể
 * @route   GET /api/v1/users/:id
 * @access  Private/Admin
 */
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password -registrationOtp -passwordResetOtp');

  if (!user) {
    return next(new ErrorResponse(`Không tìm thấy người dùng với ID: ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * @desc    Bật/tắt trạng thái người dùng
 * @route   PATCH /api/v1/users/:id/toggle-active
 * @access  Private/Admin
 */
exports.toggleActiveUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`Không tìm thấy người dùng với ID: ${req.params.id}`, 404));
  }

  // Không cho phép admin vô hiệu hóa chính mình
  if (user._id.toString() === req.user._id.toString()) {
    return next(new ErrorResponse('Bạn không thể vô hiệu hóa tài khoản của chính mình', 400));
  }

  // Đảo ngược trạng thái isActive
  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      isActive: user.isActive
    },
    message: `Người dùng đã được ${user.isActive ? 'kích hoạt' : 'vô hiệu hóa'} thành công`
  });
});