const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getTests,
  getTestById,
  startTest,
  submitAnswer,
  completeTest,
  getTestResult,
  getUserTestHistory
} = require('../services/testService');
const Question = require('../models/Question');
const Test = require('../models/Test');

/**
 * GET /api/tests
 * Lấy danh sách tests
 * Query: skill, level, type, page, limit
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { skill, level, type, page, limit } = req.query;

    const result = await getTests({ skill, level, type, page, limit });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[ERROR] Get tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách tests'
    });
  }
});

/**
 * GET /api/tests/:id
 * Lấy chi tiết test (không bao gồm đáp án)
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const test = await getTestById(req.params.id);

    // Remove correct answers
    const testWithoutAnswers = {
      ...test,
      questions: test.questions.map(q => ({
        ...q,
        correctAnswer: undefined,
        options: q.options?.map(opt => ({ text: opt.text }))
      }))
    };

    res.json({
      success: true,
      data: {
        test: testWithoutAnswers
      }
    });
  } catch (error) {
    console.error('[ERROR] Get test error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Không tìm thấy test'
    });
  }
});

/**
 * POST /api/tests/:id/start
 * Bắt đầu làm test
 */
router.post('/:id/start', authenticate, async (req, res) => {
  try {
    const result = await startTest(req.user._id, req.params.id);

    res.json({
      success: true,
      message: 'Bắt đầu làm test thành công',
      data: result
    });
  } catch (error) {
    console.error('[ERROR] Start test error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Không thể bắt đầu test'
    });
  }
});

/**
 * POST /api/tests/attempts/:attemptId/answer
 * Submit câu trả lời
 * Body: { questionId, answer }
 */
router.post('/attempts/:attemptId/answer', authenticate, async (req, res) => {
  try {
    const { questionId, answer } = req.body;

    if (!questionId || answer === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp questionId và answer'
      });
    }

    const result = await submitAnswer(req.params.attemptId, questionId, answer);

    res.json({
      success: true,
      message: 'Đã ghi nhận câu trả lời',
      data: result
    });
  } catch (error) {
    console.error('[ERROR] Submit answer error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Không thể ghi nhận câu trả lời'
    });
  }
});

/**
 * POST /api/tests/attempts/:attemptId/complete
 * Hoàn thành test
 */
router.post('/attempts/:attemptId/complete', authenticate, async (req, res) => {
  try {
    const result = await completeTest(req.params.attemptId, req.user._id);

    res.json({
      success: true,
      message: 'Hoàn thành test thành công',
      data: result
    });
  } catch (error) {
    console.error('[ERROR] Complete test error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Không thể hoàn thành test'
    });
  }
});

/**
 * GET /api/tests/attempts/:attemptId/result
 * Lấy kết quả test
 */
router.get('/attempts/:attemptId/result', authenticate, async (req, res) => {
  try {
    const result = await getTestResult(req.params.attemptId, req.user._id);

    res.json({
      success: true,
      data: {
        result
      }
    });
  } catch (error) {
    console.error('[ERROR] Get result error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Không tìm thấy kết quả'
    });
  }
});

/**
 * GET /api/tests/history
 * Lấy lịch sử làm bài
 */
router.get('/user/history', authenticate, async (req, res) => {
  try {
    const { page, limit } = req.query;

    const result = await getUserTestHistory(req.user._id, { page, limit });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[ERROR] Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy lịch sử'
    });
  }
});

/**
 * POST /api/tests (Admin only)
 * Tạo test mới
 */
router.post('/', authenticate, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      skill,
      level,
      questionIds,
      passingScore,
      timeLimit,
      attempts
    } = req.body;

    if (!title || !skill || !level || !questionIds || !Array.isArray(questionIds)) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc'
      });
    }

    const questions = await Question.find({ _id: { $in: questionIds } });

    if (questions.length !== questionIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Một số câu hỏi không tồn tại'
      });
    }

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    const test = new Test({
      title,
      description,
      type: type || 'PRACTICE',
      skill,
      level,
      questions: questionIds,
      totalQuestions: questions.length,
      totalPoints,
      passingScore: passingScore || 70,
      timeLimit,
      attempts: attempts || -1,
      createdBy: req.user._id
    });

    await test.save();

    res.status(201).json({
      success: true,
      message: 'Tạo test thành công',
      data: { test }
    });
  } catch (error) {
    console.error('[ERROR] Create test error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tạo test'
    });
  }
});

module.exports = router;