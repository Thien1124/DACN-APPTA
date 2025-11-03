const PracticeExercise = require('../models/PracticeExercise');
const PracticeResult = require('../models/PracticeResult');
const User = require('../models/User');
const Heart = require('../models/Heart');
const xpController = require('./xpController');
const streakController = require('./streakController');

/**
 * ==========================================
 * TASK 16: PRACTICE SYSTEM - Collocation/Phrasal Verbs/Word Family
 * ==========================================
 * 
 * API Test Endpoints:
 * 1. GET /api/practice/exercises - Lấy danh sách bài tập (theo category, level)
 * 2. GET /api/practice/exercises/:id - Lấy chi tiết một bài tập
 * 3. POST /api/practice/exercises/:id/submit - Nộp đáp án
 * 4. GET /api/practice/history - Lịch sử làm bài
 */

/**
 * Lấy danh sách bài tập luyện tập
 * 
 * API Test:
 * GET /api/practice/exercises?category=collocation&level=B1&limit=10
 * Headers: Authorization: Bearer {token}
 * 
 * Query Params:
 * - category: collocation | phrasal-verb | word-family (optional)
 * - level: A1 | A2 | B1 | B2 | C1 | C2 (optional)
 * - difficulty: easy | medium | hard (optional)
 * - limit: số lượng bài tập (default: 10)
 * - page: số trang (default: 1)
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "_id": "...",
 *       "category": "collocation",
 *       "targetWord": "make",
 *       "question": "Choose the correct collocation",
 *       "contextSentence": "I need to ___ a decision",
 *       "questionType": "multiple-choice",
 *       "options": [
 *         { "text": "make", "isCorrect": true },
 *         { "text": "do", "isCorrect": false }
 *       ],
 *       "points": 10,
 *       "level": "B1"
 *     }
 *   ],
 *   "pagination": {
 *     "currentPage": 1,
 *     "totalPages": 5,
 *     "totalItems": 50
 *   }
 * }
 */
