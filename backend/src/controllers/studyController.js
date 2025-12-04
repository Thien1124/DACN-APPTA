const StudySession = require('../models/StudySession');
const StudyProgress = require('../models/StudyProgress');
const Flashcard = require('../models/Flashcard');
const Deck = require('../models/Deck');
const User = require('../models/User');

/**
 * @desc    Start a new study session
 * @route   POST /api/study/sessions/start
 * @access  Private
 */
exports.startStudySession = async (req, res) => {
  try {
    const { deckId, studyMode = 'FLIP', sessionType = 'REVIEW', cardLimit = 20 } = req.body;
    const userId = req.user._id;
    
    // ✅ Enhanced validation logging
     ('📚 Starting study session:', {
      userId,
      deckId,
      studyMode,
      sessionType,
      cardLimit
    });
    
    // ✅ Validate required fields
    if (!deckId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp deckId'
      });
    }
    
    // Validate deck
    const deck = await Deck.findById(deckId);
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy deck'
      });
    }
    
    // ✅ Check for existing active session
    const existingSession = await StudySession.findOne({
      user: userId,
      deck: deckId,
      status: 'IN_PROGRESS'
    });
    
    if (existingSession) {
      // ✅ UNCOMMENT để tự động abandon session cũ
       ('⚠️ Auto-abandoning existing session:', existingSession._id);
      existingSession.status = 'ABANDONED';
      existingSession.endTime = Date.now();
      existingSession.duration = Math.round((existingSession.endTime - existingSession.startTime) / 1000);
      await existingSession.save();
      
      // ❌ Comment dòng return error này
      /*
      return res.status(400).json({
        success: false,
        message: 'Bạn đang có phiên học chưa hoàn thành',
        data: existingSession
      });
      */
    }
    
    // Get cards for this session based on session type
    let flashcards = [];
    let newCardsCount = 0;
    let reviewCardsCount = 0;
    
    if (sessionType === 'LEARN_NEW') {
      // Get new cards that user hasn't studied
      flashcards = await StudyProgress.getNewCards(userId, deckId, cardLimit || 10);
      newCardsCount = flashcards.length;
    } else if (sessionType === 'REVIEW') {
      // ✅ Get cards due for review, OR all cards if no progress yet
      const dueCards = await StudyProgress.getDueCards(userId, deckId);
      
      if (dueCards && dueCards.length > 0) {
        flashcards = dueCards.map(progress => progress.flashcard);
        reviewCardsCount = flashcards.length;
      } else {
        flashcards = await Flashcard.find({ deck: deckId })
          .limit(cardLimit || 20);
        newCardsCount = flashcards.length;
      }
    } else if (sessionType === 'PRACTICE') {
      // Mix of new and review cards
      const newCards = await StudyProgress.getNewCards(userId, deckId, 5);
      const dueCards = await StudyProgress.getDueCards(userId, deckId);
      const reviewCards = dueCards.map(progress => progress.flashcard);
      
      flashcards = [...newCards, ...reviewCards.slice(0, 5)];
      newCardsCount = newCards.length;
      reviewCardsCount = Math.min(5, reviewCards.length);
    } else {
      // TEST mode - get random cards
      flashcards = await Flashcard.find({ deck: deckId })
        .limit(cardLimit || 20);
    }
    
    if (flashcards.length === 0) {
       ('⚠️ No flashcards found for session');
      return res.status(400).json({
        success: false,
        message: 'Không có thẻ nào để học. Hãy thử lại sau!',
        info: {
          newCardsAvailable: await Flashcard.countDocuments({ deck: deckId }),
          reviewCardsAvailable: 0,
          sessionType,
          cardLimit
        }
      });
    }
    
     (`✅ Found ${flashcards.length} flashcards for session`);
    
    // Shuffle cards for better learning
    flashcards = shuffleArray(flashcards);
    
    // Create study session
    const session = await StudySession.create({
      user: userId,
      deck: deckId,
      studyMode: studyMode || 'FLIP',
      sessionType: sessionType || 'LEARN_NEW',
      totalCards: flashcards.length,
      startTime: Date.now()
    });

    // Update deck study count
    deck.studyCount += 1;
    await deck.save();

    res.status(201).json({
      success: true,
      message: 'Phiên học đã được khởi tạo',
      data: {
        session: {
          _id: session._id,
          deckId: session.deck,
          deckTitle: deck.title,
          totalCards: session.totalCards,
          completedCards: 0
        },
        // ✅ ĐẢM BẢO trả về flashcards
        flashcards: flashcards.map(card => ({
          _id: card._id,
          front: card.front,
          back: card.back,
          pronunciation: card.pronunciation,
          partOfSpeech: card.partOfSpeech,
          meanings: card.meanings,
          synonyms: card.synonyms,
          antonyms: card.antonyms,
          collocations: card.collocations,
          imageUrl: card.imageUrl,
          audioUrl: card.audioUrl,
          isStarred: card.isStarred || false
        })),
        stats: {
          newCardsCount,
          reviewCardsCount,
          totalCards: flashcards.length
        }
      }
    });
  } catch (error) {
    console.error('Error starting study session:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể khởi tạo phiên học',
      error: error.message
    });
  }
};

