const Unit = require('../models/Unit');
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