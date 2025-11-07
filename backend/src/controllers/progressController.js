const User = require('../models/User');

exports.getUserProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('completedLessons currentLesson');
    
    res.status(200).json({
      success: true,
      data: {
        completedLessons: user.completedLessons || [],
        currentLesson: user.currentLesson || null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy tiến độ học tập',
      error: error.message
    });
  }
};

exports.updateLessonProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { lessonId, completed, score } = req.body;

    const user = await User.findById(userId);

    if (completed) {
      // Thêm vào completedLessons nếu chưa có
      if (!user.completedLessons.includes(lessonId)) {
        user.completedLessons.push(lessonId);
      }
      // Set currentLesson = null hoặc lesson tiếp theo
      user.currentLesson = null;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        completedLessons: user.completedLessons,
        currentLesson: user.currentLesson
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật tiến độ',
      error: error.message
    });
  }
};