const Exercise = require('../models/Exercise');

/**
 * @desc    Lấy random exercises cho TypeRacer
 * @route   GET /api/exercises/typeracer/random
 * @access  Private
 */
exports.getRandomForTypeRacer = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Lấy random exercises có type = 'translate_build'
    const exercises = await Exercise.aggregate([
      { $match: { type: 'translate_build' } },
      { $sample: { size: limit } }
    ]);
    
    if (!exercises || exercises.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài tập phù hợp'
      });
    }
    
    // Format lại data cho TypeRacer
    const formatted = exercises.map(ex => ({
      id: ex._id,
      vietnamese: ex.question, // Câu tiếng Việt
      wordBank: typeof ex.correctAnswer === 'string' 
        ? ex.correctAnswer.split(',').map(w => w.trim())
        : ex.correctAnswer, // Các từ tiếng Anh để xếp
      correctAnswer: typeof ex.correctAnswer === 'string'
        ? ex.correctAnswer.split(',').map(w => w.trim()).join(' ')
        : ex.correctAnswer.join(' ') // Câu đúng để check
    }));
    
    res.status(200).json({
      success: true,
      count: formatted.length,
      exercises: formatted
    });
    
  } catch (error) {
    console.error('Error getting exercises for TypeRacer:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy bài tập',
      error: error.message
    });
  }
};
