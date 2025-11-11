const TestAttempt = require('../models/TestAttempt');
const Test = require('../models/Test');
const Question = require('../models/Question');

/**
 * Get test history for a user with filters and pagination
 * Lấy lịch sử thi của người dùng với bộ lọc và phân trang
 */
const getTestHistory = async (userId, options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'COMPLETED', // Default: only completed tests
      sortBy = 'completedAt', // completedAt | score | percentage
      sortOrder = 'desc', // desc | asc
      testId = null,
      courseId = null,
      lessonId = null,
      startDate = null,
      endDate = null,
      minScore = null,
      maxScore = null,
      passed = null
    } = options;

    // Build query
    const query = { userId };

    if (status) {
      if (status === 'ALL') {
        // Get all statuses
      } else if (Array.isArray(status)) {
        query.status = { $in: status };
      } else {
        query.status = status;
      }
    }

    if (testId) {
      query.testId = testId;
    }

    // Date range filter
    if (startDate || endDate) {
      query.completedAt = {};
      if (startDate) {
        query.completedAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.completedAt.$lte = new Date(endDate);
      }
    }

    // Score range filter
    if (minScore !== null || maxScore !== null) {
      query.percentage = {};
      if (minScore !== null) {
        query.percentage.$gte = minScore;
      }
      if (maxScore !== null) {
        query.percentage.$lte = maxScore;
      }
    }

    // Passed filter
    if (passed !== null) {
      query.passed = passed === 'true' || passed === true;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get total count
    const total = await TestAttempt.countDocuments(query);

    // Get attempts with populate
    let attemptsQuery = TestAttempt.find(query)
      .populate({
        path: 'testId',
        select: 'title description passingScore difficulty timeLimit',
        populate: {
          path: 'lessonId',
          select: 'title',
          populate: {
            path: 'courseId',
            select: 'title'
          }
        }
      })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Apply course/lesson filter if provided
    const attempts = await attemptsQuery;

    // Filter by course/lesson if needed (after populate)
    let filteredAttempts = attempts;
    if (courseId || lessonId) {
      filteredAttempts = attempts.filter(attempt => {
        if (!attempt.testId || !attempt.testId.lessonId) return false;
        
        if (courseId && attempt.testId.lessonId.courseId?._id?.toString() !== courseId) {
          return false;
        }
        
        if (lessonId && attempt.testId.lessonId._id?.toString() !== lessonId) {
          return false;
        }
        
        return true;
      });
    }

    // Format response
    const history = filteredAttempts.map(attempt => ({
      attemptId: attempt._id,
      test: {
        id: attempt.testId?._id,
        title: attempt.testId?.title,
        description: attempt.testId?.description,
        difficulty: attempt.testId?.difficulty,
        passingScore: attempt.testId?.passingScore,
        timeLimit: attempt.testId?.timeLimit,
        lesson: {
          id: attempt.testId?.lessonId?._id,
          title: attempt.testId?.lessonId?.title,
          course: {
            id: attempt.testId?.lessonId?.courseId?._id,
            title: attempt.testId?.lessonId?.courseId?.title
          }
        }
      },
      score: attempt.score,
      totalPoints: attempt.totalPoints,
      percentage: attempt.percentage,
      correctAnswers: attempt.correctAnswers,
      totalQuestions: attempt.totalQuestions,
      passed: attempt.passed,
      status: attempt.status,
      timeSpent: attempt.timeSpent,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      attemptNumber: null // Will be calculated later
    }));

    return {
      history,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    };

  } catch (error) {
    console.error('Get test history error:', error);
    throw error;
  }
};

/**
 * Get detailed result of a specific test attempt
 * Lấy kết quả chi tiết của một lần thi cụ thể
 */
