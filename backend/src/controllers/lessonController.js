const Lesson = require('../models/Lesson');
<<<<<<< HEAD
const Unit = require('../models/Unit');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Lấy tất cả bài học
// @route   GET /api/v1/lessons
// @route   GET /api/v1/units/:unitId/lessons
// @access  Public
exports.getLessons = asyncHandler(async (req, res, next) => {
  let query;

  if (req.params.unitId) {
    query = Lesson.find({ unit: req.params.unitId }).sort('order');
  } else {
    query = Lesson.find().populate({
      path: 'unit',
      select: 'title description'
    });
  }

  const lessons = await query;

  res.status(200).json({
    success: true,
    count: lessons.length,
    data: lessons
  });
});

// @desc    Lấy một bài học
// @route   GET /api/v1/lessons/:id
// @access  Public
exports.getLesson = asyncHandler(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.id)
    .populate({
      path: 'unit',
      select: 'title description'
    })
    .populate('vocabularies')
    .populate('exercises');

  if (!lesson) {
    return next(
      new ErrorResponse(`Không tìm thấy bài học với id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: lesson
  });
});

// @desc    Tạo bài học mới
// @route   POST /api/v1/units/:unitId/lessons
// @access  Private
exports.createLesson = asyncHandler(async (req, res, next) => {
  req.body.unit = req.params.unitId;

  const unit = await Unit.findById(req.params.unitId);

  if (!unit) {
    return next(
      new ErrorResponse(`Không tìm thấy unit với id ${req.params.unitId}`, 404)
    );
  }

  const lesson = await Lesson.create(req.body);

  res.status(201).json({
    success: true,
    data: lesson
  });
});

// @desc    Cập nhật bài học
// @route   PUT /api/v1/lessons/:id
// @access  Private
exports.updateLesson = asyncHandler(async (req, res, next) => {
  let lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    return next(
      new ErrorResponse(`Không tìm thấy bài học với id ${req.params.id}`, 404)
    );
  }

  lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: lesson
  });
});

// @desc    Xóa bài học
// @route   DELETE /api/v1/lessons/:id
// @access  Private
exports.deleteLesson = asyncHandler(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    return next(
      new ErrorResponse(`Không tìm thấy bài học với id ${req.params.id}`, 404)
    );
  }

  await lesson.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Thay đổi trạng thái xuất bản của bài học
// @route   PUT /api/v1/lessons/:id/publish
// @access  Private
exports.togglePublishLesson = asyncHandler(async (req, res, next) => {
  let lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    return next(
      new ErrorResponse(`Không tìm thấy bài học với id ${req.params.id}`, 404)
    );
  }

  lesson.isPublished = !lesson.isPublished;
  await lesson.save();

  res.status(200).json({
    success: true,
    data: lesson
  });
});
=======
const Vocabulary = require('../models/Vocabulary');
const Exercise = require('../models/Exercise');

// @desc    Lấy tất cả bài học
// @route   GET /api/lessons
// @access  Private/Admin
exports.getAllLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find()
      .sort({ createdAt: -1 })
      .populate('unit', 'title');
    
    res.status(200).json({
      success: true,
      count: lessons.length,
      data: lessons
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách bài học',
      error: error.message
    });
  }
};

// @desc    Lấy tất cả bài học theo unit
// @route   GET /api/units/:unitId/lessons
// @access  Private/Admin
exports.getLessonsByUnit = async (req, res) => {
  try {
    const lessons = await Lesson.find({ unit: req.params.unitId }).sort({ order: 1 });
    
    res.status(200).json({
      success: true,
      count: lessons.length,
      data: lessons
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách bài học theo unit',
      error: error.message
    });
  }
};

// @desc    Lấy một bài học theo ID
// @route   GET /api/lessons/:id
// @access  Private/Admin
exports.getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate('unit', 'title')
      .populate({
        path: 'unit',
        populate: {
          path: 'course',
          select: 'title'
        }
      });
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài học với ID này'
      });
    }

    // Lấy từ vựng và bài tập thuộc bài học
    const vocabularies = await Vocabulary.find({ lesson: req.params.id });
    const exercises = await Exercise.find({ lesson: req.params.id });
    
    res.status(200).json({
      success: true,
      data: {
        ...lesson._doc,
        vocabularies,
        exercises
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin bài học',
      error: error.message
    });
  }
};

// @desc    Tạo bài học mới
// @route   POST /api/lessons
// @access  Private/Admin
exports.createLesson = async (req, res) => {
  try {
    const lesson = await Lesson.create(req.body);
    
    res.status(201).json({
      success: true,
      data: lesson
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể tạo bài học',
      error: error.message
    });
  }
};

// @desc    Cập nhật bài học
// @route   PUT /api/lessons/:id
// @access  Private/Admin
exports.updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài học với ID này'
      });
    }
    
    res.status(200).json({
      success: true,
      data: lesson
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể cập nhật bài học',
      error: error.message
    });
  }
};

// @desc    Xóa bài học
// @route   DELETE /api/lessons/:id
// @access  Private/Admin
exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài học với ID này'
      });
    }
    
    // Kiểm tra xem có từ vựng hoặc bài tập nào thuộc bài học này không
    const vocabularies = await Vocabulary.find({ lesson: req.params.id });
    const exercises = await Exercise.find({ lesson: req.params.id });
    
    if (vocabularies.length > 0 || exercises.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa bài học vì có từ vựng hoặc bài tập thuộc bài học này'
      });
    }
    
    await lesson.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Bài học đã được xóa'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể xóa bài học',
      error: error.message
    });
  }
};

// @desc    Thay đổi trạng thái xuất bản của bài học
// @route   PATCH /api/lessons/:id/publish
// @access  Private/Admin
exports.togglePublishLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài học với ID này'
      });
    }
    
    lesson.isPublished = !lesson.isPublished;
    await lesson.save();
    
    res.status(200).json({
      success: true,
      data: lesson
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
