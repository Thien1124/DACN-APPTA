const GrammarQuiz = require('../models/GrammarQuiz');
const GrammarQuizResult = require('../models/GrammarQuizResult');
const Flashcard = require('../models/Flashcard');
const User = require('../models/User');
const Heart = require('../models/Heart');

/**
 * ==========================================
 * TASK 17: GRAMMAR QUIZ SYSTEM - Mini-quiz ngữ pháp gắn với flashcard
 * ==========================================
 * 
 * API Test Endpoints:
 * 1. GET /api/grammar-quiz/flashcard/:flashcardId - Lấy quiz của một flashcard
 * 2. GET /api/grammar-quiz/quizzes - Lấy danh sách quiz (theo topic, level)
 * 3. GET /api/grammar-quiz/quizzes/:id - Lấy chi tiết một quiz
 * 4. POST /api/grammar-quiz/quizzes/:id/submit - Nộp đáp án quiz
 * 5. GET /api/grammar-quiz/history - Lịch sử làm quiz
 */

/**
 * Lấy quiz gắn với một flashcard
 * 
 * API Test:
 * GET /api/grammar-quiz/flashcard/:flashcardId
 * Headers: Authorization: Bearer {token}
 * 
 * Response:
 * {
 *   "success": true,
 *   "flashcard": {
 *     "_id": "...",
 *     "front": "happy",
 *     "back": "vui vẻ"
 *   },
 *   "quizzes": [
 *     {
 *       "_id": "...",
 *       "grammarTopic": "word-class",
 *       "question": "What part of speech is 'happy'?",
 *       "sentence": "She is very ___ today",
 *       "questionType": "multiple-choice",
 *       "options": [
 *         { "text": "adjective", "isCorrect": false },
 *         { "text": "noun", "isCorrect": false }
 *       ],
 *       "points": 10
 *     }
 *   ]
 * }
 */
