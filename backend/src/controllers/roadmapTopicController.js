const LearningRoadmap = require('../models/LearningRoadmap');
const Exercise = require('../models/Exercise');
const Lesson = require('../models/Lesson');
const User = require('../models/User');
const VocabularyBank = require('../models/VocabularyBank');
const geminiService = require('../services/geminiService');

/**
 * @desc    Lấy lộ trình hiện tại của user
 * @route   GET /api/roadmap-topic/current
 * @access  Private
 */
exports.getCurrentRoadmap = async (req, res) => {
  try {
    const userId = req.user.id;

    const roadmap = await LearningRoadmap.findOne({
      user: userId,
      isActive: true
    })
      .populate('steps.exercises')
      .sort({ createdAt: -1 });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Chưa có lộ trình học nào'
      });
    }

    res.status(200).json({
      success: true,
      data: roadmap
    });

  } catch (error) {
    console.error('❌ Get current roadmap error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy lộ trình học',
      error: error.message
    });
  }
};

/**
 * @desc    Hoàn thành một step trong roadmap
 * @route   POST /api/roadmap-topic/:roadmapId/complete-step
 * @access  Private
 */
exports.completeStep = async (req, res) => {
  try {
    const userId = req.user.id;
    const { roadmapId } = req.params;
    const { stepNumber, score } = req.body;

    const roadmap = await LearningRoadmap.findOne({
      _id: roadmapId,
      user: userId
    });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lộ trình'
      });
    }

    const step = roadmap.steps.find(s => s.stepNumber === stepNumber);
    if (!step) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bước này'
      });
    }

    // Check if score meets minimum requirement
    if (score < step.minScore) {
      return res.status(400).json({
        success: false,
        message: `Điểm số chưa đủ! Cần ít nhất ${step.minScore} điểm để hoàn thành bước này.`
      });
    }

    // Mark step as completed
    step.isCompleted = true;
    step.completedAt = new Date();
    step.score = score;

    // Award XP
    roadmap.totalXP += step.xpReward;

    // Move to next step
    if (stepNumber < roadmap.steps.length) {
      roadmap.currentStep = stepNumber + 1;
    } else {
      // Roadmap completed
      roadmap.completedAt = new Date();
      roadmap.isActive = false;
    }

    // Update overall progress
    const completedSteps = roadmap.steps.filter(s => s.isCompleted).length;
    roadmap.overallProgress = Math.round((completedSteps / roadmap.steps.length) * 100);

    await roadmap.save();

    console.log(`✅ Step ${stepNumber} completed with score ${score}`);

    res.status(200).json({
      success: true,
      message: `Hoàn thành bước ${stepNumber}! +${step.xpReward} XP`,
      data: roadmap
    });

  } catch (error) {
    console.error('❌ Complete step error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể hoàn thành bước này',
      error: error.message
    });
  }
};

/**
 * @desc    Lấy danh sách exercises của một step
 * @route   GET /api/roadmap-topic/:roadmapId/step/:stepNumber/exercises
 * @access  Private
 */