/**
 * @desc    Submit answer for a flashcard
 * @route   POST /api/study/sessions/:sessionId/answer
 * @access  Private
 */
exports.submitAnswer = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { flashcardId, userAnswer, correct, skipped, responseTime, quality } = req.body;
    const userId = req.user._id;
    
    // Find session
    const session = await StudySession.findOne({
      _id: sessionId,
      user: userId,
      status: 'IN_PROGRESS'
    });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phiên học'
      });
    }
    
    // Get flashcard
    const flashcard = await Flashcard.findById(flashcardId);
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy flashcard'
      });
    }
    
    // Add card review to session
    await session.addCardReview({
      flashcard: flashcardId,
      correct,
      skipped,
      userAnswer,
      correctAnswer: flashcard.back,
      responseTime: responseTime || 0,
      quality: quality || (correct ? 4 : 2),
      reviewedAt: Date.now()
    });
    
    // Update or create study progress
    let progress = await StudyProgress.findOne({
      user: userId,
      flashcard: flashcardId
    });
    
    if (!progress) {
      // Create new progress
      progress = await StudyProgress.create({
        user: userId,
        flashcard: flashcardId,
        deck: session.deck,
        lastStudyMode: session.studyMode
      });
    }
    
    // Update progress with spaced repetition algorithm
    if (!skipped) {
      const qualityRating = quality || (correct ? 4 : 2);
      progress.calculateNextReview(qualityRating);
      progress.updateResponseTime(responseTime || 0);
      progress.lastStudyMode = session.studyMode;
      await progress.save();
    }
    
    // Check if session is completed
    const isCompleted = session.completedCards >= session.totalCards;
    
    res.status(200).json({
      success: true,
      message: 'Đã ghi nhận câu trả lời',
      data: {
        session: {
          sessionId: session._id,
          completedCards: session.completedCards,
          totalCards: session.totalCards,
          correctAnswers: session.correctAnswers,
          incorrectAnswers: session.incorrectAnswers,
          streakCount: session.streakCount,
          maxStreak: session.maxStreak,
          isCompleted
        },
        progress: {
          status: progress.status,
          nextReviewDate: progress.nextReviewDate,
          accuracy: progress.accuracy,
          totalReviews: progress.totalReviews
        }
      }
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể ghi nhận câu trả lời',
      error: error.message
    });
  }
};

/**
 * @desc    Complete study session
 * @route   POST /api/study/sessions/:sessionId/complete
 * @access  Private
 */
exports.completeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;
    
    const session = await StudySession.findOne({
      _id: sessionId,
      user: userId
    }).populate('deck', 'title imageUrl');
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phiên học'
      });
    }
    
    if (session.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Phiên học đã được hoàn thành trước đó'
      });
    }
    
    // Complete the session
    await session.completeSession();
    
    // Update user XP and stats
    const user = await User.findById(userId);
    if (user) {
      // Add XP (nếu User model có field này)
      if (user.xp !== undefined) {
        user.xp = (user.xp || 0) + session.xpEarned;
      }
      
      // Update streak (nếu có)
      if (user.currentStreak !== undefined) {
        const today = new Date().setHours(0, 0, 0, 0);
        const lastStudy = user.lastStudyDate ? new Date(user.lastStudyDate).setHours(0, 0, 0, 0) : null;
        
        if (lastStudy === today) {
          // Already studied today, keep streak
        } else if (lastStudy === today - 86400000) {
          // Studied yesterday, increment streak
          user.currentStreak = (user.currentStreak || 0) + 1;
        } else {
          // Streak broken, restart
          user.currentStreak = 1;
        }
        
        user.longestStreak = Math.max(user.longestStreak || 0, user.currentStreak);
        user.lastStudyDate = new Date();
      }
      
      await user.save();
    }
    
    // Get updated stats
    const stats = await StudySession.getUserStats(userId, session.deck._id);
    
    res.status(200).json({
      success: true,
      message: 'Chúc mừng! Bạn đã hoàn thành phiên học',
      data: {
        session: {
          sessionId: session._id,
          deck: {
            id: session.deck._id,
            title: session.deck.title,
            imageUrl: session.deck.imageUrl
          },
          studyMode: session.studyMode,
          sessionType: session.sessionType,
          totalCards: session.totalCards,
          completedCards: session.completedCards,
          correctAnswers: session.correctAnswers,
          incorrectAnswers: session.incorrectAnswers,
          skippedCards: session.skippedCards,
          score: session.score,
          duration: session.duration,
          xpEarned: session.xpEarned,
          maxStreak: session.maxStreak,
          startTime: session.startTime,
          endTime: session.endTime
        },
        deckStats: stats
      }
    });
  } catch (error) {
    console.error('Error completing session:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể hoàn thành phiên học',
      error: error.message
    });
  }
};

