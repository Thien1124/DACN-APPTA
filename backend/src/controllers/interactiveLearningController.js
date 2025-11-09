const interactiveLearningService = require('../services/interactiveLearningService');
const Deck = require('../models/Deck');

/**
 * ===============================================
 * IMAGE-WORD MATCHING ENDPOINTS
 * ===============================================
 */

/**
 * Start image-word matching game
 * POST /api/interactive/image-match/:deckId/start
 */
exports.startImageMatch = async (req, res) => {
  try {
    const { deckId } = req.params;
    const { count = 10, difficulty = 'medium' } = req.body;
    
    // Verify deck access
    const deck = await Deck.findById(deckId);
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck không tồn tại'
      });
    }
    
    if (deck.createdBy && deck.createdBy.toString() !== req.user._id.toString() && !deck.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập deck này'
      });
    }
    
    const game = await interactiveLearningService.generateImageMatchGame(deckId, {
      count: parseInt(count),
      difficulty
    });
    
    res.json({
      success: true,
      data: game
    });
  } catch (error) {
    console.error('Start image match error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi khởi tạo game'
    });
  }
};

/**
 * Submit image-word matching answers
 * POST /api/interactive/image-match/:deckId/submit
 */
exports.submitImageMatch = async (req, res) => {
  try {
    const { deckId } = req.params;
    const { answers } = req.body;
    
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu answers không hợp lệ'
      });
    }
    
    const result = await interactiveLearningService.submitImageMatch(
      req.user._id,
      deckId,
      answers
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Submit image match error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi nộp bài'
    });
  }
};

/**
 * ===============================================
 * MULTIPLE CHOICE ENDPOINTS
 * ===============================================
 */

/**
 * Start multiple choice quiz
 * POST /api/interactive/multiple-choice/:deckId/start
 */
exports.startMultipleChoice = async (req, res) => {
  try {
    const { deckId } = req.params;
    const { 
      count = 10, 
      questionType = 'word-to-meaning', 
      difficulty = 'medium' 
    } = req.body;
    
    // Verify deck access
    const deck = await Deck.findById(deckId);
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck không tồn tại'
      });
    }
    
    if (deck.createdBy && deck.createdBy.toString() !== req.user._id.toString() && !deck.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập deck này'
      });
    }
    
    const quiz = await interactiveLearningService.generateMultipleChoiceQuiz(deckId, {
      count: parseInt(count),
      questionType,
      difficulty
    });
    
    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Start multiple choice error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi khởi tạo quiz'
    });
  }
};

/**
 * Submit multiple choice answers
 * POST /api/interactive/multiple-choice/:deckId/submit
 */
exports.submitMultipleChoice = async (req, res) => {
  try {
    const { deckId } = req.params;
    const { questions } = req.body;
    
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu questions không hợp lệ'
      });
    }
    
    const result = await interactiveLearningService.submitMultipleChoice(
      req.user._id,
      deckId,
      questions
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Submit multiple choice error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi nộp bài'
    });
  }
};

/**
 * ===============================================
 * MATCHING PAIRS ENDPOINTS
 * ===============================================
 */

/**
 * Start matching pairs game
 * POST /api/interactive/matching/:deckId/start
 */
exports.startMatching = async (req, res) => {
  try {
    const { deckId } = req.params;
    const { 
      count = 6, 
      matchType = 'word-meaning', 
      difficulty = 'medium' 
    } = req.body;
    
    // Verify deck access
    const deck = await Deck.findById(deckId);
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck không tồn tại'
      });
    }
    
    if (deck.createdBy && deck.createdBy.toString() !== req.user._id.toString() && !deck.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập deck này'
      });
    }
    
    const game = await interactiveLearningService.generateMatchingGame(deckId, {
      count: parseInt(count),
      matchType,
      difficulty
    });
    
    res.json({
      success: true,
      data: game
    });
  } catch (error) {
    console.error('Start matching error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi khởi tạo game'
    });
  }
};

/**
 * Submit matching pairs answers
 * POST /api/interactive/matching/:deckId/submit
 */
exports.submitMatching = async (req, res) => {
  try {
    const { deckId } = req.params;
    const { pairs, matches, timeSpent } = req.body;
    
    if (!pairs || !matches) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ'
      });
    }
    
    const result = await interactiveLearningService.submitMatching(
      req.user._id,
      deckId,
      { pairs, matches, timeSpent }
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Submit matching error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi nộp bài'
    });
  }
};

/**
 * ===============================================
 * SPELLING BEE ENDPOINTS
 * ===============================================
 */