exports.getStepExercises = async (req, res) => {
  try {
    const userId = req.user.id;
    const { roadmapId, stepNumber } = req.params;

    console.log('📥 Get step exercises:', { roadmapId, stepNumber, userId });

    const roadmap = await LearningRoadmap.findOne({
      _id: roadmapId,
      user: userId
    }).populate({
      path: 'steps.exercises',
      populate: {
        path: 'lesson',
        select: 'title'
      }
    });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lộ trình'
      });
    }

    const step = roadmap.steps.find(s => s.stepNumber === parseInt(stepNumber));
    
    if (!step) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy bước ${stepNumber}`
      });
    }

    console.log('✅ Found step:', step.stepNumber, 'with exercises:', step.exercises?.length || 0);

    if (!step.exercises || step.exercises.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          step: {
            stepNumber: step.stepNumber,
            title: step.title,
            description: step.description,
            difficulty: step.difficulty,
            minScore: step.minScore,
            xpReward: step.xpReward
          },
          exercises: []
        }
      });
    }

    // ✅ Transform exercises để frontend có thể render
    const transformedExercises = step.exercises.map(exercise => {
      console.log('🔍 Transforming exercise:', {
        id: exercise._id,
        type: exercise.type,
        hasOptions: !!exercise.options,
        optionsLength: exercise.options?.length
      });
      
      // Base exercise object
      const exerciseObj = {
        _id: exercise._id,
        question: exercise.question,
        type: exercise.type,
        points: exercise.points || 10,
        difficulty: exercise.difficulty,
        explanation: exercise.explanation
      };

      // ✅ Transform theo type
      if (exercise.type === 'multiple-choice') {
        // Transform options thành questions array
        if (!exercise.options || exercise.options.length === 0) {
          console.warn('⚠️ Multiple-choice exercise has no options:', exercise._id);
          exerciseObj.questions = [];
          exerciseObj.correctAnswer = null;
        } else {
          exerciseObj.questions = exercise.options.map((option) => ({
            _id: option._id || `opt-${Math.random()}`,
            question: option.text
          }));
          
          // Tìm correctAnswer
          const correctOption = exercise.options.find(opt => opt.isCorrect);
          exerciseObj.correctAnswer = correctOption ? correctOption._id : null;
          
          console.log('✅ Transformed multiple-choice:', {
            questionsCount: exerciseObj.questions.length,
            correctAnswerId: exerciseObj.correctAnswer
          });
        }
      } 
      else if (['fill-in-blank', 'translation', 'listening'].includes(exercise.type)) {
        exerciseObj.correctAnswer = exercise.correctAnswer;
        exerciseObj.questions = []; // Không có choices
        exerciseObj.audioUrl = exercise.audioUrl;
        
        console.log('✅ Transformed fill/translation/listening:', {
          type: exercise.type,
          hasCorrectAnswer: !!exerciseObj.correctAnswer
        });
      }

      return exerciseObj;
    });

    console.log('✅ Total transformed exercises:', transformedExercises.length);

    res.status(200).json({
      success: true,
      data: {
        step: {
          stepNumber: step.stepNumber,
          title: step.title,
          description: step.description,
          difficulty: step.difficulty,
          minScore: step.minScore,
          xpReward: step.xpReward,
          estimatedTime: step.estimatedTime
        },
        exercises: transformedExercises
      }
    });

  } catch (error) {
    console.error('❌ Get step exercises error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách bài tập',
      error: error.message
    });
  }
};

/**
 * Tạo lộ trình học tuần tự từ A1 đến C2 (20 steps/level với độ khó tăng dần)
 * 
 * API Test:
 * POST /api/roadmap-topic/generate
 * Headers: Authorization: Bearer {token}
 * Body: {
 *   "startLevel": "A1",
 *   "endLevel": "C2",
 *   "topic": "General English"
 * }
 */
exports.generateRoadmap = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startLevel = 'A1', endLevel = 'C2', topic = 'General English' } = req.body;

    console.log(`🗺️ Generating sequential roadmap for user ${userId} from ${startLevel} to ${endLevel} on topic "${topic}"`);

    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const skills = ['vocabulary', 'grammar', 'listening', 'reading', 'speaking', 'writing', 'mixed'];
    
    const startIndex = levels.indexOf(startLevel);
    const endIndex = levels.indexOf(endLevel);

    if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
      return res.status(400).json({
        success: false,
        message: 'Trình độ bắt đầu hoặc kết thúc không hợp lệ.'
      });
    }

    const selectedLevels = levels.slice(startIndex, endIndex + 1);
    
    const stepPromises = [];
    let stepNumber = 1;
    let totalXP = 0;

    console.log(`🔄 Processing levels: ${selectedLevels.join(', ')}`);

    for (const level of selectedLevels) {
      console.log(`🔥 Preparing 20 steps for level ${level}...`);
      for (let i = 0; i < 20; i++) {
        const skill = skills[i % skills.length];
        
        let difficulty, minScore, xpReward, estimatedTime;
        
        if (i < 7) { // Steps 1-7: Easy
          difficulty = 'easy'; minScore = 60; xpReward = 40; estimatedTime = 10;
        } else if (i < 14) { // Steps 8-14: Medium
          difficulty = 'medium'; minScore = 70; xpReward = 60; estimatedTime = 15;
        } else { // Steps 15-20: Hard
          difficulty = 'hard'; minScore = 80; xpReward = 80; estimatedTime = 20;
        }
        
        const stepTitle = `${skill.charAt(0).toUpperCase() + skill.slice(1)} ${level} - Bài ${i + 1}`;

        const currentStepNumber = stepNumber++;
        totalXP += xpReward;

        stepPromises.push(
          (async () => {
            console.log(`  - Generating content for Step ${currentStepNumber}: ${stepTitle} (Difficulty: ${difficulty})`);
            const exercises = await generateExercisesForStep(skill, level, topic, difficulty, userId);
            
            let vocabularyBank = null;
            if (skill === 'vocabulary') {
              vocabularyBank = await generateVocabularyForLevel(level, topic, userId);
            }

            return {
              stepNumber: currentStepNumber,
              title: stepTitle,
              description: `Học ${skill} ở trình độ ${level}. Độ khó: ${difficulty}.`,
              skill: skill.toUpperCase(),
              level,
              difficulty,
              minScore,
              xpReward,
              estimatedTime,
              exercises,
              vocabularyBank,
              isCompleted: false
            };
          })()
        );
      }
    }

    console.log(`🚀 Executing ${stepPromises.length} step generation tasks in parallel...`);
    const steps = await Promise.all(stepPromises);
    steps.sort((a, b) => a.stepNumber - b.stepNumber); // Ensure order
    console.log('✅ All steps generated and sorted.');

    console.log('⏳ Deactivating old roadmaps...');
    await LearningRoadmap.updateMany({ user: userId, isActive: true }, { isActive: false });

    console.log('✅ Creating new roadmap in database...');
    const roadmap = await LearningRoadmap.create({
      user: userId,
      topic,
      category: 'sequential-progressive',
      level: `${startLevel}-${endLevel}`,
      steps,
      totalXP,
      currentStep: 1,
      overallProgress: 0,
      startedAt: new Date(),
      estimatedCompletionDate: new Date(Date.now() + (steps.length * 2 * 24 * 60 * 60 * 1000)) // Estimate 2 days per step
    });

    console.log(`🎉 Successfully created roadmap ${roadmap._id} with ${steps.length} steps.`);

    res.status(201).json({
      success: true,
      message: 'Lộ trình học đã được tạo thành công!',
      data: roadmap
    });
  } catch (error) {
    console.error('❌ Generate roadmap error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tạo lộ trình',
      error: error.message
    });
  }
};

// Hàm helper: Generate exercises cho từng step với độ khó cụ thể
const generateExercisesForStep = async (skill, level, topic, stepDifficulty, userId) => {
  try {
    const exerciseCount = 5; // Lấy 5 bài tập cho mỗi step
    console.log(`    - Finding ${exerciseCount} exercises for Step: [Skill: ${skill}, Level: ${level}, Difficulty: ${stepDifficulty}]`);

    // 1. Tìm exercises đã có trong DB
    const existingExercises = await Exercise.find({
      skill: skill.toUpperCase(),
      level: level,
      difficulty: stepDifficulty,
    }).limit(exerciseCount);

    if (existingExercises.length >= exerciseCount) {
      console.log(`    - ✅ Found ${existingExercises.length} existing exercises in DB.`);
      return existingExercises.map(e => e._id);
    }

    // 2. Nếu không đủ, generate thêm bằng AI
    const neededCount = exerciseCount - existingExercises.length;
    console.log(`    - ⚠️ Not enough exercises in DB. Generating ${neededCount} new exercises with AI...`);

    const generatedExercises = await geminiService.generateExercises(skill, level, topic, neededCount, stepDifficulty);

    if (!generatedExercises || generatedExercises.length === 0) {
      console.log(`    - ❌ AI failed to generate exercises. Using what we have.`);
      return existingExercises.map(e => e._id);
    }

    console.log(`    - 🤖 AI returned ${generatedExercises.length} exercises.`);

    // 3. Lưu exercises mới vào DB
    const newExerciseDocs = await Promise.all(
      generatedExercises.map(ex =>
        Exercise.create({
          skill: skill.toUpperCase(),
          level,
          type: ex.type || 'multiple_choice',
          question: ex.question,
          options: ex.options || [],
          correctAnswer: ex.correctAnswer,
          explanation: ex.explanation || '',
          points: stepDifficulty === 'easy' ? 5 : stepDifficulty === 'medium' ? 10 : 15,
          difficulty: stepDifficulty,
          audioUrl: ex.audioUrl || null,
          imageUrl: ex.imageUrl || null,
          createdBy: userId,
        })
      )
    );

    console.log(`    - ✅ Created ${newExerciseDocs.length} new exercises in DB.`);

    // 4. Kết hợp cả hai
    const allExerciseIds = [...existingExercises.map(e => e._id), ...newExerciseDocs.map(e => e._id)];
    return allExerciseIds;
  } catch (error) {
    console.error('Error generating exercises:', error);
    return [];
  }
};


/**
 * Generate exercises for existing roadmap steps
 * POST /api/roadmap-topic/generate-exercises
 */
exports.generateExercisesForRoadmap = async (req, res) => {
  try {
    const userId = req.user.id;
    const roadmap = await LearningPath.findOne({ user: userId, isActive: true });
    
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lộ trình hiện tại'
      });
    }

    let updatedSteps = 0;
    for (const step of roadmap.steps) {
      if (step.exercises.length === 0) {  // Chỉ generate nếu chưa có
        try {
          step.exercises = await generateExercisesForStep(step.skill.toLowerCase(), step.level, roadmap.topic, step.difficulty);
          updatedSteps++;
        } catch (error) {
          console.error(`Error generating exercises for step ${step.stepNumber}:`, error);
        }
      }
    }

    await roadmap.save();

    res.status(200).json({
      success: true,
      message: `Đã tạo exercises cho ${updatedSteps} steps`,
      data: roadmap
    });
  } catch (error) {
    console.error('Generate exercises for roadmap error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tạo exercises',
      error: error.message
    });
  }
};

const generateVocabularyForLevel = async (level, topic, userId) => {
  try {
    const count = 20; // 20 words per vocabulary step
    console.log(`    - Generating ${count} vocabulary words for level ${level}...`);
    const vocabularyList = await geminiService.generateVocabularyList(topic, level, count);

    if (!vocabularyList || vocabularyList.length === 0) {
      console.log(`    - AI service returned no vocabulary. Skipping.`);
      return [];
    }
    const vocabularies = [];
    for (const vocab of vocabularyList) {
      // ✅ Sửa: Kiểm tra an toàn cho vocab.meanings
      const meaning = vocab.meanings && vocab.meanings.length > 0 ? vocab.meanings[0].definition : '';
      const example = vocab.meanings && vocab.meanings.length > 0 ? vocab.meanings[0].example : '';
      const newVocab = await VocabularyBank.create({
        user: userId,
        word: vocab.word,
        pronunciation: vocab.pronunciation,
        meaning: meaning,
        partOfSpeech: vocab.partOfSpeech,
        example: example,
        synonyms: vocab.synonyms || [],
        antonyms: vocab.antonyms || [],
        difficulty: level.toLowerCase(),
        cefrLevel: level,
        source: 'roadmap-generated'
      });
      vocabularies.push(newVocab._id);
    }
    console.log(`    - Created ${vocabularies.length} vocabulary entries.`);
    return vocabularies;
  } catch (error) {
    console.error(`Error generating vocabulary for ${level}:`, error);
    return []; // Return empty array on error
  }
};