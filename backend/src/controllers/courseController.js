const Course = require('../models/Course');
const Unit = require('../models/Unit');

// @desc    Lấy tất cả khóa học
// @route   GET /api/courses
// @access  Private/Admin
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách khóa học',
      error: error.message
    });
  }
};

// @desc    Lấy một khóa học theo ID
// @route   GET /api/courses/:id
// @access  Private/Admin
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học với ID này'
      });
    }

    // Lấy các unit thuộc khóa học
    const units = await Unit.find({ course: req.params.id }).sort({ order: 1 });
    
    res.status(200).json({
      success: true,
      data: {
        ...course._doc,
        units
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin khóa học',
      error: error.message
    });
  }
};

// @desc    Tạo khóa học mới
// @route   POST /api/courses
// @access  Private/Admin
exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    
    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể tạo khóa học',
      error: error.message
    });
  }
};

// @desc    Cập nhật khóa học
// @route   PUT /api/courses/:id
// @access  Private/Admin
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học với ID này'
      });
    }
    
    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể cập nhật khóa học',
      error: error.message
    });
  }
};

// @desc    Xóa khóa học
// @route   DELETE /api/courses/:id
// @access  Private/Admin
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học với ID này'
      });
    }
    
    // Kiểm tra xem có unit nào thuộc khóa học này không
    const units = await Unit.find({ course: req.params.id });
    
    if (units.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa khóa học vì có các unit thuộc khóa học này'
      });
    }
    
    await course.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Khóa học đã được xóa'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể xóa khóa học',
      error: error.message
    });
  }
};

// @desc    Thay đổi trạng thái xuất bản của khóa học
// @route   PATCH /api/courses/:id/publish
// @access  Private/Admin
exports.togglePublishCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học với ID này'
      });
    }
    
    course.isPublished = !course.isPublished;
    await course.save();
    
    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể thay đổi trạng thái xuất bản',
      error: error.message
    });
  }
};

// @desc    Lấy courses đã enroll của user (hiện tại: tất cả courses published)
// @route   GET /api/courses/enrolled
// @access  Private
exports.getEnrolledCourses = async (req, res) => {
  try {
    // Lấy tất cả courses đã publish
    const courses = await Course.find({ isPublished: true })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách khóa học',
      error: error.message
    });
  }
};


// @desc    Lấy tất cả courses đã publish (public - không cần login)
// @route   GET /api/courses/published
// @access  Public
exports.getPublishedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách khóa học',
      error: error.message
    });
  }
};