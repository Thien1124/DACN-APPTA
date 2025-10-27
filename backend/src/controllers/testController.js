const Test = require('../models/Test');
const TestExercise = require('../models/TestExercise');
const Exercise = require('../models/Exercise');
const TestAttempt = require('../models/TestAttempt');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { sendTestCompletedNotification } = require('../services/notificationService');

/**
 * =================================================================
 * ROUTES CHO ADMIN / TEACHER (QUẢN LÝ BÀI TEST)
 * =================================================================
 */

// @desc    Lấy tất cả bài test (cho admin, có filter, sort, pagination)
// @route   GET /api/v1/tests
// @access  Private
exports.getTestsForAdmin = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Lấy một bài test (cho admin, xem được đáp án)
// @route   GET /api/v1/tests/:id/admin
// @access  Private
exports.getTestForAdmin = asyncHandler(async (req, res, next) => {
  const test = await Test.findById(req.params.id).populate({
    path: 'exercises',
    populate: {
      path: 'exercise',
      select: 'question type options correctAnswer difficulty explanation' // Admin can see everything
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
  req.body.createdBy = req.user._id;
  const test = await Test.create(req.body);
  console.log(`[SUCCESS] Admin ${req.user._id} created test ${test._id}`);
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
  console.log(`[SUCCESS] Admin ${req.user._id} updated test ${test._id}`);
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

  // Xóa tất cả các liên kết TestExercise trước
  await TestExercise.deleteMany({ test: req.params.id });
  await test.deleteOne();
  console.log(`[SUCCESS] Admin ${req.user._id} deleted test ${req.params.id}`);
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Thêm bài tập vào bài test
// @route   POST /api/v1/tests/:id/exercises
// @access  Private
exports.addExerciseToTest = asyncHandler(async (req, res, next) => {
  const { exerciseId, order, points } = req.body;
  const testId = req.params.id;

  const [test, exercise] = await Promise.all([
      Test.findById(testId),
      Exercise.findById(exerciseId)
  ]);

  if (!test) {
    return next(new ErrorResponse(`Không tìm thấy bài test với id ${testId}`, 404));
  }
  if (!exercise) {
    return next(new ErrorResponse(`Không tìm thấy bài tập với id ${exerciseId}`, 404));
  }

  const existingTestExercise = await TestExercise.findOne({ test: testId, exercise: exerciseId });
  if (existingTestExercise) {
    return next(new ErrorResponse('Bài tập này đã được thêm vào bài test', 400));
  }

  const testExercise = await TestExercise.create({
    test: testId,
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
// @route   DELETE /api/v1/tests/:testId/exercises/:exerciseId
// @access  Private
exports.removeExerciseFromTest = asyncHandler(async (req, res, next) => {
  const { testId, exerciseId } = req.params;
  const testExercise = await TestExercise.findOne({ test: testId, exercise: exerciseId });

  if (!testExercise) {
    return next(new ErrorResponse(`Không tìm thấy bài tập với id ${exerciseId} trong bài test này`, 404));
  }

  await testExercise.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});


// @desc    Thay đổi trạng thái xuất bản của bài test
// @route   PATCH /api/v1/tests/:id/publish
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
  console.log(`[SUCCESS] Admin ${req.user._id} toggled publish status of test ${test._id} to ${test.isPublished}`);
  res.status(200).json({
    success: true,
    message: `Bài test đã ${test.isPublished ? 'được công khai' : 'được ẩn'}`,
    data: test
  });
});


/**
 * =================================================================
 * ROUTES CHO USER THƯỜNG (XEM VÀ LÀM BÀI TEST)
 * =================================================================
 */

// @desc    Lấy tất cả bài test đã publish
// @route   GET /api/v1/tests/public
// @access  Public
exports.getPublicTests = asyncHandler(async (req, res, next) => {
  // Always filter for published tests for public users
  req.query.isPublished = 'true';
  res.status(200).json(res.advancedResults);
});


// @desc    Lấy một bài test (không có đáp án)
// @route   GET /api/v1/tests/:id
// @access  Public
exports.getTestForUser = asyncHandler(async (req, res, next) => {
  const test = await Test.findOne({ _id: req.params.id, isPublished: true }).populate({
    path: 'exercises',
    populate: {
      path: 'exercise',
      select: '-correctAnswer -explanation' // Hide sensitive info from users
    }
  });

  if (!test) {
    return next(new ErrorResponse(`Không tìm thấy bài test với id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: test
  });
});

// @desc    Bắt đầu làm test
// @route   POST /api/v1/tests/:id/start
// @access  Private (User)
exports.startTest = asyncHandler(async (req, res, next) => {
  const testId = req.params.id;
  const userId = req.user._id;

  const test = await Test.findById(testId).populate('exercises');
  if (!test || !test.isPublished) {
    return next(new ErrorResponse('Không tìm thấy bài test hoặc bài test chưa được công khai', 404));
  }

  if (test.maxAttempts && test.maxAttempts > 0) {
    const attemptCount = await TestAttempt.countDocuments({ userId, testId, status: 'COMPLETED' });
    if (attemptCount >= test.maxAttempts) {
      return next(new ErrorResponse(`Bạn đã hết số lần làm bài test này (${test.maxAttempts} lần)`, 403));
    }
  }

  const totalPoints = test.exercises.reduce((sum, ex) => sum + (ex.points || 0), 0);
  const attempt = await TestAttempt.create({
    userId,
    testId,
    totalQuestions: test.exercises.length,
    totalPoints,
    status: 'IN_PROGRESS',
    startedAt: new Date()
  });

  console.log(`[INFO] User ${userId} started test ${testId}`);
  // Return test without answers
  const testForUser = await Test.findById(testId).populate({
    path: 'exercises',
    populate: {
      path: 'exercise',
      select: '-correctAnswer -explanation'
    }
  });


  res.json({
    success: true,
    message: 'Bắt đầu làm test thành công',
    data: {
      attemptId: attempt._id,
      test: testForUser
    }
  });
});

// @desc    Nộp và chấm điểm một câu trả lời
// @route   POST /api/v1/attempts/:attemptId/answer
// @access  Private (User)
exports.submitAnswer = asyncHandler(async (req, res, next) => {
    const { attemptId } = req.params;
    const { exerciseId, answer } = req.body;

    if (!exerciseId || answer === undefined) {
        return next(new ErrorResponse('Vui lòng cung cấp exerciseId và answer', 400));
    }

    const attempt = await TestAttempt.findOne({ _id: attemptId, userId: req.user._id, status: 'IN_PROGRESS' });
    if (!attempt) {
        return next(new ErrorResponse('Không tìm thấy lượt làm bài hoặc đã hoàn thành', 404));
    }

    const [exercise, testExercise] = await Promise.all([
        Exercise.findById(exerciseId),
        TestExercise.findOne({test: attempt.testId, exercise: exerciseId})
    ]);

    if (!exercise || !testExercise) {
        return next(new ErrorResponse('Không tìm thấy câu hỏi trong bài test này', 404));
    }

    let isCorrect = String(answer).toLowerCase().trim() === String(exercise.correctAnswer).toLowerCase().trim();
    const pointsEarned = isCorrect ? testExercise.points : 0;

    const existingAnswerIndex = attempt.answers.findIndex(a => String(a.exerciseId) === String(exerciseId));
    const answerData = { exerciseId, userAnswer: answer, isCorrect, pointsEarned };

    if (existingAnswerIndex >= 0) {
        attempt.score -= attempt.answers[existingAnswerIndex].pointsEarned;
        attempt.answers[existingAnswerIndex] = answerData;
    } else {
        attempt.answers.push(answerData);
    }
    attempt.score += pointsEarned;

    await attempt.save();

    res.json({
        success: true,
        message: 'Đã ghi nhận câu trả lời',
        data: { isCorrect, currentScore: attempt.score }
    });
});

// @desc    Hoàn thành và nộp bài test
// @route   POST /api/v1/attempts/:attemptId/complete
// @access  Private (User)
exports.completeTest = asyncHandler(async (req, res, next) => {
    const { attemptId } = req.params;
    const attempt = await TestAttempt.findOne({ _id: attemptId, userId: req.user._id, status: 'IN_PROGRESS' }).populate('testId');
    if (!attempt) {
        return next(new ErrorResponse('Không tìm thấy lượt làm bài hoặc đã hoàn thành', 404));
    }

    attempt.status = 'COMPLETED';
    attempt.completedAt = new Date();
    attempt.correctAnswers = attempt.answers.filter(a => a.isCorrect).length;
    attempt.percentage = attempt.totalPoints > 0 ? Math.round((attempt.score / attempt.totalPoints) * 100) : 0;
    attempt.passed = attempt.percentage >= (attempt.testId.passingScore || 70);

    await attempt.save();
    
    // Gửi notification (không chặn response nếu thất bại)
    sendTestCompletedNotification({
      userId: attempt.userId,
      testId: attempt.testId._id,
      testName: attempt.testId.title,
      score: attempt.percentage,
      passed: attempt.passed
    }).catch(err => console.error('[ERROR] Failed to send notification:', err));

    console.log(`[SUCCESS] User ${req.user._id} completed test ${attempt.testId._id} - Score: ${attempt.percentage}%`);

    res.json({
        success: true,
        message: 'Hoàn thành test thành công',
        data: {
            attemptId: attempt._id,
            score: attempt.score,
            totalPoints: attempt.totalPoints,
            percentage: attempt.percentage,
            correctAnswers: attempt.correctAnswers,
            totalQuestions: attempt.totalQuestions,
            passed: attempt.passed,
        }
    });
});

// @desc    Lấy kết quả chi tiết của một lần làm bài
// @route   GET /api/v1/attempts/:attemptId/result
// @access  Private (User)
exports.getTestResult = asyncHandler(async (req, res, next) => {
    const { attemptId } = req.params;
    const attempt = await TestAttempt.findOne({ _id: attemptId, userId: req.user._id })
        .populate('testId', 'title description skill level')
        .populate({
            path: 'answers.exerciseId',
            model: 'Exercise' // Populate the actual exercise details
        });

    if (!attempt) {
        return next(new ErrorResponse('Không tìm thấy kết quả', 404));
    }

    res.json({ success: true, data: attempt });
});

// @desc    Lấy lịch sử làm bài của user
// @route   GET /api/v1/attempts/history
// @access  Private (User)
exports.getUserHistory = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id, status: 'COMPLETED' };
    
    const [attempts, total] = await Promise.all([
        TestAttempt.find(query)
            .populate('testId', 'title skill level type')
            .sort({ completedAt: -1 })
            .skip(skip)
            .limit(limit),
        TestAttempt.countDocuments(query)
    ]);

    res.json({
        success: true,
        data: {
            attempts,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        }
    });
});