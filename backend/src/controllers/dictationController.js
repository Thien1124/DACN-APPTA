const dictationService = require('../services/dictationService');
const Flashcard = require('../models/Flashcard');
const Deck = require('../models/Deck');

/**
 * Get dictation exercise for a flashcard
 * GET /api/dictation/exercise/:flashcardId
 */
exports.getDictationExercise = async (req, res) => {
  try {
    const { flashcardId } = req.params;
    
    // Verify flashcard exists and user has access
    const flashcard = await Flashcard.findById(flashcardId).populate('deck');
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard không tồn tại'
      });
    }
    
    // Check if flashcard has a deck
    if (!flashcard.deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck không tồn tại'
      });
    }
    
    // Check if user has access to the deck
    const deck = flashcard.deck;
    if (deck.createdBy && deck.createdBy.toString() !== req.user._id.toString() && !deck.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập deck này'
      });
    }
    
    const exercise = await dictationService.getDictationExercise(flashcardId);
    
    res.json({
      success: true,
      data: exercise
    });
  } catch (error) {
    console.error('Get dictation exercise error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải bài tập dictation: ' + error.message
    });
  }
};

/**
 * Submit dictation answer
 * POST /api/dictation/submit/:flashcardId
 * Body: { userAnswer, playCount, timeSpent, audioSpeed }
 */
exports.submitDictation = async (req, res) => {
  try {
    const { flashcardId } = req.params;
    const { userAnswer, playCount = 1, timeSpent = 0, audioSpeed = 1.0 } = req.body;
    
    if (!userAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập câu trả lời'
      });
    }
    
    // Verify flashcard and access
    const flashcard = await Flashcard.findById(flashcardId).populate('deck');
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard không tồn tại'
      });
    }
    
    if (!flashcard.deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck không tồn tại'
      });
    }
    
    const deck = flashcard.deck;
    if (deck.createdBy && deck.createdBy.toString() !== req.user._id.toString() && !deck.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập deck này'
      });
    }
    
    // Validate answer
    const validationResult = await dictationService.validateDictationAnswer(
      flashcardId,
      userAnswer,
      { playCount, timeSpent, audioSpeed }
    );
    
    // Save attempt
    const attempt = await dictationService.saveDictationAttempt(
      req.user._id,
      flashcardId,
      flashcard.deck,
      validationResult
    );
    
    res.json({
      success: true,
      data: {
        attempt: {
          _id: attempt._id,
          accuracy: attempt.accuracy,
          characterAccuracy: attempt.characterAccuracy,
          wordAccuracy: attempt.wordAccuracy,
          passed: attempt.passed,
          mistakes: attempt.mistakes,
          correctAnswer: attempt.correctAnswer,
          userAnswer: attempt.userAnswer,
          difficultyLevel: attempt.difficultyLevel,
          playCount: attempt.playCount,
          timeSpent: attempt.timeSpent
        },
        feedback: generateDictationFeedback(validationResult)
      }
    });
  } catch (error) {
    console.error('Submit dictation error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi nộp bài dictation: ' + error.message
    });
  }
};

/**
 * Generate feedback message based on accuracy
 */
function generateDictationFeedback(result) {
  const { accuracy, passed, mistakes } = result;
  
  let message = '';
  let tips = [];
  
  if (accuracy >= 95) {
    message = 'Xuất sắc! Khả năng nghe của bạn rất tốt!';
  } else if (accuracy >= 85) {
    message = 'Tốt lắm! Chỉ còn vài lỗi nhỏ.';
  } else if (accuracy >= 70) {
    message = 'Khá tốt! Tiếp tục luyện tập.';
    tips.push('Hãy nghe kỹ từng từ một');
  } else if (accuracy >= 50) {
    message = 'Cần cố gắng thêm. Nghe lại nhiều lần nếu cần.';
    tips.push('Nghe chậm lại (0.75x) để dễ nghe hơn');
    tips.push('Tập trung vào từng câu');
  } else {
    message = 'Hãy luyện tập thường xuyên hơn để cải thiện.';
    tips.push('Bắt đầu với các câu đơn giản hơn');
    tips.push('Nghe từng từ một, không nghe cả câu');
    tips.push('Sử dụng tốc độ chậm (0.5x)');
  }
  
  // Add specific tips based on mistake types
  const mistakeTypes = [...new Set(mistakes.map(m => m.type))];
  
  if (mistakeTypes.includes('missing')) {
    tips.push('Bạn bỏ sót một số từ. Hãy nghe kỹ hơn.');
  }
  if (mistakeTypes.includes('extra')) {
    tips.push('Bạn thêm từ không có trong câu gốc.');
  }
  if (mistakeTypes.includes('typo')) {
    tips.push('Kiểm tra lại chính tả của các từ.');
  }
  
  return {
    message,
    tips,
    mistakeCount: mistakes.length
  };
}

/**
 * Get dictation history
 * GET /api/dictation/history
 */
exports.getDictationHistory = async (req, res) => {
  try {
    const { deckId, page = 1, limit = 20, sortBy = 'completedAt', sortOrder = 'desc' } = req.query;
    
    const skip = (page - 1) * limit;
    
    const history = await dictationService.getDictationHistory(req.user._id, {
      deckId,
      limit: parseInt(limit),
      skip,
      sortBy,
      sortOrder
    });
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Get dictation history error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải lịch sử dictation: ' + error.message
    });
  }
};

/**
 * Get dictation statistics
 * GET /api/dictation/stats
 */
exports.getDictationStats = async (req, res) => {
  try {
    const { deckId, startDate, endDate } = req.query;
    
    const stats = await dictationService.getUserDictationStats(req.user._id, {
      deckId,
      startDate,
      endDate
    });
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get dictation stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải thống kê dictation: ' + error.message
    });
  }
};

/**
 * Get dictation attempt detail
 * GET /api/dictation/attempt/:attemptId
 */
exports.getDictationAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    
    const attempt = await require('../models/DictationAttempt')
      .findOne({ _id: attemptId, user: req.user._id })
      .populate('flashcard', 'front back audioUrl example')
      .populate('deck', 'name');
    
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài làm'
      });
    }
    
    res.json({
      success: true,
      data: attempt
    });
  } catch (error) {
    console.error('Get dictation attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải chi tiết bài làm: ' + error.message
    });
  }
};

/**
 * Get batch of dictation exercises for a deck
 * GET /api/dictation/deck/:deckId/exercises
 */
exports.getDeckDictationExercises = async (req, res) => {
  try {
    const { deckId } = req.params;
    const { limit = 10 } = req.query;
    
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
    
    // Get flashcards with audio
    const flashcards = await Flashcard.find({
      deck: deckId,
      audioUrl: { $exists: true, $ne: null }
    })
      .limit(parseInt(limit))
      .select('_id front audioUrl example pronunciation ipa');
    
    const exercises = flashcards.map(fc => ({
      flashcardId: fc._id,
      audioUrl: fc.audioUrl,
      example: fc.example,
      pronunciation: fc.pronunciation,
      ipa: fc.ipa,
      hints: {
        wordCount: fc.front.split(/\s+/).length,
        charCount: fc.front.length,
        firstLetter: fc.front.charAt(0).toLowerCase()
      }
    }));
    
    res.json({
      success: true,
      data: {
        deckId,
        deckName: deck.name || deck.title,
        exercises,
        total: exercises.length
      }
    });
  } catch (error) {
    console.error('Get deck dictation exercises error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải bài tập dictation: ' + error.message
    });
  }
};
