const express = require('express');
const router = express.Router();
const testHistoryController = require('../controllers/testHistoryController');
const { protect } = require('../middleware/auth');

/**
 * Test History Routes
 * Routes lịch sử thi
 */

// @route   GET /api/test-history
// @desc    Get test history with filters and pagination
// @desc    Lấy lịch sử thi với bộ lọc và phân trang
// @access  Private
// @query   page, limit, status, sortBy, sortOrder, testId, courseId, lessonId, startDate, endDate, minScore, maxScore, passed
router.get('/', protect, testHistoryController.getTestHistory);

// @route   GET /api/test-history/statistics
// @desc    Get overall statistics for user's test performance
// @desc    Lấy thống kê tổng quan về hiệu suất thi
// @access  Private
// @query   courseId, lessonId, startDate, endDate
router.get('/statistics', protect, testHistoryController.getUserStatistics);

// @route   GET /api/test-history/progress-trend
// @desc    Get progress trend over time
// @desc    Lấy xu hướng tiến độ theo thời gian
// @access  Private
// @query   period (week|month|year), testId
router.get('/progress-trend', protect, testHistoryController.getProgressTrend);

// @route   GET /api/test-history/compare/:testId
// @desc    Compare multiple attempts of the same test
// @desc    So sánh nhiều lần thi cùng một bài test
// @access  Private
router.get('/compare/:testId', protect, testHistoryController.compareAttempts);

// @route   GET /api/test-history/:attemptId
// @desc    Get detailed result of a specific test attempt
// @desc    Lấy kết quả chi tiết của một lần thi cụ thể
// @access  Private
router.get('/:attemptId', protect, testHistoryController.getAttemptDetail);

module.exports = router;
