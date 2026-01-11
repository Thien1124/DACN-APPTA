const User = require('../models/User');
const Progress = require('../models/Progress');
const Vocabulary = require('../models/Vocabulary');

exports.getUserProgress = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id; 
    
    if (!userId) {
      console.error('❌ No userId found in req.user:', req.user);
      return res.status(401).json({
        success: false,
        message: 'User ID không hợp lệ'
      });
    }
    
    console.log(`📖 Getting progress for user: ${userId}`);
    
    let progress = await Progress.findOne({ user: userId });
    
    if (!progress) {
      progress = await Progress.create({
        user: userId,
        completedLessons: [],
        currentLesson: null,
        lessonProgress: new Map()
      });
      console.log('✅ Created new progress record for user:', userId);
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

exports.updateLessonProgress = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user?._id || req.user?.id;
    const { completed, score, timeSpent } = req.body;
    if (!userId) {
      console.error('❌ No userId found in req.user:', req.user);
      return res.status(401).json({
        success: false,
        message: 'User ID không hợp lệ'
      });
    }
    
    console.log(`📚 Updating lesson progress for user ${userId}, lesson ${lessonId}`);
    console.log(`📊 Data: completed=${completed}, score=${score}, timeSpent=${timeSpent}`);
    
    if (!lessonId || lessonId === 'undefined' || lessonId === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Lesson ID không hợp lệ'
      });
    }
    
    let progress = await Progress.findOne({ user: userId });
    
    if (!progress) {
      progress = await Progress.create({
        user: userId,
        completedLessons: [],
        currentLesson: lessonId,
        lessonProgress: new Map()
      });
       ('✅ Created new progress record');
    }
    
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
    
    let xpGained = 0;
    
    if (completed && !progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
      console.log(`✅ Marked lesson ${lessonId} as completed`);
      
      xpGained = Math.max(10, Math.floor(score / 2));
      console.log(`🎯 XP gained: ${xpGained} (score: ${score})`);
      
      try {
        const user = await User.findById(userId);
        if (user) {
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
              const diffMs = today.getTime() - lastActivity.getTime();
              const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

              if (diffDays === 1) {
                user.streak.count += 1;
              } else {
                user.streak.count = 1;
              }
            }

            user.streak.lastActivityDate = today;
            
            if (!user.xp) {
              user.xp = { total: 0 };
            }
            if (typeof user.xp === 'number') {
              user.xp = { total: user.xp };
            }
            user.xp.total = (user.xp.total || 0) + xpGained;
            console.log(`💎 XP updated: ${user.xp.total} (+${xpGained})`);
            
            await user.save();
            console.log(`🔥 Streak updated to ${user.streak.count} for user ${userId}`);
          } else {
            console.log(`ℹ️ Streak already updated today: ${user.streak.count}`);
          }
        }
      } catch (streakError) {
        console.error('❌ Error updating streak:', streakError);
      }
      
      try {
        const vocabularies = await Vocabulary.find({ lesson: lessonId });
        
         (`📖 Found ${vocabularies.length} vocabularies in lesson ${lessonId}`);
        
        let markedCount = 0;
        let alreadyLearnedCount = 0;
        
        for (const vocab of vocabularies) {
          const existingLearn = vocab.learnedBy.find(learn => 
            learn.user.toString() === userId.toString()
          );
          
          if (!existingLearn) {
            vocab.learnedBy.push({
              user: userId,
              learnedAt: new Date(),
              reviewCount: 0,
              mastery: 20,
              starred: false
            });
            await vocab.save();
            markedCount++;
             (`✅ Marked vocabulary "${vocab.word}" as learned`);
          } else {
            alreadyLearnedCount++;
             (`ℹ️ Vocabulary "${vocab.word}" already learned`);
          }
        }
        
         (`📊 Auto-mark summary: ${markedCount} new, ${alreadyLearnedCount} already learned`);
      } catch (vocabError) {
        console.error('❌ Error auto-marking vocabularies:', vocabError);
      }
    }
    
    if (!completed) {
      progress.currentLesson = lessonId;
    }
    
    await progress.save();
    
     (`✅ Lesson progress updated successfully`);
    
    const updatedUser = await User.findById(userId).select('xp');
    const currentXP = updatedUser?.xp?.total || updatedUser?.xp || 0;
    
    res.json({
      success: true,
      data: {
        progress,
        xp: currentXP,
        xpGained: xpGained
      },
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