
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
      .select('-correctAnswer')
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
>>>>>>> a3254174b043b29760571efb471bbf382a059d22
 */
exports.getExerciseById = async (req, res) => {
  try {
    const { id } = req.params;


    const exercise = await PracticeExercise.findById(id).select('-correctAnswer -explanation -examples -commonMistakes');

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
>>>>>>> a3254174b043b29760571efb471bbf382a059d22
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
    // Check answer
    let isCorrect = false;
    
    if (exercise.type === 'match_pairs') {
      // So sánh object
      isCorrect = JSON.stringify(userAnswer) === JSON.stringify(exercise.correctAnswer);
    } else {
      // So sánh string (case-insensitive)
      isCorrect = String(userAnswer).trim().toLowerCase() === String(exercise.correctAnswer).trim().toLowerCase();
    }

    // Calculate points & XP
    const pointsEarned = isCorrect ? exercise.points : 0;
    const xpEarned = isCorrect ? exercise.points : 0;

    // Save result
    await PracticeResult.create({
      user: userId,
      practiceExercise: id,
      userAnswer,
      correctAnswer: exercise.correctAnswer,
      isCorrect,
      timeSpent,
      pointsEarned,
      xpEarned
    });

    // Update user XP nếu đúng
    if (isCorrect) {
      await User.findByIdAndUpdate(userId, {
        $inc: { totalXP: xpEarned }
      });
    }

    // Get updated user stats
    const user = await User.findById(userId).select('totalXP gems');

     (`${isCorrect ? '✅' : '❌'} User ${userId} answered exercise ${id}: ${isCorrect ? 'Correct' : 'Wrong'}`);

    res.status(200).json({
      success: true,
      isCorrect,
      correctAnswer: exercise.correctAnswer,
      explanation: exercise.explanation,
      examples: exercise.examples,
      commonMistakes: exercise.commonMistakes,
      pointsEarned,
      xpEarned,
      userStats: {
        xp: {
          total: user.totalXP,
          level: Math.floor(user.totalXP / 100) + 1
        },
        gems: {
          amount: user.gems || 0
        }
      }
    });

  } catch (error) {
    console.error('❌ Submit answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể nộp đáp án',
      error: error.message
    });
  }
};


/**
 * Ôn tập thông minh với AI - Task 23
 * Tự động phân tích các bài tập có strength thấp nhất và lâu được ôn nhất
 * 
 * API Test:
 * GET /api/practice/smart-review
 * Headers: Authorization: Bearer {token}
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "sessionId": "smart-review-123",
 *     "questions": [
 *       {
 *         "_id": "...",
 *         "category": "collocation",
 *         "targetWord": "make",
 *         "question": "Choose the correct collocation",
 *         "contextSentence": "I need to ___ a decision",
 *         "questionType": "multiple-choice",
 *         "options": [...],
 *         "difficulty": "medium",
 *         "strength": 0.3, // Độ mạnh của kiến thức (0-1)
 *         "daysSinceLastReview": 15, // Số ngày từ lần ôn cuối
 *         "lastReviewDate": "2025-01-01T00:00:00.000Z"
 *       }
 *     ],
 *     "totalQuestions": 10,
 *     "estimatedTime": 15, // phút
 *     "difficultyDistribution": {
 *       "easy": 3,
 *       "medium": 5,
 *       "hard": 2
 *     }
 *   }
 * }
 */
exports.getSmartReview = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Lấy lịch sử làm bài của user để phân tích
    const practiceHistory = await PracticeResult.find({ user: userId })
      .populate('practiceExercise')
      .sort({ completedAt: -1 })
      .limit(100); // Lấy 100 bài gần nhất

    // Phân tích độ mạnh của từng bài tập
    const exerciseAnalysis = await analyzeExerciseStrength(userId, practiceHistory);
    
    // Chọn 10 bài tập yếu nhất và lâu ôn nhất
    const weakExercises = selectWeakExercises(exerciseAnalysis, 10);
    
    // Tạo session ôn tập thông minh
    const smartReviewSession = {
      sessionId: `smart-review-${Date.now()}-${userId}`,
      questions: weakExercises,
      totalQuestions: weakExercises.length,
      estimatedTime: Math.round(weakExercises.length * 1.5), // 1.5 phút mỗi câu
      difficultyDistribution: calculateDifficultyDistribution(weakExercises),
      createdAt: new Date()
    };

    // Lưu session vào cache hoặc database (tùy implement)
    // TODO: Có thể lưu vào Redis hoặc collection riêng

    return res.status(200).json({
      success: true,
      data: smartReviewSession
    });

  } catch (error) {
    console.error('Lỗi khi tạo ôn tập thông minh:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo phiên ôn tập thông minh'
    });
  }
};

/**
 * Phân tích độ mạnh của bài tập dựa trên lịch sử
 */
