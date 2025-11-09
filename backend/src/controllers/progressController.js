const User = require('../models/User');
const Progress = require('../models/Progress');
const Vocabulary = require('../models/Vocabulary');

exports.getUserProgress = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ Sử dụng req.user.id
    
    // Tìm progress từ Progress model
    let progress = await Progress.findOne({ user: userId });
    
    if (!progress) {
      // Nếu chưa có, tạo mới
      progress = await Progress.create({
        user: userId,
        completedLessons: [],
        currentLesson: null,
        lessonProgress: new Map()
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        completedLessons: progress.completedLessons || [],
        currentLesson: progress.currentLesson || null,
        lessonProgress: progress.lessonProgress || new Map()
      }
    });
  } catch (error) {
    console.error('❌ Error getting user progress:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy tiến độ học tập',
      error: error.message
    });
  }
};

// @desc    Cập nhật tiến độ bài học
// @route   PUT /api/progress/lessons/:lessonId
// @access  Private
exports.updateLessonProgress = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id; // ✅ Sử dụng req.user.id
    const { completed, score, timeSpent } = req.body;
    
    console.log(`📚 Updating lesson progress for user ${userId}, lesson ${lessonId}`);
    console.log(`📊 Data: completed=${completed}, score=${score}, timeSpent=${timeSpent}`);
    
    // ✅ Validate lessonId
    if (!lessonId || lessonId === 'undefined' || lessonId === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Lesson ID không hợp lệ'
      });
    }
    
    // Tìm hoặc tạo progress record
    let progress = await Progress.findOne({ user: userId });
    
    if (!progress) {
      progress = await Progress.create({
        user: userId,
        completedLessons: [],
        currentLesson: lessonId,
        lessonProgress: new Map()
      });
      console.log('✅ Created new progress record');
    }
    
    // Cập nhật lesson progress
    const lessonProgress = progress.lessonProgress.get(lessonId) || {
      attempts: 0,
      bestScore: 0,
      timeSpent: 0,
      completed: false
    };
    
    lessonProgress.attempts += 1;
    if (score > lessonProgress.bestScore) {
      lessonProgress.bestScore = score;
    }
    lessonProgress.timeSpent += timeSpent || 0;
    lessonProgress.completed = completed;
    lessonProgress.lastAttempt = new Date();
    
    progress.lessonProgress.set(lessonId, lessonProgress);
    
    // ✅ Nếu lesson hoàn thành, thêm vào completedLessons và đánh dấu từ vựng đã học
    if (completed && !progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
      console.log(`✅ Marked lesson ${lessonId} as completed`);
      
      // ✅ TỰ ĐỘNG ĐÁNH DẤU TẤT CẢ TỪ VỰNG TRONG LESSON LÀ ĐÃ HỌC
      try {
        const vocabularies = await Vocabulary.find({ lesson: lessonId });
        
        console.log(`📖 Found ${vocabularies.length} vocabularies in lesson ${lessonId}`);
        
        let markedCount = 0;
        let alreadyLearnedCount = 0;
        
        for (const vocab of vocabularies) {
          // Kiểm tra đã học chưa
          const existingLearn = vocab.learnedBy.find(learn => 
            learn.user.toString() === userId.toString()
          );
          
          if (!existingLearn) {
            vocab.learnedBy.push({
              user: userId,
              learnedAt: new Date(),
              reviewCount: 0,
              mastery: 20, // Bắt đầu với 20% mastery
              starred: false
            });
            await vocab.save();
            markedCount++;
            console.log(`✅ Marked vocabulary "${vocab.word}" as learned`);
          } else {
            alreadyLearnedCount++;
            console.log(`ℹ️ Vocabulary "${vocab.word}" already learned`);
          }
        }
        
        console.log(`📊 Auto-mark summary: ${markedCount} new, ${alreadyLearnedCount} already learned`);
      } catch (vocabError) {
        console.error('❌ Error auto-marking vocabularies:', vocabError);
        // Không throw error để không làm fail progress update
      }
    }
    
    // Cập nhật current lesson nếu chưa hoàn thành
    if (!completed) {
      progress.currentLesson = lessonId;
    }
    
    await progress.save();
    
    console.log(`✅ Lesson progress updated successfully`);
    
    res.json({
      success: true,
      data: progress,
      message: 'Đã cập nhật tiến độ học tập'
    });
  } catch (error) {
    console.error('[ERROR] Update lesson progress:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật tiến độ bài học',
      error: error.message
    });
  }
};