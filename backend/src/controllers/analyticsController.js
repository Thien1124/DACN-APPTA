const mongoose = require('mongoose');
const StudyProgress = require('../models/StudyProgress');
const PracticeResult = require('../models/PracticeResult');
const GrammarQuizResult = require('../models/GrammarQuizResult');
const Flashcard = require('../models/Flashcard');
const SupplementaryQuiz = require('../models/SupplementaryQuiz');

/**
 * ==========================================
 * TASK 18 & 19: PERSONAL ANALYTICS & RECOMMENDATIONS
 * ==========================================
 * 
 * Endpoints:
 * - GET  /api/analytics/errors/summary         (Tóm tắt lỗi cá nhân)
 * - GET  /api/analytics/next-best-card         (Đề xuất thẻ tiếp theo)
 * - POST /api/analytics/weak-quiz/generate     (Tạo quiz phụ từ các thẻ hay sai)
 */

/**
 * Tóm tắt lỗi cá nhân từ nhiều nguồn (30 ngày gần nhất)
 * 
 * API Test:
 * GET /api/analytics/errors/summary?deckId=...&days=30&limit=10
 * Headers: Authorization: Bearer {token}
 */
exports.getErrorSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { deckId, days = 30, limit = 10 } = req.query;

    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    // 1) Lỗi trên từng flashcard từ StudyProgress (accuracy thấp)
    const progressMatch = {
      user: new mongoose.Types.ObjectId(userId),
      updatedAt: { $gte: since }
    };
    if (deckId) progressMatch.deck = new mongoose.Types.ObjectId(deckId);

    const progressAgg = await StudyProgress.aggregate([
      { $match: progressMatch },
      {
        $project: {
          flashcard: 1,
          deck: 1,
          accuracy: 1,
          totalReviews: 1,
          incorrectCount: 1,
          averageResponseTime: 1
        }
      },
      {
        $addFields: {
          errorRate: {
            $cond: [
              { $gt: ['$totalReviews', 0] },
              { $subtract: [100, '$accuracy'] },
              0
            ]
          }
        }
      },
      { $sort: { errorRate: -1, incorrectCount: -1, averageResponseTime: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // 2) Lỗi gần đây từ PracticeResult
    const practiceAgg = await PracticeResult.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), completedAt: { $gte: since }, isCorrect: false } },
      {
        $group: {
          _id: '$practiceExercise',
          wrongAttempts: { $sum: 1 },
          lastWrongAt: { $max: '$completedAt' }
        }
      },
      { $sort: { wrongAttempts: -1, lastWrongAt: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // 3) Lỗi gần đây từ GrammarQuizResult
    const grammarAgg = await GrammarQuizResult.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), completedAt: { $gte: since }, isCorrect: false } },
      {
        $group: {
          _id: '$grammarQuiz',
          wrongAttempts: { $sum: 1 },
          lastWrongAt: { $max: '$completedAt' }
        }
      },
      { $sort: { wrongAttempts: -1, lastWrongAt: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Lấy thông tin flashcard cho StudyProgress summary
    const flashcardIds = progressAgg.map(p => p.flashcard);
    const flashcards = await Flashcard.find({ _id: { $in: flashcardIds } }).select('front back deck');
    const flashcardMap = new Map(flashcards.map(f => [f._id.toString(), f]));

    const progressSummary = progressAgg.map(p => ({
      flashcard: flashcardMap.get(p.flashcard.toString()),
      errorRate: p.errorRate,
      incorrectCount: p.incorrectCount,
      totalReviews: p.totalReviews,
      averageResponseTime: p.averageResponseTime
    }));

    return res.status(200).json({
      success: true,
      since,
      progressSummary,
      practiceSummary: practiceAgg,
      grammarSummary: grammarAgg
    });
  } catch (error) {
    console.error('Lỗi khi lấy error summary:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * Đề xuất thẻ tiếp theo (Next-Best-Card)
 * 
 * Ưu tiên:
 * - Due for review (StudyProgress.nextReviewDate <= now)
 * - Accuracy thấp, incorrectCount cao
 * - Thời gian phản hồi chậm
 * - Gần đây trả lời sai trong Practice/Grammar
 * 
 * API Test:
 * GET /api/analytics/next-best-card?deckId=...&fallbackNew=1
 */
exports.getNextBestCard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { deckId, fallbackNew = 1 } = req.query;

    // 1) Lấy các thẻ đến hạn review
    const dueQuery = { user: userId, nextReviewDate: { $lte: new Date() } };
    if (deckId) dueQuery.deck = deckId;

    const dueItems = await StudyProgress.find(dueQuery)
      .select('flashcard accuracy incorrectCount averageResponseTime nextReviewDate')
      .populate('flashcard', 'front back deck');

    // 2) Tính điểm ưu tiên
    // score = w1*due + w2*errorRate + w3*incorrectCount + w4*avgResp + w5*recentWrong
    const weights = { w1: 5, w2: 3, w3: 2, w4: 1.5, w5: 2.5 };
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Lấy bản đồ các ref sai gần đây từ Practice/Grammar
    const [recentPracticeWrong, recentGrammarWrong] = await Promise.all([
      PracticeResult.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId), completedAt: { $gte: since }, isCorrect: false } },
        { $group: { _id: '$practiceExercise', count: { $sum: 1 } } }
      ]),
      GrammarQuizResult.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId), completedAt: { $gte: since }, isCorrect: false } },
        { $group: { _id: '$flashcard', count: { $sum: 1 } } }
      ])
    ]);

    const recentGrammarWrongMap = new Map(recentGrammarWrong.map(r => [r._id?.toString(), r.count]));

    let best = null;
    for (const it of dueItems) {
      const errorRate = 100 - (it.accuracy || 0);
      const recentWrongBonus = recentGrammarWrongMap.get(it.flashcard?._id?.toString()) || 0;
      const score =
        weights.w1 * 1 +
        weights.w2 * (errorRate / 100) +
        weights.w3 * (it.incorrectCount || 0) +
        weights.w4 * ((it.averageResponseTime || 0) / 10) +
        weights.w5 * recentWrongBonus;

      if (!best || score > best.score) {
        best = { item: it, score };
      }
    }

    // 3) Nếu không có due, fallback lấy thẻ mới trong deck
    if (!best && parseInt(fallbackNew) === 1 && deckId) {
      const newCards = await StudyProgress.getNewCards(userId, deckId, 1);
      if (newCards && newCards.length > 0) {
        return res.status(200).json({ success: true, type: 'NEW_CARD', card: newCards[0] });
      }
    }

    if (!best) {
      return res.status(200).json({ success: true, message: 'Không có thẻ đến hạn. Nghỉ ngơi chút nhé!' });
    }

    return res.status(200).json({
      success: true,
      type: 'DUE_CARD',
      card: best.item.flashcard,
      metrics: {
        accuracy: best.item.accuracy,
        incorrectCount: best.item.incorrectCount,
        averageResponseTime: best.item.averageResponseTime,
        nextReviewDate: best.item.nextReviewDate,
        score: best.score
      }
    });
  } catch (error) {
    console.error('Lỗi khi đề xuất next-best-card:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * Tạo quiz phụ từ các thẻ/bài hay sai
 * 
 * API Test:
 * POST /api/analytics/weak-quiz/generate
 * Headers: Authorization: Bearer {token}
 * Body: {
 *   "deckId": "..." (optional),
 *   "limit": 10,
 *   "sources": ["studyProgress","practiceResult","grammarQuizResult"]
 * }
 */
exports.generateWeakQuiz = async (req, res) => {
  try {
    const userId = req.user.id;
    const { deckId, limit = 10, sources = ['studyProgress','practiceResult','grammarQuizResult'] } = req.body;
    const since = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); // 60 ngày

    const items = [];
    const added = new Set();

    // 1) Từ StudyProgress: accuracy thấp nhất
    if (sources.includes('studyProgress')) {
      const match = { user: userId };
      if (deckId) match.deck = deckId;
      const lowAcc = await StudyProgress.find(match)
        .sort({ accuracy: 1, incorrectCount: -1 })
        .limit(parseInt(limit));
      for (const sp of lowAcc) {
        const key = `flashcard:${sp.flashcard.toString()}`;
        if (!added.has(key)) {
          items.push({ type: 'flashcard', refId: sp.flashcard, source: 'studyProgress', reason: 'low-accuracy' });
          added.add(key);
        }
        if (items.length >= limit) break;
      }
    }

    // 2) Từ PracticeResult: sai nhiều nhất gần đây
    if (items.length < limit && sources.includes('practiceResult')) {
      const prAgg = await PracticeResult.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId), completedAt: { $gte: since }, isCorrect: false } },
        { $group: { _id: '$practiceExercise', wrongAttempts: { $sum: 1 } } },
        { $sort: { wrongAttempts: -1 } },
        { $limit: limit }
      ]);
      for (const r of prAgg) {
        const key = `practice:${r._id.toString()}`;
        if (!added.has(key)) {
          items.push({ type: 'practice', refId: r._id, source: 'practiceResult', reason: 'recent-wrong' });
          added.add(key);
        }
        if (items.length >= limit) break;
      }
    }

    // 3) Từ GrammarQuizResult: sai nhiều nhất gần đây (mặc định nhóm theo flashcard)
    if (items.length < limit && sources.includes('grammarQuizResult')) {
      const gqAgg = await GrammarQuizResult.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId), completedAt: { $gte: since }, isCorrect: false } },
        { $group: { _id: '$grammarQuiz', wrongAttempts: { $sum: 1 } } },
        { $sort: { wrongAttempts: -1 } },
        { $limit: limit }
      ]);
      for (const r of gqAgg) {
        const key = `grammar:${r._id.toString()}`;
        if (!added.has(key)) {
          items.push({ type: 'grammar', refId: r._id, source: 'grammarQuizResult', reason: 'recent-wrong' });
          added.add(key);
        }
        if (items.length >= limit) break;
      }
    }

    // Cắt theo limit
    const finalItems = items.slice(0, parseInt(limit));

    // Lưu quiz
    const quiz = await SupplementaryQuiz.create({
      user: userId,
      title: 'Weakness Drill',
      deck: deckId || undefined,
      items: finalItems,
      totalItems: finalItems.length,
      generatedFrom: sources
    });

    return res.status(201).json({ success: true, quiz });
  } catch (error) {
    console.error('Lỗi khi tạo quiz phụ:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};