async function analyzeExerciseStrength(userId, practiceHistory) {
  const exerciseMap = new Map();
  
  // Nhóm theo từng bài tập
  practiceHistory.forEach(result => {
    const exerciseId = result.practiceExercise._id.toString();
    
    if (!exerciseMap.has(exerciseId)) {
      exerciseMap.set(exerciseId, {
        exercise: result.practiceExercise,
        attempts: [],
        lastReviewDate: null
      });
    }
    
    const exerciseData = exerciseMap.get(exerciseId);
    exerciseData.attempts.push({
      isCorrect: result.isCorrect,
      completedAt: result.completedAt,
      timeSpent: result.timeSpent
    });
    
    // Cập nhật ngày review gần nhất
    if (!exerciseData.lastReviewDate || result.completedAt > exerciseData.lastReviewDate) {
      exerciseData.lastReviewDate = result.completedAt;
    }
  });
  
  // Tính toán độ mạnh cho từng bài tập
  const analysisResults = [];
  
  for (const [exerciseId, data] of exerciseMap) {
    const { exercise, attempts, lastReviewDate } = data;
    
    // Tính accuracy
    const correctAttempts = attempts.filter(a => a.isCorrect).length;
    const accuracy = correctAttempts / attempts.length;
    
    // Tính consistency (độ ổn định)
    const recentAttempts = attempts.slice(-5); // 5 lần gần nhất
    const recentAccuracy = recentAttempts.filter(a => a.isCorrect).length / recentAttempts.length;
    
    // Tính response time factor
    const avgResponseTime = attempts.reduce((sum, a) => sum + (a.timeSpent || 30), 0) / attempts.length;
    const timeFactor = Math.min(1, 30 / avgResponseTime); // Ưu tiên trả lời nhanh
    
    // Tính strength tổng hợp (0-1)
    const strength = (accuracy * 0.5 + recentAccuracy * 0.3 + timeFactor * 0.2);
    
    // Tính số ngày từ lần ôn cuối
    const daysSinceLastReview = lastReviewDate ? 
      Math.floor((Date.now() - lastReviewDate.getTime()) / (1000 * 60 * 60 * 24)) : 999;
    
    analysisResults.push({
      exercise,
      strength: Math.max(0, Math.min(1, strength)),
      accuracy,
      recentAccuracy,
      attemptsCount: attempts.length,
      daysSinceLastReview,
      lastReviewDate,
      priorityScore: calculatePriorityScore(strength, daysSinceLastReview, accuracy)
    });
  }
  
  return analysisResults;
}

/**
 * Tính điểm ưu tiên cho bài tập (càng yếu, càng lâu ôn thì ưu tiên cao)
 */
function calculatePriorityScore(strength, daysSinceLastReview, accuracy) {
  // Công thức: (1 - strength) * weight1 + daysSinceLastReview * weight2 + (1 - accuracy) * weight3
  const strengthWeight = 0.4;
  const recencyWeight = 0.3;
  const accuracyWeight = 0.3;
  
  return (1 - strength) * strengthWeight + 
         Math.min(30, daysSinceLastReview) * recencyWeight / 30 + 
         (1 - accuracy) * accuracyWeight;
}

/**
 * Chọn bài tập yếu nhất dựa trên phân tích
 */
function selectWeakExercises(analysisResults, limit = 10) {
  // Sắp xếp theo điểm ưu tiên (cao -> thấp)
  const sortedResults = analysisResults
    .filter(result => result.strength < 0.8) // Chỉ lấy bài tập chưa mastered
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, limit * 2); // Lấy gấp đôi để đảm bảo đủ
  
  // Trộn lại để tránh quá tập trung vào một chủ đề
  const shuffled = sortedResults.sort(() => 0.5 - Math.random());
  
  // Chọn top limit và format dữ liệu
  return shuffled.slice(0, limit).map(result => {
    const exercise = result.exercise;
    
    // Ẩn đáp án
    const exerciseData = exercise.toObject();
    delete exerciseData.correctAnswer;
    delete exerciseData.explanation;
    
    if (exerciseData.options) {
      exerciseData.options = exerciseData.options.map(opt => ({
        text: opt.text
      }));
    }
    
    return {
      ...exerciseData,
      strength: Math.round(result.strength * 100) / 100,
      daysSinceLastReview: result.daysSinceLastReview,
      lastReviewDate: result.lastReviewDate,
      accuracy: Math.round(result.accuracy * 100) / 100
    };
  });
}

/**
 * Tính phân bố độ khó
 */
function calculateDifficultyDistribution(exercises) {
  const distribution = { easy: 0, medium: 0, hard: 0 };
  
  exercises.forEach(exercise => {
    distribution[exercise.difficulty]++;
  });
  
  return distribution;
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
>>>>>>> a3254174b043b29760571efb471bbf382a059d22
 */
exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, page = 1 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const results = await PracticeResult.find({ user: userId })
      .populate('practiceExercise', 'question category level difficulty')
      .sort({ completedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await PracticeResult.countDocuments({ user: userId });

    res.status(200).json({
      success: true,
      data: results,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total
      }
    });

  } catch (error) {
    console.error('❌ Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy lịch sử luyện tập',
      error: error.message

    });
  }
};

 
/**
 * @desc    Get practice stats
 * @route   GET /api/practice/stats
 * @access  Private
 */
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalExercises = await PracticeResult.countDocuments({ user: userId });
    const correctAnswers = await PracticeResult.countDocuments({ user: userId, isCorrect: true });
    const accuracy = totalExercises > 0 ? Math.round((correctAnswers / totalExercises) * 100) : 0;

    const totalXP = await PracticeResult.aggregate([
      { $match: { user: userId } }, // ✅ Sửa từ mongoose.Types.ObjectId(userId) thành userId
      { $group: { _id: null, total: { $sum: '$xpEarned' } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalExercises,
        correctAnswers,
        wrongAnswers: totalExercises - correctAnswers,
        accuracy,
        totalXP: totalXP[0]?.total || 0
      }
    });

  } catch (error) {
    console.error('❌ Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thống kê',
      error: error.message
    });
  }
};