/**
 * @desc    Get user's study progress for a deck
 * @route   GET /api/study/progress/:deckId
 * @access  Private
 */
exports.getDeckProgress = async (req, res) => {
  try {
    const { deckId } = req.params;
    const userId = req.user._id;
    
    // Get all progress for this deck
    const progressList = await StudyProgress.find({
      user: userId,
      deck: deckId
    }).populate('flashcard', 'front back');
    
    // Calculate statistics
    const stats = {
      totalCards: await Flashcard.countDocuments({ deck: deckId }),
      studiedCards: progressList.length,
      newCards: 0,
      learningCards: 0,
      reviewingCards: 0,
      masteredCards: 0,
      dueCards: 0
    };
    
    const now = new Date();
    progressList.forEach(progress => {
      if (progress.status === 'NEW') stats.newCards++;
      else if (progress.status === 'LEARNING') stats.learningCards++;
      else if (progress.status === 'REVIEWING') stats.reviewingCards++;
      else if (progress.status === 'MASTERED') stats.masteredCards++;
      
      if (progress.nextReviewDate <= now) {
        stats.dueCards++;
      }
    });
    
    stats.unstudiedCards = stats.totalCards - stats.studiedCards;
    stats.progressPercentage = stats.totalCards > 0 
      ? Math.round((stats.studiedCards / stats.totalCards) * 100)
      : 0;
    
    res.status(200).json({
      success: true,
      data: {
        stats,
        recentProgress: progressList.slice(0, 10)
      }
    });
  } catch (error) {
    console.error('Error getting deck progress:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin tiến độ',
      error: error.message
    });
  }
};

/**
 * @desc    Get study statistics
 * @route   GET /api/study/stats
 * @access  Private
 */
exports.getStudyStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { deckId, period } = req.query;
    
    // Get overall stats
    const stats = await StudySession.getUserStats(userId, deckId || null);
    
    // Get recent sessions
    const recentSessions = await StudySession.find({
      user: userId,
      ...(deckId && { deck: deckId }),
      status: 'COMPLETED'
    })
      .populate('deck', 'title imageUrl')
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Get cards due for review
    const dueCards = await StudyProgress.getDueCards(userId, deckId || null);
    
    res.status(200).json({
      success: true,
      data: {
        stats,
        recentSessions,
        dueCardsCount: dueCards.length
      }
    });
  } catch (error) {
    console.error('Error getting study stats:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thống kê học tập',
      error: error.message
    });
  }
};

/**
 * @desc    Get session details
 * @route   GET /api/study/sessions/:sessionId
 * @access  Private
 */
exports.getSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;
    
    const session = await StudySession.findOne({
      _id: sessionId,
      user: userId
    })
      .populate('deck', 'title description imageUrl')
      .populate('cardReviews.flashcard', 'front back example');
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phiên học'
      });
    }
    
    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error getting session details:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin phiên học',
      error: error.message
    });
  }
};

/**
 * @desc    Abandon study session
 * @route   POST /api/study/sessions/:sessionId/abandon
 * @access  Private
 */
exports.abandonSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;
    
    const session = await StudySession.findOne({
      _id: sessionId,
      user: userId,
      status: 'IN_PROGRESS'
    });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phiên học đang hoạt động'
      });
    }
    
    session.status = 'ABANDONED';
    session.endTime = Date.now();
    session.duration = Math.round((session.endTime - session.startTime) / 1000);
    await session.save();
    
    res.status(200).json({
      success: true,
      message: 'Phiên học đã được hủy',
      data: session
    });
  } catch (error) {
    console.error('Error abandoning session:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể hủy phiên học',
      error: error.message
    });
  }
};

/**
 * @desc    Clean up abandoned sessions
 * @route   POST /api/study/sessions/cleanup
 * @access  Private/Admin
 */
exports.cleanupSessions = async (req, res) => {
  try {
    const { userId, olderThan = 24 } = req.body; // olderThan in hours
    
    const cutoffTime = new Date(Date.now() - olderThan * 60 * 60 * 1000);
    
    const result = await StudySession.updateMany(
      {
        ...(userId && { user: userId }),
        status: 'IN_PROGRESS',
        startTime: { $lt: cutoffTime }
      },
      {
        $set: {
          status: 'ABANDONED',
          endTime: Date.now()
        }
      }
    );
    
    res.status(200).json({
      success: true,
      message: `Đã cleanup ${result.modifiedCount} sessions`,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Cleanup failed',
      error: error.message
    });
  }
};

// Helper function to shuffle array
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

module.exports = exports;
