const Course = require('../models/Course');
<<<<<<< HEAD
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Lấy tất cả khóa học
// @route   GET /api/v1/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
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
  query = Course.find(JSON.parse(queryStr));

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
  const total = await Course.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const courses = await query;

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
    count: courses.length,
    pagination,
    data: courses
  });
});

// @desc    Lấy một khóa học
// @route   GET /api/v1/courses/:id
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate('units');

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

  await course.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Thay đổi trạng thái xuất bản của khóa học
// @route   PUT /api/v1/courses/:id/publish
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
=======
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
>>>>>>> main