exports.getExercises = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, level, difficulty, limit = 10, page = 1 } = req.query;

    // Xây dựng query
    const query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (level) {
      query.level = level;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Lấy bài tập
    const exercises = await PracticeExercise.find(query)
      .select('-correctAnswer -explanation') // Không trả về đáp án
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    // Đếm tổng số bài tập
    const totalItems = await PracticeExercise.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limitNum);

    return res.status(200).json({
      success: true,
      data: exercises,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems,
        itemsPerPage: limitNum
      }
    });

  } catch (error) {
    console.error('Lỗi khi lấy danh sách bài tập:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

/**
 * Lấy chi tiết một bài tập (khi user bắt đầu làm)
 * 
 * API Test:
 * GET /api/practice/exercises/:id
 * Headers: Authorization: Bearer {token}
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "_id": "...",
 *     "category": "collocation",
 *     "targetWord": "make",
 *     "question": "Choose the correct collocation",
 *     "contextSentence": "I need to ___ a decision",
 *     "questionType": "multiple-choice",
 *     "options": [
 *       { "text": "make", "isCorrect": false }, // Ẩn đáp án
 *       { "text": "do", "isCorrect": false }
 *     ],
 *     "points": 10,
 *     "examples": [...]
 *   }
 * }
 */
exports.getExerciseById = async (req, res) => {
  try {
    const { id } = req.params;

    const exercise = await PracticeExercise.findById(id);

    if (!exercise || !exercise.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài tập'
      });
    }

    // Tạo bản copy và ẩn đáp án
    const exerciseData = exercise.toObject();
    delete exerciseData.correctAnswer;
    delete exerciseData.explanation;

    // Ẩn isCorrect trong options
    if (exerciseData.options) {
      exerciseData.options = exerciseData.options.map(opt => ({
        text: opt.text
      }));
    }

    return res.status(200).json({
      success: true,
      data: exerciseData
    });

  } catch (error) {
    console.error('Lỗi khi lấy chi tiết bài tập:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

/**
 * Nộp đáp án bài tập
 * 
 * API Test:
 * POST /api/practice/exercises/:id/submit
 * Headers: Authorization: Bearer {token}
 * Content-Type: application/json
 * 
 * Body:
 * {
 *   "userAnswer": "make",  // hoặc ["make", "do"] nếu multiple answer
 *   "timeSpent": 15  // seconds (optional)
 * }
 * 
 * Response Success:
 * {
 *   "success": true,
 *   "isCorrect": true,
 *   "correctAnswer": "make",
 *   "explanation": "Make a decision là collocation đúng",
 *   "pointsEarned": 10,
 *   "xpEarned": 10,
 *   "userStats": {
 *     "xp": { "total": 260, "level": 2 },
 *     "gems": { "amount": 50 }
 *   }
 * }
 * 
 * Response Error (sai):
 * {
 *   "success": true,
 *   "isCorrect": false,
 *   "correctAnswer": "make",
 *   "userAnswer": "do",
 *   "explanation": "Make a decision là collocation đúng. 'Do' không đi với 'decision'",
 *   "examples": [...],
 *   "pointsEarned": 0,
 *   "xpEarned": 0
 * }
 */
exports.submitAnswer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { userAnswer, timeSpent = 0 } = req.body;

    if (!userAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đáp án'
      });
    }

    // Lấy bài tập
    const exercise = await PracticeExercise.findById(id);

    if (!exercise || !exercise.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài tập'
      });
    }

    // Kiểm tra đáp án
    const isCorrect = checkAnswer(userAnswer, exercise.correctAnswer);
    const pointsEarned = isCorrect ? exercise.points : 0;
    const xpEarned = isCorrect ? exercise.points : 0; // 1 point = 1 XP

    // Lưu kết quả
    const result = await PracticeResult.create({
      user: userId,
      practiceExercise: id,
      userAnswer,
      correctAnswer: exercise.correctAnswer,
      isCorrect,
      timeSpent,
      pointsEarned,
      xpEarned
    });

    // Cập nhật thống kê bài tập
    exercise.stats.totalAttempts += 1;
    if (isCorrect) {
      exercise.stats.correctAttempts += 1;
    }
    if (timeSpent > 0) {
      const totalTime = exercise.stats.averageTime * (exercise.stats.totalAttempts - 1) + timeSpent;
      exercise.stats.averageTime = Math.round(totalTime / exercise.stats.totalAttempts);
    }
    await exercise.save();

    // Nếu đúng: cập nhật XP, streak
    if (isCorrect) {
      const user = await User.findById(userId);
      
      // Cập nhật XP
      user.xp.total += xpEarned;
      const newLevel = 1 + Math.floor(Math.sqrt(user.xp.total / 100));
      const leveledUp = newLevel > user.xp.level;
      user.xp.level = newLevel;
      await user.save();

      // Cập nhật streak
      // TODO: Có thể gọi streakController.updateStreak thông qua service
      if (!user.streak) {
        user.streak = { count: 0, lastActivityDate: null };
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastActivity = user.streak.lastActivityDate ? new Date(user.streak.lastActivityDate) : null;
      if (lastActivity) {
        lastActivity.setHours(0, 0, 0, 0);
      }

      if (!lastActivity || lastActivity.getTime() !== today.getTime()) {
        if (!lastActivity) {
          user.streak.count = 1;
        } else {
          const diffDays = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            user.streak.count += 1;
          } else {
            user.streak.count = 1;
          }
        }
        user.streak.lastActivityDate = today;
        await user.save();
      }
    }

    // Chuẩn bị response
    const response = {
      success: true,
      isCorrect,
      correctAnswer: exercise.correctAnswer,
      userAnswer,
      explanation: exercise.explanation,
      pointsEarned,
      xpEarned
    };

    // Thêm examples nếu có
    if (exercise.examples && exercise.examples.length > 0) {
      response.examples = exercise.examples;
    }

    // Thêm user stats nếu đúng
    if (isCorrect) {
      const user = await User.findById(userId).select('xp gems');
      response.userStats = {
        xp: user.xp,
        gems: user.gems
      };
    }

    return res.status(200).json(response);

  } catch (error) {
    console.error('Lỗi khi nộp đáp án:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

/**
 * Helper function: Kiểm tra đáp án
 */
function checkAnswer(userAnswer, correctAnswer) {
  // Nếu là array, so sánh cả array
  if (Array.isArray(correctAnswer)) {
    if (!Array.isArray(userAnswer)) {
      return false;
    }
    // So sánh không phân biệt thứ tự
    const userSorted = [...userAnswer].sort().join(',');
    const correctSorted = [...correctAnswer].sort().join(',');
    return userSorted === correctSorted;
  }

  // So sánh string (case-insensitive)
  if (typeof correctAnswer === 'string') {
    return userAnswer.toString().toLowerCase().trim() === correctAnswer.toLowerCase().trim();
  }

  // So sánh số
  return userAnswer === correctAnswer;
}

/**
 * Lấy lịch sử làm bài
 * 
 * API Test:
 * GET /api/practice/history?limit=20
 * Headers: Authorization: Bearer {token}
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "_id": "...",
 *       "practiceExercise": {
 *         "_id": "...",
 *         "category": "collocation",
 *         "targetWord": "make",
 *         "question": "..."
 *       },
 *       "isCorrect": true,
 *       "pointsEarned": 10,
 *       "completedAt": "2025-01-15T10:00:00.000Z"
 *     }
 *   ]
 * }
 */
exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, page = 1 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const results = await PracticeResult.find({ user: userId })
      .populate('practiceExercise', 'category targetWord question questionType points')
      .sort({ completedAt: -1 })
      .limit(limitNum)
      .skip(skip);

    const totalItems = await PracticeResult.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalItems / limitNum);

    return res.status(200).json({
      success: true,
      data: results,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems,
        itemsPerPage: limitNum
      }
    });

  } catch (error) {
    console.error('Lỗi khi lấy lịch sử:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