const getAttemptDetail = async (userId, attemptId) => {
  try {
    const attempt = await TestAttempt.findOne({
      _id: attemptId,
      userId
    })
      .populate({
        path: 'testId',
        select: 'title description passingScore difficulty timeLimit',
        populate: {
          path: 'lessonId',
          select: 'title courseId',
          populate: {
            path: 'courseId',
            select: 'title'
          }
        }
      })
      .populate({
        path: 'answers.questionId',
        select: 'questionText questionType options correctAnswer explanation points'
      })
      .lean();

    if (!attempt) {
      throw new Error('Test attempt not found');
    }

    // Format detailed answers
    const detailedAnswers = attempt.answers.map(answer => {
      const question = answer.questionId;
      
      return {
        questionId: question._id,
        questionText: question.questionText,
        questionType: question.questionType,
        options: question.options,
        userAnswer: answer.userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect: answer.isCorrect,
        pointsEarned: answer.pointsEarned,
        pointsAvailable: question.points,
        timeSpent: answer.timeSpent,
        explanation: question.explanation
      };
    });

    // Calculate statistics
    const stats = {
      byQuestionType: {},
      byDifficulty: {},
      averageTimePerQuestion: attempt.timeSpent / attempt.totalQuestions || 0
    };

    // Group by question type
    detailedAnswers.forEach(answer => {
      const type = answer.questionType;
      if (!stats.byQuestionType[type]) {
        stats.byQuestionType[type] = {
          total: 0,
          correct: 0,
          percentage: 0
        };
      }
      stats.byQuestionType[type].total++;
      if (answer.isCorrect) {
        stats.byQuestionType[type].correct++;
      }
    });

    // Calculate percentages
    Object.keys(stats.byQuestionType).forEach(type => {
      const data = stats.byQuestionType[type];
      data.percentage = Math.round((data.correct / data.total) * 100);
    });

    return {
      attemptId: attempt._id,
      test: {
        id: attempt.testId._id,
        title: attempt.testId.title,
        description: attempt.testId.description,
        difficulty: attempt.testId.difficulty,
        passingScore: attempt.testId.passingScore,
        timeLimit: attempt.testId.timeLimit,
        lesson: {
          id: attempt.testId.lessonId?._id,
          title: attempt.testId.lessonId?.title,
          course: {
            id: attempt.testId.lessonId?.courseId?._id,
            title: attempt.testId.lessonId?.courseId?.title
          }
        }
      },
      result: {
        score: attempt.score,
        totalPoints: attempt.totalPoints,
        percentage: attempt.percentage,
        correctAnswers: attempt.correctAnswers,
        totalQuestions: attempt.totalQuestions,
        passed: attempt.passed,
        status: attempt.status,
        timeSpent: attempt.timeSpent,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt
      },
      answers: detailedAnswers,
      statistics: stats
    };

  } catch (error) {
    console.error('Get attempt detail error:', error);
    throw error;
  }
};

/**
 * Compare multiple attempts of the same test
 * So sánh nhiều lần thi cùng một bài test
 */
const compareAttempts = async (userId, testId) => {
  try {
    const attempts = await TestAttempt.find({
      userId,
      testId,
      status: 'COMPLETED'
    })
      .sort({ completedAt: 1 }) // Oldest first
      .select('score percentage correctAnswers totalQuestions timeSpent completedAt passed')
      .lean();

    if (attempts.length === 0) {
      throw new Error('No completed attempts found for this test');
    }

    // Add attempt numbers
    const numberedAttempts = attempts.map((attempt, index) => ({
      attemptNumber: index + 1,
      attemptId: attempt._id,
      score: attempt.score,
      percentage: attempt.percentage,
      correctAnswers: attempt.correctAnswers,
      totalQuestions: attempt.totalQuestions,
      timeSpent: attempt.timeSpent,
      completedAt: attempt.completedAt,
      passed: attempt.passed
    }));

    // Calculate improvement
    const firstAttempt = numberedAttempts[0];
    const lastAttempt = numberedAttempts[numberedAttempts.length - 1];
    const bestAttempt = [...numberedAttempts].sort((a, b) => b.percentage - a.percentage)[0];
    const worstAttempt = [...numberedAttempts].sort((a, b) => a.percentage - b.percentage)[0];

    const improvement = {
      scoreImprovement: lastAttempt.score - firstAttempt.score,
      percentageImprovement: lastAttempt.percentage - firstAttempt.percentage,
      timeImprovement: firstAttempt.timeSpent - lastAttempt.timeSpent, // Negative = took longer
      averageScore: Math.round(numberedAttempts.reduce((sum, a) => sum + a.score, 0) / numberedAttempts.length),
      averagePercentage: Math.round(numberedAttempts.reduce((sum, a) => sum + a.percentage, 0) / numberedAttempts.length),
      totalAttempts: numberedAttempts.length,
      passedAttempts: numberedAttempts.filter(a => a.passed).length,
      bestAttempt: {
        attemptNumber: bestAttempt.attemptNumber,
        percentage: bestAttempt.percentage,
        completedAt: bestAttempt.completedAt
      },
      worstAttempt: {
        attemptNumber: worstAttempt.attemptNumber,
        percentage: worstAttempt.percentage,
        completedAt: worstAttempt.completedAt
      }
    };

    return {
      testId,
      attempts: numberedAttempts,
      improvement
    };

  } catch (error) {
    console.error('Compare attempts error:', error);
    throw error;
  }
};

/**
 * Get overall statistics for user's test performance
 * Lấy thống kê tổng quan về hiệu suất thi của người dùng
 */
