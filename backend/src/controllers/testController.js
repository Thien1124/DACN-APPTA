const Test = require('../models/Test');
<<<<<<< HEAD
const TestExercise = require('../models/TestExercise');
const Exercise = require('../models/Exercise');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Lấy tất cả bài test
// @route   GET /api/v1/tests
// @access  Public
exports.getTests = asyncHandler(async (req, res, next) => {
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
  query = Test.find(JSON.parse(queryStr));

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
  const total = await Test.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const tests = await query;

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
    count: tests.length,
    pagination,
    data: tests
  });
});

// @desc    Lấy một bài test
// @route   GET /api/v1/tests/:id
// @access  Public
exports.getTest = asyncHandler(async (req, res, next) => {
  const test = await Test.findById(req.params.id).populate({
    path: 'exercises',
    populate: {
      path: 'exercise',
      select: 'question type options correctAnswer difficulty'
    }
  });

  if (!test) {
    return next(
      new ErrorResponse(`Không tìm thấy bài test với id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: test
  });
});

// @desc    Tạo bài test mới
// @route   POST /api/v1/tests
// @access  Private
exports.createTest = asyncHandler(async (req, res, next) => {
  const test = await Test.create(req.body);

  res.status(201).json({
    success: true,
    data: test
  });
});

// @desc    Cập nhật bài test
// @route   PUT /api/v1/tests/:id
// @access  Private
exports.updateTest = asyncHandler(async (req, res, next) => {
  let test = await Test.findById(req.params.id);

  if (!test) {
    return next(
      new ErrorResponse(`Không tìm thấy bài test với id ${req.params.id}`, 404)
    );
  }

  test = await Test.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: test
  });
});

// @desc    Xóa bài test
// @route   DELETE /api/v1/tests/:id
// @access  Private
exports.deleteTest = asyncHandler(async (req, res, next) => {
  const test = await Test.findById(req.params.id);

  if (!test) {
    return next(
      new ErrorResponse(`Không tìm thấy bài test với id ${req.params.id}`, 404)
    );
  }

  // Xóa tất cả các liên kết TestExercise
  await TestExercise.deleteMany({ test: req.params.id });

  await test.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Thay đổi trạng thái xuất bản của bài test
// @route   PUT /api/v1/tests/:id/publish
// @access  Private
exports.togglePublishTest = asyncHandler(async (req, res, next) => {
  let test = await Test.findById(req.params.id);

  if (!test) {
    return next(
      new ErrorResponse(`Không tìm thấy bài test với id ${req.params.id}`, 404)
    );
  }

  test.isPublished = !test.isPublished;
  await test.save();

  res.status(200).json({
    success: true,
    data: test
  });
});

// @desc    Lấy bài test theo khóa học
// @route   GET /api/v1/courses/:courseId/tests
// @access  Public
exports.getTestsByCourse = asyncHandler(async (req, res, next) => {
  const tests = await Test.find({ course: req.params.courseId });

  res.status(200).json({
    success: true,
    count: tests.length,
    data: tests
  });
});

// @desc    Lấy bài test theo unit
// @route   GET /api/v1/units/:unitId/tests
// @access  Public
exports.getTestsByUnit = asyncHandler(async (req, res, next) => {
  const tests = await Test.find({ unit: req.params.unitId });

  res.status(200).json({
    success: true,
    count: tests.length,
    data: tests
  });
});

// @desc    Thêm bài tập vào bài test
// @route   POST /api/v1/tests/:id/exercises
// @access  Private
exports.addExerciseToTest = asyncHandler(async (req, res, next) => {
  const { exerciseId, order, points } = req.body;

  // Kiểm tra bài test có tồn tại không
  const test = await Test.findById(req.params.id);
  if (!test) {
    return next(
      new ErrorResponse(`Không tìm thấy bài test với id ${req.params.id}`, 404)
    );
  }

  // Kiểm tra bài tập có tồn tại không
  const exercise = await Exercise.findById(exerciseId);
  if (!exercise) {
    return next(
      new ErrorResponse(`Không tìm thấy bài tập với id ${exerciseId}`, 404)
    );
  }

  // Kiểm tra xem bài tập đã được thêm vào bài test chưa
  const existingTestExercise = await TestExercise.findOne({
    test: req.params.id,
    exercise: exerciseId
  });

  if (existingTestExercise) {
    return next(
      new ErrorResponse('Bài tập này đã được thêm vào bài test', 400)
    );
  }

  // Tạo liên kết giữa bài test và bài tập
  const testExercise = await TestExercise.create({
    test: req.params.id,
    exercise: exerciseId,
    order: order || 0,
    points: points || 1
  });

  res.status(201).json({
    success: true,
    data: testExercise
  });
});

// @desc    Xóa bài tập khỏi bài test
// @route   DELETE /api/v1/tests/:id/exercises/:exerciseId
// @access  Private
exports.removeExerciseFromTest = asyncHandler(async (req, res, next) => {
  const testExercise = await TestExercise.findOne({
    test: req.params.id,
    exercise: req.params.exerciseId
  });

  if (!testExercise) {
    return next(
      new ErrorResponse(
        `Không tìm thấy bài tập với id ${req.params.exerciseId} trong bài test này`,
        404
      )
    );
  }

  await testExercise.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});
=======
const Exercise = require('../models/Exercise');
const TestAttempt = require('../models/TestAttempt');
const { sendTestCompletedNotification } = require('../services/notificationService');

/**
 * ROUTES CHO USER THƯỜNG
 */

// Lấy tất cả bài test
exports.getAllTests = async (req, res) => {
  try {
    const { skill, level, type, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = { isPublished: true };
    if (skill) query.skill = skill;
    if (level) query.level = level;
    if (type) query.type = type;

    const [tests, total] = await Promise.all([
      Test.find(query)
        .populate('course', 'title')
        .populate('unit', 'title')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Test.countDocuments(query)
    ]);
    
    res.status(200).json({
      success: true,
      count: tests.length,
      data: {
        tests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('[ERROR] Get all tests:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách bài test',
      error: error.message
    });
  }
};

// Lấy bài test theo ID (không bao gồm đáp án)
exports.getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('course', 'title')
      .populate('unit', 'title')
      .populate({
        path: 'exercises',
        select: '-correctAnswer -explanation'
      });
    
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài test với ID này'
      });
    }
    
    res.status(200).json({
      success: true,
      data: test
    });
  } catch (error) {
    console.error('[ERROR] Get test by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin bài test',
      error: error.message
    });
  }
};

// Lấy bài test theo khóa học
exports.getTestsByCourse = async (req, res) => {
  try {
    const tests = await Test.find({ 
      course: req.params.courseId,
      isPublished: true 
    })
      .populate('course', 'title')
      .populate('unit', 'title');
    
    res.status(200).json({
      success: true,
      count: tests.length,
      data: tests
    });
  } catch (error) {
    console.error('[ERROR] Get tests by course:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách bài test theo khóa học',
      error: error.message
    });
  }
};

// Lấy bài test theo unit
exports.getTestsByUnit = async (req, res) => {
  try {
    const tests = await Test.find({ 
      unit: req.params.unitId,
      isPublished: true 
    })
      .populate('course', 'title')
      .populate('unit', 'title');
    
    res.status(200).json({
      success: true,
      count: tests.length,
      data: tests
    });
  } catch (error) {
    console.error('[ERROR] Get tests by unit:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách bài test theo unit',
      error: error.message
    });
  }
};

// Bắt đầu làm test
exports.startTest = async (req, res) => {
  try {
    const testId = req.params.id;
    const userId = req.user._id;

    const test = await Test.findById(testId)
      .populate({
        path: 'exercises',
        select: '-correctAnswer -explanation'
      });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài test'
      });
    }

    if (!test.isPublished) {
      return res.status(403).json({
        success: false,
        message: 'Bài test chưa được công khai'
      });
    }

    // Kiểm tra số lần làm bài (nếu có giới hạn)
    if (test.maxAttempts && test.maxAttempts > 0) {
      const attemptCount = await TestAttempt.countDocuments({
        userId,
        testId,
        status: 'COMPLETED'
      });

      if (attemptCount >= test.maxAttempts) {
        return res.status(403).json({
          success: false,
          message: `Bạn đã hết số lần làm bài test này (${test.maxAttempts} lần)`
        });
      }
    }

    // Tạo attempt mới
    const attempt = await TestAttempt.create({
      userId,
      testId,
      totalQuestions: test.exercises.length,
      totalPoints: test.exercises.reduce((sum, ex) => sum + (ex.points || 0), 0),
      status: 'IN_PROGRESS',
      startedAt: new Date()
    });

    console.log(`[INFO] User ${userId} started test ${testId}`);

    res.json({
      success: true,
      message: 'Bắt đầu làm test thành công',
      data: {
        attemptId: attempt._id,
        test: {
          _id: test._id,
          title: test.title,
          description: test.description,
          skill: test.skill,
          level: test.level,
          timeLimit: test.timeLimit,
          totalQuestions: test.exercises.length,
          exercises: test.exercises
        }
      }
    });
  } catch (error) {
    console.error('[ERROR] Start test:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể bắt đầu test',
      error: error.message
    });
  }
};

// Submit câu trả lời
exports.submitAnswer = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { exerciseId, answer } = req.body;

    if (!exerciseId || answer === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp exerciseId và answer'
      });
    }

    const attempt = await TestAttempt.findOne({
      _id: attemptId,
      userId: req.user._id,
      status: 'IN_PROGRESS'
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy attempt hoặc đã hoàn thành'
      });
    }

    const exercise = await Exercise.findById(exerciseId);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy câu hỏi'
      });
    }

    // Kiểm tra đáp án
    let isCorrect = false;
    
    if (exercise.type === 'MULTIPLE_CHOICE' || exercise.type === 'TRUE_FALSE') {
      isCorrect = String(answer) === String(exercise.correctAnswer);
    } else if (exercise.type === 'FILL_BLANK') {
      const correctAnswers = Array.isArray(exercise.correctAnswer) 
        ? exercise.correctAnswer 
        : [exercise.correctAnswer];
      isCorrect = correctAnswers.some(ans => 
        String(answer).toLowerCase().trim() === String(ans).toLowerCase().trim()
      );
    } else {
      isCorrect = String(answer) === String(exercise.correctAnswer);
    }

    const pointsEarned = isCorrect ? (exercise.points || 0) : 0;

    // Lưu answer vào attempt
    const existingAnswerIndex = attempt.answers.findIndex(
      a => String(a.exerciseId) === String(exerciseId)
    );

    const answerData = {
      exerciseId,
      userAnswer: answer,
      isCorrect,
      pointsEarned
    };

    if (existingAnswerIndex >= 0) {
      // Cập nhật điểm nếu câu trả lời cũ khác
      if (!attempt.answers[existingAnswerIndex].isCorrect && isCorrect) {
        attempt.score += pointsEarned;
      } else if (attempt.answers[existingAnswerIndex].isCorrect && !isCorrect) {
        attempt.score -= attempt.answers[existingAnswerIndex].pointsEarned;
      }
      attempt.answers[existingAnswerIndex] = answerData;
    } else {
      attempt.answers.push(answerData);
      if (isCorrect) {
        attempt.score += pointsEarned;
      }
    }

    await attempt.save();

    res.json({
      success: true,
      message: 'Đã ghi nhận câu trả lời',
      data: {
        isCorrect,
        pointsEarned,
        currentScore: attempt.score,
        correctAnswer: isCorrect ? null : exercise.correctAnswer,
        explanation: isCorrect ? null : exercise.explanation
      }
    });
  } catch (error) {
    console.error('[ERROR] Submit answer:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể ghi nhận câu trả lời',
      error: error.message
    });
  }
};

// Hoàn thành test
exports.completeTest = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await TestAttempt.findOne({
      _id: attemptId,
      userId: req.user._id,
      status: 'IN_PROGRESS'
    }).populate('testId');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy attempt hoặc đã hoàn thành'
      });
    }

    attempt.status = 'COMPLETED';
    attempt.completedAt = new Date();
    
    // Tính điểm
    const correctAnswers = attempt.answers.filter(a => a.isCorrect).length;
    attempt.correctAnswers = correctAnswers;
    attempt.percentage = Math.round((attempt.score / attempt.totalPoints) * 100);
    attempt.passed = attempt.percentage >= (attempt.testId.passingScore || 70);

    await attempt.save();

    // Gửi notification
    try {
      await sendTestCompletedNotification({
        userId: attempt.userId,
        testId: attempt.testId._id,
        testName: attempt.testId.title,
        score: attempt.percentage,
        passed: attempt.passed
      });
    } catch (notifError) {
      console.error('[ERROR] Failed to send notification:', notifError);
    }

    console.log(`[SUCCESS] User ${req.user._id} completed test ${attempt.testId._id} - Score: ${attempt.percentage}%`);

    res.json({
      success: true,
      message: 'Hoàn thành test thành công',
      data: {
        attemptId: attempt._id,
        score: attempt.score,
        totalPoints: attempt.totalPoints,
        percentage: attempt.percentage,
        correctAnswers,
        totalQuestions: attempt.totalQuestions,
        passed: attempt.passed,
        completedAt: attempt.completedAt
      }
    });
  } catch (error) {
    console.error('[ERROR] Complete test:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể hoàn thành test',
      error: error.message
    });
  }
};

// Lấy kết quả test
exports.getTestResult = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await TestAttempt.findOne({
      _id: attemptId,
      userId: req.user._id
    })
      .populate('testId', 'title description skill level')
      .populate('answers.exerciseId');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy kết quả'
      });
    }

    res.json({
      success: true,
      data: {
        result: attempt
      }
    });
  } catch (error) {
    console.error('[ERROR] Get result:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy kết quả',
      error: error.message
    });
  }
};

// Lấy lịch sử làm bài
exports.getUserHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [attempts, total] = await Promise.all([
      TestAttempt.find({ 
        userId: req.user._id, 
        status: 'COMPLETED' 
      })
        .populate('testId', 'title skill level type')
        .sort({ completedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      TestAttempt.countDocuments({ 
        userId: req.user._id, 
        status: 'COMPLETED' 
      })
    ]);

    res.json({
      success: true,
      data: {
        attempts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('[ERROR] Get history:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy lịch sử',
      error: error.message
    });
  }
};

/**
 * ROUTES CHO ADMIN/TEACHER
 */

// Tạo bài test mới
exports.createTest = async (req, res) => {
  try {
    const test = await Test.create({
      ...req.body,
      createdBy: req.user._id
    });
    
    console.log(`[SUCCESS] Admin ${req.user._id} created test ${test._id}`);
    
    res.status(201).json({
      success: true,
      message: 'Tạo bài test thành công',
      data: test
    });
  } catch (error) {
    console.error('[ERROR] Create test:', error);
    res.status(400).json({
      success: false,
      message: 'Không thể tạo bài test mới',
      error: error.message
    });
  }
};

// Cập nhật bài test
exports.updateTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedAt: Date.now()
      },
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài test với ID này'
      });
    }
    
    console.log(`[SUCCESS] Admin ${req.user._id} updated test ${test._id}`);
    
    res.status(200).json({
      success: true,
      message: 'Cập nhật bài test thành công',
      data: test
    });
  } catch (error) {
    console.error('[ERROR] Update test:', error);
    res.status(400).json({
      success: false,
      message: 'Không thể cập nhật bài test',
      error: error.message
    });
  }
};

// Xóa bài test
exports.deleteTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài test với ID này'
      });
    }
    
    await test.deleteOne();
    
    console.log(`[SUCCESS] Admin ${req.user._id} deleted test ${req.params.id}`);
    
    res.status(200).json({
      success: true,
      message: 'Bài test đã được xóa thành công'
    });
  } catch (error) {
    console.error('[ERROR] Delete test:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể xóa bài test',
      error: error.message
    });
  }
};

// Thêm bài tập vào bài test
exports.addExerciseToTest = async (req, res) => {
  try {
    const { testId, exerciseId } = req.params;
    
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài test với ID này'
      });
    }
    
    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài tập với ID này'
      });
    }
    
    if (test.exercises.includes(exerciseId)) {
      return res.status(400).json({
        success: false,
        message: 'Bài tập này đã có trong bài test'
      });
    }
    
    test.exercises.push(exerciseId);
    await test.save();
    
    res.status(200).json({
      success: true,
      message: 'Đã thêm bài tập vào bài test thành công',
      data: test
    });
  } catch (error) {
    console.error('[ERROR] Add exercise to test:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể thêm bài tập vào bài test',
      error: error.message
    });
  }
};

// Xóa bài tập khỏi bài test
exports.removeExerciseFromTest = async (req, res) => {
  try {
    const { testId, exerciseId } = req.params;
    
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài test với ID này'
      });
    }
    
    if (!test.exercises.includes(exerciseId)) {
      return res.status(400).json({
        success: false,
        message: 'Bài tập này không có trong bài test'
      });
    }
    
    test.exercises = test.exercises.filter(
      exercise => exercise.toString() !== exerciseId
    );
    await test.save();
    
    res.status(200).json({
      success: true,
      message: 'Đã xóa bài tập khỏi bài test thành công',
      data: test
    });
  } catch (error) {
    console.error('[ERROR] Remove exercise from test:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể xóa bài tập khỏi bài test',
      error: error.message
    });
  }
};

// Thay đổi trạng thái xuất bản của bài test
exports.togglePublishTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài test với ID này'
      });
    }
    
    test.isPublished = !test.isPublished;
    await test.save();
    
    console.log(`[SUCCESS] Admin ${req.user._id} toggled publish status of test ${test._id} to ${test.isPublished}`);
    
    res.status(200).json({
      success: true,
      message: `Bài test đã ${test.isPublished ? 'được công khai' : 'được ẩn'}`,
      data: test
    });
  } catch (error) {
    console.error('[ERROR] Toggle publish test:', error);
    res.status(400).json({
      success: false,
      message: 'Không thể thay đổi trạng thái xuất bản của bài test',
      error: error.message
    });
  }
};
>>>>>>> main
