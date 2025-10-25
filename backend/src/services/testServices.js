const Test = require('../models/Test');
const Question = require('../models/Question');
const TestAttempt = require('../models/TestAttempt');
const { sendTestCompletedNotification } = require('./notificationService');

/**
 * Lấy danh sách tests theo filter
 */
const getTests = async ({ skill, level, type, page = 1, limit = 20 }) => {
  const query = { isActive: true, isPublic: true };
  
  if (skill) query.skill = skill;
  if (level) query.level = level;
  if (type) query.type = type;

  const skip = (page - 1) * limit;

  const [tests, total] = await Promise.all([
    Test.find(query)
      .select('-questions')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Test.countDocuments(query)
  ]);

  return {
    tests,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Lấy chi tiết test
 */
const getTestById = async (testId) => {
  const test = await Test.findById(testId)
    .populate('questions')
    .lean();

  if (!test) {
    throw new Error('Test not found');
  }

  return test;
};

/**
 * Bắt đầu làm test
 */
const startTest = async (userId, testId) => {
  const test = await Test.findById(testId).populate('questions');

  if (!test) {
    throw new Error('Test not found');
  }

  if (!test.isActive) {
    throw new Error('Test is not available');
  }

  // Kiểm tra số lần làm bài
  if (test.attempts > 0) {
    const attemptCount = await TestAttempt.countDocuments({
      userId,
      testId,
      status: 'COMPLETED'
    });

    if (attemptCount >= test.attempts) {
      throw new Error('Maximum attempts reached');
    }
  }

  // Tạo attempt mới
  const attempt = new TestAttempt({
    userId,
    testId,
    totalQuestions: test.totalQuestions,
    totalPoints: test.totalPoints,
    status: 'IN_PROGRESS',
    startedAt: new Date()
  });

  await attempt.save();

  // Trả về test với questions (không có đáp án)
  const questionsWithoutAnswers = test.questions.map(q => ({
    _id: q._id,
    type: q.type,
    skill: q.skill,
    level: q.level,
    title: q.title,
    question: q.question,
    audioUrl: q.audioUrl,
    imageUrl: q.imageUrl,
    options: q.options.map(opt => ({ text: opt.text })),
    hints: q.hints,
    points: q.points,
    timeLimit: q.timeLimit
  }));

  return {
    attempt: {
      _id: attempt._id,
      testId: test._id,
      status: attempt.status,
      startedAt: attempt.startedAt
    },
    test: {
      _id: test._id,
      title: test.title,
      description: test.description,
      skill: test.skill,
      level: test.level,
      totalQuestions: test.totalQuestions,
      totalPoints: test.totalPoints,
      timeLimit: test.timeLimit,
      questions: questionsWithoutAnswers
    }
  };
};

/**
 * Submit câu trả lời
 */
const submitAnswer = async (attemptId, questionId, userAnswer) => {
  const attempt = await TestAttempt.findById(attemptId);

  if (!attempt) {
    throw new Error('Attempt not found');
  }

  if (attempt.status !== 'IN_PROGRESS') {
    throw new Error('Test is not in progress');
  }

  const question = await Question.findById(questionId);

  if (!question) {
    throw new Error('Question not found');
  }

  // Kiểm tra đáp án
  let isCorrect = false;
  let pointsEarned = 0;

  switch (question.type) {
    case 'MULTIPLE_CHOICE':
      isCorrect = String(userAnswer) === String(question.correctAnswer);
      break;
    case 'TRUE_FALSE':
      isCorrect = String(userAnswer).toLowerCase() === String(question.correctAnswer).toLowerCase();
      break;
    case 'FILL_BLANK':
      const correctAnswers = Array.isArray(question.correctAnswer) 
        ? question.correctAnswer 
        : [question.correctAnswer];
      isCorrect = correctAnswers.some(ans => 
        String(userAnswer).toLowerCase().trim() === String(ans).toLowerCase().trim()
      );
      break;
    case 'MATCHING':
    case 'ORDERING':
      isCorrect = JSON.stringify(userAnswer) === JSON.stringify(question.correctAnswer);
      break;
    default:
      isCorrect = String(userAnswer) === String(question.correctAnswer);
  }

  if (isCorrect) {
    pointsEarned = question.points;
    attempt.correctAnswers += 1;
  }

  attempt.score += pointsEarned;

  // Lưu answer
  const existingAnswerIndex = attempt.answers.findIndex(
    a => String(a.questionId) === String(questionId)
  );

  const answerData = {
    questionId,
    userAnswer,
    isCorrect,
    pointsEarned,
    timeSpent: 0
  };

  if (existingAnswerIndex >= 0) {
    attempt.answers[existingAnswerIndex] = answerData;
  } else {
    attempt.answers.push(answerData);
  }

  await attempt.save();

  return {
    isCorrect,
    pointsEarned,
    correctAnswer: isCorrect ? null : question.correctAnswer,
    explanation: isCorrect ? null : question.explanation
  };
};

/**
 * Hoàn thành test
 */
const completeTest = async (attemptId, userId) => {
  const attempt = await TestAttempt.findOne({ _id: attemptId, userId });

  if (!attempt) {
    throw new Error('Attempt not found');
  }

  if (attempt.status !== 'IN_PROGRESS') {
    throw new Error('Test is not in progress');
  }

  await attempt.complete();

  const test = await Test.findById(attempt.testId);

  // Gửi notification
  try {
    await sendTestCompletedNotification({
      userId: attempt.userId,
      testId: test._id,
      testName: test.title,
      score: attempt.percentage,
      passed: attempt.passed
    });
  } catch (error) {
    console.error('[ERROR] Failed to send test notification:', error);
  }

  return {
    attemptId: attempt._id,
    status: attempt.status,
    score: attempt.score,
    totalPoints: attempt.totalPoints,
    percentage: attempt.percentage,
    correctAnswers: attempt.correctAnswers,
    totalQuestions: attempt.totalQuestions,
    passed: attempt.passed,
    timeSpent: attempt.timeSpent,
    completedAt: attempt.completedAt
  };
};

/**
 * Lấy kết quả test
 */
const getTestResult = async (attemptId, userId) => {
  const attempt = await TestAttempt.findOne({ _id: attemptId, userId })
    .populate('testId')
    .populate('answers.questionId')
    .lean();

  if (!attempt) {
    throw new Error('Attempt not found');
  }

  return attempt;
};

/**
 * Lấy lịch sử làm bài
 */
const getUserTestHistory = async (userId, { page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;

  const [attempts, total] = await Promise.all([
    TestAttempt.find({ userId, status: 'COMPLETED' })
      .populate('testId', 'title skill level type')
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    TestAttempt.countDocuments({ userId, status: 'COMPLETED' })
  ]);

  return {
    attempts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

module.exports = {
  getTests,
  getTestById,
  startTest,
  submitAnswer,
  completeTest,
  getTestResult,
  getUserTestHistory
};