const getUserTestStatistics = async (userId, options = {}) => {
  try {
    const {
      courseId = null,
      lessonId = null,
      startDate = null,
      endDate = null
    } = options;

    // Build query
    const query = {
      userId,
      status: 'COMPLETED'
    };

    if (startDate || endDate) {
      query.completedAt = {};
      if (startDate) query.completedAt.$gte = new Date(startDate);
      if (endDate) query.completedAt.$lte = new Date(endDate);
    }

    // Get all completed attempts
    const attempts = await TestAttempt.find(query)
      .populate({
        path: 'testId',
        select: 'difficulty lessonId',
        populate: {
          path: 'lessonId',
          select: 'courseId'
        }
      })
      .lean();

    // Filter by course/lesson if needed
    let filteredAttempts = attempts;
    if (courseId || lessonId) {
      filteredAttempts = attempts.filter(attempt => {
        if (!attempt.testId?.lessonId) return false;
        if (courseId && attempt.testId.lessonId.courseId?.toString() !== courseId) return false;
        if (lessonId && attempt.testId.lessonId._id?.toString() !== lessonId) return false;
        return true;
      });
    }

    if (filteredAttempts.length === 0) {
      return {
        totalAttempts: 0,
        totalPassed: 0,
        totalFailed: 0,
        passRate: 0,
        averageScore: 0,
        averagePercentage: 0,
        averageTimeSpent: 0,
        byDifficulty: {},
        recentActivity: []
      };
    }

    // Calculate statistics
    const totalAttempts = filteredAttempts.length;
    const totalPassed = filteredAttempts.filter(a => a.passed).length;
    const totalFailed = totalAttempts - totalPassed;
    const passRate = Math.round((totalPassed / totalAttempts) * 100);

    const totalScore = filteredAttempts.reduce((sum, a) => sum + (a.score || 0), 0);
    const totalPercentage = filteredAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0);
    const totalTime = filteredAttempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0);

    const averageScore = Math.round(totalScore / totalAttempts);
    const averagePercentage = Math.round(totalPercentage / totalAttempts);
    const averageTimeSpent = Math.round(totalTime / totalAttempts);

    // Group by difficulty
    const byDifficulty = {};
    filteredAttempts.forEach(attempt => {
      const difficulty = attempt.testId?.difficulty || 'unknown';
      if (!byDifficulty[difficulty]) {
        byDifficulty[difficulty] = {
          total: 0,
          passed: 0,
          failed: 0,
          averageScore: 0,
          scores: []
        };
      }
      byDifficulty[difficulty].total++;
      if (attempt.passed) {
        byDifficulty[difficulty].passed++;
      } else {
        byDifficulty[difficulty].failed++;
      }
      byDifficulty[difficulty].scores.push(attempt.percentage);
    });

    // Calculate averages for each difficulty
    Object.keys(byDifficulty).forEach(difficulty => {
      const data = byDifficulty[difficulty];
      data.averageScore = Math.round(
        data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length
      );
      data.passRate = Math.round((data.passed / data.total) * 100);
      delete data.scores; // Remove raw scores
    });

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentAttempts = filteredAttempts
      .filter(a => a.completedAt && new Date(a.completedAt) >= sevenDaysAgo)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    const recentActivity = recentAttempts.slice(0, 5).map(attempt => ({
      attemptId: attempt._id,
      testId: attempt.testId?._id,
      percentage: attempt.percentage,
      passed: attempt.passed,
      completedAt: attempt.completedAt
    }));

    return {
      totalAttempts,
      totalPassed,
      totalFailed,
      passRate,
      averageScore,
      averagePercentage,
      averageTimeSpent,
      byDifficulty,
      recentActivity,
      dateRange: {
        startDate: startDate || filteredAttempts[0]?.completedAt,
        endDate: endDate || filteredAttempts[filteredAttempts.length - 1]?.completedAt
      }
    };

  } catch (error) {
    console.error('Get user test statistics error:', error);
    throw error;
  }
};

/**
 * Get progress trend over time
 * Lấy xu hướng tiến độ theo thời gian
 */
const getProgressTrend = async (userId, options = {}) => {
  try {
    const {
      period = 'week', // week | month | year
      testId = null
    } = options;

    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Build query
    const query = {
      userId,
      status: 'COMPLETED',
      completedAt: {
        $gte: startDate,
        $lte: endDate
      }
    };

    if (testId) {
      query.testId = testId;
    }

    const attempts = await TestAttempt.find(query)
      .sort({ completedAt: 1 })
      .select('percentage score completedAt passed')
      .lean();

    // Group by date
    const trendData = [];
    const groupedByDate = {};

    attempts.forEach(attempt => {
      const date = new Date(attempt.completedAt).toISOString().split('T')[0];
      if (!groupedByDate[date]) {
        groupedByDate[date] = {
          date,
          attempts: [],
          totalAttempts: 0,
          averageScore: 0,
          averagePercentage: 0,
          passCount: 0
        };
      }
      groupedByDate[date].attempts.push(attempt);
      groupedByDate[date].totalAttempts++;
      if (attempt.passed) {
        groupedByDate[date].passCount++;
      }
    });

    // Calculate averages
    Object.keys(groupedByDate).forEach(date => {
      const data = groupedByDate[date];
      data.averageScore = Math.round(
        data.attempts.reduce((sum, a) => sum + a.score, 0) / data.attempts.length
      );
      data.averagePercentage = Math.round(
        data.attempts.reduce((sum, a) => sum + a.percentage, 0) / data.attempts.length
      );
      data.passRate = Math.round((data.passCount / data.totalAttempts) * 100);
      delete data.attempts; // Remove raw attempts
      trendData.push(data);
    });

    // Sort by date
    trendData.sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      period,
      startDate,
      endDate,
      totalDataPoints: trendData.length,
      trend: trendData
    };

  } catch (error) {
    console.error('Get progress trend error:', error);
    throw error;
  }
};

module.exports = {
  getTestHistory,
  getAttemptDetail,
  compareAttempts,
  getUserTestStatistics,
  getProgressTrend
};