exports.getQuizByFlashcard = async (req, res) => {
  try {
    const { flashcardId } = req.params;

    // Kiểm tra flashcard có tồn tại không
    const flashcard = await Flashcard.findById(flashcardId);

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy flashcard'
      });
    }

    // Lấy các quiz gắn với flashcard này
    const quizzes = await GrammarQuiz.find({
      flashcard: flashcardId,
      isActive: true
    }).select('-correctAnswer -explanation -grammarExplanation'); // Ẩn đáp án

    // Ẩn isCorrect trong options
    const quizzesData = quizzes.map(quiz => {
      const quizObj = quiz.toObject();
      if (quizObj.options) {
        quizObj.options = quizObj.options.map(opt => ({
          text: opt.text
        }));
      }
      return quizObj;
    });

    return res.status(200).json({
      success: true,
      flashcard: {
        _id: flashcard._id,
        front: flashcard.front,
        back: flashcard.back,
        example: flashcard.example
      },
      quizzes: quizzesData
    });

  } catch (error) {
    console.error('Lỗi khi lấy quiz của flashcard:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

/**
 * Lấy danh sách quiz ngữ pháp
 * 
 * API Test:
 * GET /api/grammar-quiz/quizzes?grammarTopic=word-class&level=B1&limit=10
 * Headers: Authorization: Bearer {token}
 * 
 * Query Params:
 * - grammarTopic: word-class | tense | article | ... (optional)
 * - level: A1 | A2 | B1 | B2 | C1 | C2 (optional)
 * - difficulty: easy | medium | hard (optional)
 * - flashcardId: ID của flashcard (optional) - chỉ lấy quiz của flashcard này
 * - limit: số lượng (default: 10)
 * - page: số trang (default: 1)
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": [...],
 *   "pagination": {...}
 * }
 */
exports.getQuizzes = async (req, res) => {
  try {
    const { grammarTopic, level, difficulty, flashcardId, limit = 10, page = 1 } = req.query;

    const query = { isActive: true };

    if (grammarTopic) {
      query.grammarTopic = grammarTopic;
    }

    if (level) {
      query.level = level;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (flashcardId) {
      query.flashcard = flashcardId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const quizzes = await GrammarQuiz.find(query)
      .populate('flashcard', 'front back')
      .select('-correctAnswer -explanation -grammarExplanation') // Ẩn đáp án
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    // Ẩn isCorrect trong options
    const quizzesData = quizzes.map(quiz => {
      const quizObj = quiz.toObject();
      if (quizObj.options) {
        quizObj.options = quizObj.options.map(opt => ({
          text: opt.text
        }));
      }
      return quizObj;
    });

    const totalItems = await GrammarQuiz.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limitNum);

    return res.status(200).json({
      success: true,
      data: quizzesData,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems,
        itemsPerPage: limitNum
      }
    });

  } catch (error) {
    console.error('Lỗi khi lấy danh sách quiz:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

/**
 * Lấy chi tiết một quiz
 * 
 * API Test:
 * GET /api/grammar-quiz/quizzes/:id
 * Headers: Authorization: Bearer {token}
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "_id": "...",
 *     "flashcard": {
 *       "_id": "...",
 *       "front": "happy",
 *       "back": "vui vẻ"
 *     },
 *     "grammarTopic": "word-class",
 *     "question": "What part of speech is 'happy'?",
 *     "sentence": "She is very ___ today",
 *     "questionType": "multiple-choice",
 *     "options": [
 *       { "text": "adjective" },
 *       { "text": "noun" }
 *     ],
 *     "points": 10
 *   }
 * }
 */
exports.getQuizById = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await GrammarQuiz.findById(id)
      .populate('flashcard', 'front back example');

    if (!quiz || !quiz.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy quiz'
      });
    }

    // Tạo bản copy và ẩn đáp án
    const quizData = quiz.toObject();
    delete quizData.correctAnswer;
    delete quizData.explanation;
    delete quizData.grammarExplanation;
    delete quizData.grammarRule;
    delete quizData.commonMistakes;

    // Ẩn isCorrect trong options
    if (quizData.options) {
      quizData.options = quizData.options.map(opt => ({
        text: opt.text
      }));
    }

    return res.status(200).json({
      success: true,
      data: quizData
    });

  } catch (error) {
    console.error('Lỗi khi lấy chi tiết quiz:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

/**
 * Nộp đáp án quiz
 * 
 * API Test:
 * POST /api/grammar-quiz/quizzes/:id/submit
 * Headers: Authorization: Bearer {token}
 * Content-Type: application/json
 * 
 * Body:
 * {
 *   "userAnswer": "adjective",
 *   "timeSpent": 20  // seconds (optional)
 * }
 * 
 * Response Success (đúng):
 * {
 *   "success": true,
 *   "isCorrect": true,
 *   "correctAnswer": "adjective",
 *   "grammarExplanation": "'Happy' là tính từ (adjective) mô tả cảm xúc",
 *   "grammarRule": "Tính từ thường đứng sau động từ 'be' hoặc trước danh từ",
 *   "examples": [
 *     {
 *       "sentence": "She is happy",
 *       "explanation": "Happy là tính từ đứng sau 'is'"
 *     }
 *   ],
 *   "pointsEarned": 10,
 *   "xpEarned": 10,
 *   "userStats": {
 *     "xp": { "total": 270, "level": 2 }
 *   }
 * }
 * 
 * Response Error (sai):
 * {
 *   "success": true,
 *   "isCorrect": false,
 *   "correctAnswer": "adjective",
 *   "userAnswer": "noun",
 *   "grammarExplanation": "'Happy' là tính từ (adjective), không phải danh từ (noun)",
 *   "commonMistakes": [
 *     {
 *       "wrongAnswer": "noun",
 *       "explanation": "'Happy' không phải danh từ",
 *       "grammarRule": "Danh từ là từ chỉ người, vật, sự việc"
 *     }
 *   ],
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

    // Lấy quiz
    const quiz = await GrammarQuiz.findById(id)
      .populate('flashcard');

    if (!quiz || !quiz.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy quiz'
      });
    }

    // Kiểm tra đáp án
    const isCorrect = checkAnswer(userAnswer, quiz.correctAnswer);
    const pointsEarned = isCorrect ? quiz.points : 0;
    const xpEarned = isCorrect ? quiz.points : 0; // 1 point = 1 XP

    // Lưu kết quả
    const result = await GrammarQuizResult.create({
      user: userId,
      grammarQuiz: id,
      flashcard: quiz.flashcard._id,
      userAnswer,
      correctAnswer: quiz.correctAnswer,
      isCorrect,
      timeSpent,
      pointsEarned,
      xpEarned
    });

    // Cập nhật thống kê quiz
    quiz.stats.totalAttempts += 1;
    if (isCorrect) {
      quiz.stats.correctAttempts += 1;
    }
    if (timeSpent > 0) {
      const totalTime = quiz.stats.averageTime * (quiz.stats.totalAttempts - 1) + timeSpent;
      quiz.stats.averageTime = Math.round(totalTime / quiz.stats.totalAttempts);
    }
    await quiz.save();

    // Nếu đúng: cập nhật XP, streak
    if (isCorrect) {
      const user = await User.findById(userId);
      
      // Cập nhật XP
      user.xp.total += xpEarned;
      const newLevel = 1 + Math.floor(Math.sqrt(user.xp.total / 100));
      user.xp.level = newLevel;
      await user.save();

      // Cập nhật streak
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
      correctAnswer: quiz.correctAnswer,
      userAnswer,
      grammarExplanation: quiz.grammarExplanation,
      pointsEarned,
      xpEarned
    };

    // Thêm grammar rule nếu có
    if (quiz.grammarRule) {
      response.grammarRule = quiz.grammarRule;
    }

    // Thêm examples nếu có
    if (quiz.examples && quiz.examples.length > 0) {
      response.examples = quiz.examples;
    }

    // Nếu sai, thêm common mistakes
    if (!isCorrect && quiz.commonMistakes && quiz.commonMistakes.length > 0) {
      // Tìm mistake liên quan đến đáp án sai của user
      const relevantMistake = quiz.commonMistakes.find(m => 
        m.wrongAnswer.toString().toLowerCase() === userAnswer.toString().toLowerCase()
      );
      if (relevantMistake) {
        response.commonMistake = relevantMistake;
      } else {
        response.commonMistakes = quiz.commonMistakes.slice(0, 2); // Lấy 2 mistake đầu
      }
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
    console.error('Lỗi khi nộp đáp án quiz:', error);
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
 * Lấy lịch sử làm quiz
 * 
 * API Test:
 * GET /api/grammar-quiz/history?limit=20
 * Headers: Authorization: Bearer {token}
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "_id": "...",
 *       "grammarQuiz": {
 *         "_id": "...",
 *         "grammarTopic": "word-class",
 *         "question": "..."
 *       },
 *       "flashcard": {
 *         "_id": "...",
 *         "front": "happy",
 *         "back": "vui vẻ"
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

    const results = await GrammarQuizResult.find({ user: userId })
      .populate('grammarQuiz', 'grammarTopic question points')
      .populate('flashcard', 'front back')
      .sort({ completedAt: -1 })
      .limit(limitNum)
      .skip(skip);

    const totalItems = await GrammarQuizResult.countDocuments({ user: userId });
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