/**
 * Start spelling bee game
 * POST /api/interactive/spelling-bee/:deckId/start
 */
exports.startSpellingBee = async (req, res) => {
  try {
    const { deckId } = req.params;
    const { count = 10, difficulty = 'medium' } = req.body;
    
    // Verify deck access
    const deck = await Deck.findById(deckId);
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck không tồn tại'
      });
    }
    
    if (deck.createdBy && deck.createdBy.toString() !== req.user._id.toString() && !deck.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập deck này'
      });
    }
    
    const game = await interactiveLearningService.generateSpellingBee(deckId, {
      count: parseInt(count),
      difficulty
    });
    
    res.json({
      success: true,
      data: game
    });
  } catch (error) {
    console.error('Start spelling bee error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi khởi tạo game'
    });
  }
};

/**
 * Check spelling
 * POST /api/interactive/spelling-bee/check
 */
exports.checkSpelling = async (req, res) => {
  try {
    const { flashcardId, userSpelling } = req.body;
    
    if (!flashcardId || !userSpelling) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin flashcardId hoặc userSpelling'
      });
    }
    
    const result = await interactiveLearningService.checkSpelling(flashcardId, userSpelling);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Check spelling error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi kiểm tra spelling'
    });
  }
};

/**
 * Submit spelling bee answers
 * POST /api/interactive/spelling-bee/:deckId/submit
 */
exports.submitSpellingBee = async (req, res) => {
  try {
    const { deckId } = req.params;
    const { words } = req.body;
    
    if (!words || !Array.isArray(words)) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu words không hợp lệ'
      });
    }
    
    const result = await interactiveLearningService.submitSpellingBee(
      req.user._id,
      deckId,
      words
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Submit spelling bee error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi nộp bài'
    });
  }
};

/**
 * ===============================================
 * STATISTICS & HISTORY ENDPOINTS
 * ===============================================
 */

/**
 * Get user statistics
 * GET /api/interactive/stats
 */
exports.getStats = async (req, res) => {
  try {
    const { deckId } = req.query;
    
    const stats = await interactiveLearningService.getUserStats(req.user._id, {
      deckId
    });
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải thống kê'
    });
  }
};

/**
 * Get game history (generic)
 * GET /api/interactive/history/:gameType
 */
exports.getHistory = async (req, res) => {
  try {
    const { gameType } = req.params;
    const { deckId, limit = 20, page = 1 } = req.query;
    
    let Model;
    const { 
      ImageMatchAttempt, 
      MultipleChoiceAttempt, 
      MatchingAttempt, 
      SpellingBeeAttempt 
    } = require('../models/InteractiveLearning');
    
    switch (gameType) {
      case 'image-match':
        Model = ImageMatchAttempt;
        break;
      case 'multiple-choice':
        Model = MultipleChoiceAttempt;
        break;
      case 'matching':
        Model = MatchingAttempt;
        break;
      case 'spelling-bee':
        Model = SpellingBeeAttempt;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Game type không hợp lệ'
        });
    }
    
    const query = { user: req.user._id };
    if (deckId) query.deck = deckId;
    
    const skip = (page - 1) * limit;
    
    const [history, total] = await Promise.all([
      Model.find(query)
        .sort({ completedAt: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .populate('deck', 'title description')
        .lean(),
      Model.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: {
        history,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải lịch sử'
    });
  }
};

/**
 * Get attempt details
 * GET /api/interactive/attempt/:gameType/:attemptId
 */
exports.getAttemptDetail = async (req, res) => {
  try {
    const { gameType, attemptId } = req.params;
    
    let Model;
    const { 
      ImageMatchAttempt, 
      MultipleChoiceAttempt, 
      MatchingAttempt, 
      SpellingBeeAttempt 
    } = require('../models/InteractiveLearning');
    
    switch (gameType) {
      case 'image-match':
        Model = ImageMatchAttempt;
        break;
      case 'multiple-choice':
        Model = MultipleChoiceAttempt;
        break;
      case 'matching':
        Model = MatchingAttempt;
        break;
      case 'spelling-bee':
        Model = SpellingBeeAttempt;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Game type không hợp lệ'
        });
    }
    
    const attempt = await Model.findOne({
      _id: attemptId,
      user: req.user._id
    })
      .populate('deck', 'title description')
      .populate('flashcards', 'front back imageUrl');
    
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy attempt'
      });
    }
    
    res.json({
      success: true,
      data: attempt
    });
  } catch (error) {
    console.error('Get attempt detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải chi tiết attempt'
    });
  }
};
