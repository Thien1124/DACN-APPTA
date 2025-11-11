// backend/src/controllers/practiceController.js
const PracticeExercise = require('../models/PracticeExercise');
const PracticeResult = require('../models/PracticeResult');
const User = require('../models/User');
const mongoose = require('mongoose'); // ✅ Thêm dòng này
/**
 * @desc    Get practice exercises với filter
 * @route   GET /api/practice/exercises
 * @access  Private
 */
exports.getExercises = async (req, res) => {
  try {
    const { category, level, difficulty, type, limit = 20, page = 1 } = req.query;

    const query = { isActive: true };

    if (category) query.category = category;
    if (level) query.level = level;
    if (difficulty) query.difficulty = difficulty;
    if (type) query.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const exercises = await PracticeExercise.find(query)
      .select('-correctAnswer -explanation -examples -commonMistakes') // Ẩn đáp án
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await PracticeExercise.countDocuments(query);

    console.log(`📚 Found ${exercises.length} practice exercises`);

    res.status(200).json({
      success: true,
      data: exercises,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('❌ Get exercises error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách bài tập',
      error: error.message
    });
  }
};

/**
 * @desc    Get exercise by ID (ẩn đáp án)
 * @route   GET /api/practice/exercises/:id
 * @access  Private
 */
exports.getExerciseById = async (req, res) => {
  try {
    const { id } = req.params;

    const exercise = await PracticeExercise.findById(id)
      .select('-correctAnswer -explanation -examples -commonMistakes');

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài tập'
      });
    }

    res.status(200).json({
      success: true,
      data: exercise
    });

  } catch (error) {
    console.error('❌ Get exercise by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy bài tập',
      error: error.message
    });
  }
};

/**
 * @desc    Submit answer
 * @route   POST /api/practice/exercises/:id/submit
 * @access  Private
 */
exports.submitAnswer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { userAnswer, timeSpent = 0 } = req.body;

    const exercise = await PracticeExercise.findById(id);

    if (!exercise) {
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

    console.log(`${isCorrect ? '✅' : '❌'} User ${userId} answered exercise ${id}: ${isCorrect ? 'Correct' : 'Wrong'}`);

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
 * @desc    Get user practice history
 * @route   GET /api/practice/history
 * @access  Private
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