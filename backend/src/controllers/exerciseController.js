const Exercise = require('../models/Exercise');
<<<<<<< HEAD
const Lesson = require('../models/Lesson');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Lấy tất cả bài tập
// @route   GET /api/v1/exercises
// @route   GET /api/v1/lessons/:lessonId/exercises
// @access  Public
exports.getExercises = asyncHandler(async (req, res, next) => {
  let query;

  if (req.params.lessonId) {
    query = Exercise.find({ lesson: req.params.lessonId });
  } else {
    query = Exercise.find().populate({
      path: 'lesson',
      select: 'title type'
    });
  }

  const exercises = await query;

  res.status(200).json({
    success: true,
    count: exercises.length,
    data: exercises
  });
});

// @desc    Lấy một bài tập
// @route   GET /api/v1/exercises/:id
// @access  Public
exports.getExercise = asyncHandler(async (req, res, next) => {
  const exercise = await Exercise.findById(req.params.id).populate({
    path: 'lesson',
    select: 'title type'
  });

  if (!exercise) {
    return next(
      new ErrorResponse(`Không tìm thấy bài tập với id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: exercise
  });
});

// @desc    Tạo bài tập mới
// @route   POST /api/v1/lessons/:lessonId/exercises
// @access  Private
exports.createExercise = asyncHandler(async (req, res, next) => {
  req.body.lesson = req.params.lessonId;

  const lesson = await Lesson.findById(req.params.lessonId);

  if (!lesson) {
    return next(
      new ErrorResponse(`Không tìm thấy bài học với id ${req.params.lessonId}`, 404)
    );
  }

  const exercise = await Exercise.create(req.body);

  res.status(201).json({
    success: true,
    data: exercise
  });
});

// @desc    Tạo nhiều bài tập cùng lúc
// @route   POST /api/v1/lessons/:lessonId/exercises/bulk
// @access  Private
exports.createExercisesBulk = asyncHandler(async (req, res, next) => {
  const { exercises } = req.body;
  
  if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
    return next(new ErrorResponse('Vui lòng cung cấp mảng bài tập hợp lệ', 400));
  }

  const lesson = await Lesson.findById(req.params.lessonId);

  if (!lesson) {
    return next(
      new ErrorResponse(`Không tìm thấy bài học với id ${req.params.lessonId}`, 404)
    );
  }

  // Thêm lessonId vào mỗi bài tập
  const exercisesWithLesson = exercises.map(exercise => ({
    ...exercise,
    lesson: req.params.lessonId
  }));

  const createdExercises = await Exercise.insertMany(exercisesWithLesson);

  res.status(201).json({
    success: true,
    count: createdExercises.length,
    data: createdExercises
  });
});

// @desc    Cập nhật bài tập
// @route   PUT /api/v1/exercises/:id
// @access  Private
exports.updateExercise = asyncHandler(async (req, res, next) => {
  let exercise = await Exercise.findById(req.params.id);

  if (!exercise) {
    return next(
      new ErrorResponse(`Không tìm thấy bài tập với id ${req.params.id}`, 404)
    );
  }

  exercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: exercise
  });
});

// @desc    Xóa bài tập
// @route   DELETE /api/v1/exercises/:id
// @access  Private
exports.deleteExercise = asyncHandler(async (req, res, next) => {
  const exercise = await Exercise.findById(req.params.id);

  if (!exercise) {
    return next(
      new ErrorResponse(`Không tìm thấy bài tập với id ${req.params.id}`, 404)
    );
  }

  await exercise.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});
=======

// @desc    Lấy tất cả bài tập
// @route   GET /api/exercises
// @access  Private/Admin
exports.getAllExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find()
      .sort({ createdAt: -1 })
      .populate('lesson', 'title');
    
    res.status(200).json({
      success: true,
      count: exercises.length,
      data: exercises
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách bài tập',
      error: error.message
    });
  }
};

// @desc    Lấy tất cả bài tập theo bài học
// @route   GET /api/lessons/:lessonId/exercises
// @access  Private/Admin
exports.getExercisesByLesson = async (req, res) => {
  try {
    const exercises = await Exercise.find({ lesson: req.params.lessonId });
    
    res.status(200).json({
      success: true,
      count: exercises.length,
      data: exercises
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách bài tập theo bài học',
      error: error.message
    });
  }
};

// @desc    Lấy một bài tập theo ID
// @route   GET /api/exercises/:id
// @access  Private/Admin
exports.getExerciseById = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id)
      .populate('lesson', 'title')
      .populate({
        path: 'lesson',
        populate: {
          path: 'unit',
          select: 'title',
          populate: {
            path: 'course',
            select: 'title'
          }
        }
      });
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài tập với ID này'
      });
    }
    
    res.status(200).json({
      success: true,
      data: exercise
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin bài tập',
      error: error.message
    });
  }
};

// @desc    Tạo bài tập mới
// @route   POST /api/exercises
// @access  Private/Admin
exports.createExercise = async (req, res) => {
  try {
    const exercise = await Exercise.create(req.body);
    
    res.status(201).json({
      success: true,
      data: exercise
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể tạo bài tập',
      error: error.message
    });
  }
};

// @desc    Cập nhật bài tập
// @route   PUT /api/exercises/:id
// @access  Private/Admin
exports.updateExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài tập với ID này'
      });
    }
    
    res.status(200).json({
      success: true,
      data: exercise
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể cập nhật bài tập',
      error: error.message
    });
  }
};

// @desc    Xóa bài tập
// @route   DELETE /api/exercises/:id
// @access  Private/Admin
exports.deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài tập với ID này'
      });
    }
    
    await exercise.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Bài tập đã được xóa'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể xóa bài tập',
      error: error.message
    });
  }
};

// @desc    Tạo nhiều bài tập cùng lúc
// @route   POST /api/exercises/bulk
// @access  Private/Admin
exports.createBulkExercises = async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu phải là một mảng các bài tập'
      });
    }

    const exercises = await Exercise.insertMany(req.body);
    
    res.status(201).json({
      success: true,
      count: exercises.length,
      data: exercises
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể tạo danh sách bài tập',
      error: error.message
    });
  }
};
>>>>>>> main
