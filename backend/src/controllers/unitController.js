const Unit = require('../models/Unit');
<<<<<<< HEAD
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
=======
const Lesson = require('../models/Lesson');

// @desc    Lấy tất cả unit
// @route   GET /api/units
// @access  Private/Admin
exports.getAllUnits = async (req, res) => {
  try {
    const units = await Unit.find().sort({ createdAt: -1 }).populate('course', 'title');
    
    res.status(200).json({
      success: true,
      count: units.length,
      data: units
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách unit',
      error: error.message
    });
  }
};

// @desc    Lấy tất cả unit theo khóa học
// @route   GET /api/courses/:courseId/units
// @access  Private/Admin
exports.getUnitsByCourse = async (req, res) => {
  try {
    const units = await Unit.find({ course: req.params.courseId }).sort({ order: 1 });
    
    res.status(200).json({
      success: true,
      count: units.length,
      data: units
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách unit theo khóa học',
      error: error.message
    });
  }
};

// @desc    Lấy một unit theo ID
// @route   GET /api/units/:id
// @access  Private/Admin
exports.getUnitById = async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id).populate('course', 'title');
    
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy unit với ID này'
      });
    }

    // Lấy các bài học thuộc unit
    const lessons = await Lesson.find({ unit: req.params.id }).sort({ order: 1 });
    
    res.status(200).json({
      success: true,
      data: {
        ...unit._doc,
        lessons
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin unit',
      error: error.message
    });
  }
};

// @desc    Tạo unit mới
// @route   POST /api/units
// @access  Private/Admin
exports.createUnit = async (req, res) => {
  try {
    const unit = await Unit.create(req.body);
    
    res.status(201).json({
      success: true,
      data: unit
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể tạo unit',
      error: error.message
    });
  }
};

// @desc    Cập nhật unit
// @route   PUT /api/units/:id
// @access  Private/Admin
exports.updateUnit = async (req, res) => {
  try {
    const unit = await Unit.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy unit với ID này'
      });
    }
    
    res.status(200).json({
      success: true,
      data: unit
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể cập nhật unit',
      error: error.message
    });
  }
};

// @desc    Xóa unit
// @route   DELETE /api/units/:id
// @access  Private/Admin
exports.deleteUnit = async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id);
    
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy unit với ID này'
      });
    }
    
    // Kiểm tra xem có bài học nào thuộc unit này không
    const lessons = await Lesson.find({ unit: req.params.id });
    
    if (lessons.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa unit vì có các bài học thuộc unit này'
      });
    }
    
    await unit.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Unit đã được xóa'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể xóa unit',
      error: error.message
    });
  }
};

// @desc    Thay đổi trạng thái xuất bản của unit
// @route   PATCH /api/units/:id/publish
// @access  Private/Admin
exports.togglePublishUnit = async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id);
    
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy unit với ID này'
      });
    }
    
    unit.isPublished = !unit.isPublished;
    await unit.save();
    
    res.status(200).json({
      success: true,
      data: unit
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể thay đổi trạng thái xuất bản',
      error: error.message
    });
  }
};
>>>>>>> main
