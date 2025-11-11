const testHistoryService = require('../services/testHistoryService');

/**
 * @route   GET /api/test-history
 * @desc    Get test history with filters and pagination
 * @desc    Lấy lịch sử thi với bộ lọc và phân trang
 * @access  Private
 */
const getTestHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
      testId: req.query.testId,
      courseId: req.query.courseId,
      lessonId: req.query.lessonId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      minScore: req.query.minScore,
      maxScore: req.query.maxScore,
      passed: req.query.passed
    };

    const result = await testHistoryService.getTestHistory(userId, options);

    res.json({
      success: true,
      message: 'Test history retrieved successfully',
      messageVietnamese: 'Lấy lịch sử thi thành công',
      data: result
    });
  } catch (error) {
    console.error('Get test history error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get test history',
      messageVietnamese: error.message || 'Không thể lấy lịch sử thi'
    });
  }
};

/**
 * @route   GET /api/test-history/:attemptId
 * @desc    Get detailed result of a specific test attempt
 * @desc    Lấy kết quả chi tiết của một lần thi cụ thể
 * @access  Private
 */
const getAttemptDetail = async (req, res) => {
  try {
    const userId = req.user._id;
    const { attemptId } = req.params;

    const result = await testHistoryService.getAttemptDetail(userId, attemptId);

    res.json({
      success: true,
      message: 'Attempt detail retrieved successfully',
      messageVietnamese: 'Lấy chi tiết kết quả thi thành công',
      data: result
    });
  } catch (error) {
    console.error('Get attempt detail error:', error);
    
    if (error.message === 'Test attempt not found') {
      return res.status(404).json({
        success: false,
        message: 'Test attempt not found',
        messageVietnamese: 'Không tìm thấy lần thi này'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get attempt detail',
      messageVietnamese: error.message || 'Không thể lấy chi tiết kết quả thi'
    });
  }
};

/**
 * @route   GET /api/test-history/compare/:testId
 * @desc    Compare multiple attempts of the same test
 * @desc    So sánh nhiều lần thi cùng một bài test
 * @access  Private
 */
const compareAttempts = async (req, res) => {
  try {
    const userId = req.user._id;
    const { testId } = req.params;

    const result = await testHistoryService.compareAttempts(userId, testId);

    res.json({
      success: true,
      message: 'Attempts comparison retrieved successfully',
      messageVietnamese: 'Lấy so sánh các lần thi thành công',
      data: result
    });
  } catch (error) {
    console.error('Compare attempts error:', error);

    if (error.message === 'No completed attempts found for this test') {
      return res.status(404).json({
        success: false,
        message: 'No completed attempts found for this test',
        messageVietnamese: 'Không tìm thấy lần thi nào đã hoàn thành cho bài test này'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to compare attempts',
      messageVietnamese: error.message || 'Không thể so sánh các lần thi'
    });
  }
};

/**
 * @route   GET /api/test-history/statistics
 * @desc    Get overall statistics for user's test performance
 * @desc    Lấy thống kê tổng quan về hiệu suất thi của người dùng
 * @access  Private
 */
const getUserStatistics = async (req, res) => {
  try {
    const userId = req.user._id;
    const options = {
      courseId: req.query.courseId,
      lessonId: req.query.lessonId,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const result = await testHistoryService.getUserTestStatistics(userId, options);

    res.json({
      success: true,
      message: 'User test statistics retrieved successfully',
      messageVietnamese: 'Lấy thống kê thi của người dùng thành công',
      data: result
    });
  } catch (error) {
    console.error('Get user statistics error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get user statistics',
      messageVietnamese: error.message || 'Không thể lấy thống kê người dùng'
    });
  }
};

/**
 * @route   GET /api/test-history/progress-trend
 * @desc    Get progress trend over time
 * @desc    Lấy xu hướng tiến độ theo thời gian
 * @access  Private
 */
const getProgressTrend = async (req, res) => {
  try {
    const userId = req.user._id;
    const options = {
      period: req.query.period, // week | month | year
      testId: req.query.testId
    };

    const result = await testHistoryService.getProgressTrend(userId, options);

    res.json({
      success: true,
      message: 'Progress trend retrieved successfully',
      messageVietnamese: 'Lấy xu hướng tiến độ thành công',
      data: result
    });
  } catch (error) {
    console.error('Get progress trend error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get progress trend',
      messageVietnamese: error.message || 'Không thể lấy xu hướng tiến độ'
    });
  }
};

module.exports = {
  getTestHistory,
  getAttemptDetail,
  compareAttempts,
  getUserStatistics,
  getProgressTrend
};
