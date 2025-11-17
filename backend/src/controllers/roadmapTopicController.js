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
  console.log('🗺️ getCurrentRoadmap called with user:', req.user?.id);
  try {
    const userId = req.user.id;
    console.log('🔍 Looking for roadmap with userId:', userId);

    const roadmap = await LearningRoadmap.findOne({
      user: userId,
      isActive: true
    })
      .populate({
        path: 'steps.exercises',
        model: 'Exercise',
        strictPopulate: false
      })
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
 * @desc    Lấy danh sách exercises của một step (tự động generate nếu chưa có)
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

    // 🆕 Nếu step chưa có exercises, tự động generate
    if (!step.exercises || step.exercises.length === 0) {
      console.log('⚠️ Step has no exercises. Auto-generating...');
      
      try {
        const skillMapping = {
          'VOCABULARY': 'vocabulary',
          'GRAMMAR': 'grammar',
          'LISTENING': 'listening',
          'READING': 'reading',
          'SPEAKING': 'speaking',
          'WRITING': 'writing',
          'MIXED': 'mixed'
        };
        
        const skill = skillMapping[step.skill] || 'mixed';
        const level = roadmap.level || 'B1'; // Lấy level từ roadmap, fallback B1
        const exerciseData = await generateExercisesForStep(
          skill,
          level,
          roadmap.topic,
          step.difficulty,
          userId
        );

        if (exerciseData && exerciseData.length > 0) {
          // Lưu exerciseIds vào step.exercises
          const exerciseIds = exerciseData.map(e => e.exerciseId);
          
          // Sử dụng findOneAndUpdate để tránh version conflict
          const updated = await LearningRoadmap.findOneAndUpdate(
            { 
              _id: roadmapId, 
              user: userId,
              'steps.stepNumber': parseInt(stepNumber)
            },
            { 
              $set: { 'steps.$.exercises': exerciseIds } 
            },
            { new: true }
          );
          
          if (updated) {
            console.log(`✅ Auto-generated ${exerciseData.length} exercises for step ${stepNumber}`);
            // Cập nhật roadmap object để tiếp tục xử lý
            const stepIndex = roadmap.steps.findIndex(s => s.stepNumber === parseInt(stepNumber));
            if (stepIndex !== -1) {
              roadmap.steps[stepIndex].exercises = exerciseIds;
            }
          }
        } else {
          console.log('⚠️ Could not generate exercises');
        }
      } catch (genError) {
        console.error('❌ Auto-generate error:', genError);
        // Continue to return empty exercises
      }
    }

    // Populate exercises sau khi đã generate (nếu cần)
    await roadmap.populate({
      path: 'steps.exercises',
      model: 'Exercise'
    });

    const updatedStep = roadmap.steps.find(s => s.stepNumber === parseInt(stepNumber));
    console.log('✅ Final step exercises count:', updatedStep.exercises?.length || 0);

    // Transform exercises cho frontend
    let transformedExercises = [];
    
    if (updatedStep.exercises && updatedStep.exercises.length > 0) {
      transformedExercises = updatedStep.exercises.map((exercise) => {
        // Nếu exercise là object ID thì cần populate trước
        const ex = exercise._id ? exercise : { _id: exercise };
        
        return {
          _id: ex._id,
          type: ex.type || 'multiple-choice',
          content: ex.question || '', // Map 'question' -> 'content'
          options: (ex.options || []).map(opt => 
            typeof opt === 'string' ? opt : opt.text // Lấy text từ {text, isCorrect}
          ),
          correctAnswer: ex.correctAnswer || '',
          explanation: ex.explanation || '',
          points: ex.points || 10,
          audioUrl: ex.audioUrl,
          imageUrl: ex.imageUrl,
          skill: ex.skill || updatedStep.skill,
          difficulty: ex.difficulty || updatedStep.difficulty,
          level: ex.level || roadmap.level // Lấy từ roadmap.level
        };
      });
    }

    console.log('✅ Total transformed exercises:', transformedExercises.length);

    res.status(200).json({
      success: true,
      message: transformedExercises.length > 0 ? 'Đã tải bài tập' : 'Bước này chưa có bài tập',
      data: {
        step: {
          stepNumber: updatedStep.stepNumber,
          title: updatedStep.title,
          description: updatedStep.description,
          difficulty: updatedStep.difficulty,
          minScore: updatedStep.minScore,
          xpReward: updatedStep.xpReward,
          estimatedTime: updatedStep.estimatedTime,
          vocabularySet: updatedStep.vocabularySet || [],
          skill: updatedStep.skill,
          level: updatedStep.level
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
 * Tạo lộ trình học toàn diện từ A1 đến C2
 * Mỗi level là 1 STEP DUY NHẤT chứa ĐẦY ĐỦ exercises từ tất cả skills và difficulties
 * Cấu trúc: 1 level = 1 step với 21 exercise groups (7 skills × 3 difficulties)
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
    const { 
      startLevel = 'A1', 
      endLevel = 'C2', 
      topic = 'General English'
    } = req.body;

    console.log(`🗺️ Generating comprehensive roadmap for user ${userId}`);
    console.log(`📊 Config: ${startLevel} → ${endLevel}, 1 step per level with ALL skills & difficulties`);

    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const skills = ['vocabulary', 'grammar', 'listening', 'reading', 'speaking', 'writing', 'mixed'];
    const difficulties = ['easy', 'medium', 'hard'];
    
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

    console.log(`📈 Structure: Each level = 1 step containing (7 skills × 3 difficulties) exercises`);
    console.log(`🔄 Processing ${selectedLevels.length} levels: ${selectedLevels.join(', ')}`);

    for (const level of selectedLevels) {
      console.log(`\n🎯 Level ${level}: Generating 1 comprehensive step with ALL content...`);
      
      const levelXP = (40 * 7) + (60 * 7) + (80 * 7); // Easy + Medium + Hard for all skills
      totalXP += levelXP;

      const currentStepNumber = stepNumber++;

      stepPromises.push(
        (async () => {
          console.log(`  📝 Step ${currentStepNumber}: Trình Độ ${level}`);
          
          // Generate exercises for ALL skills and ALL difficulties
          const allExercises = [];
          let vocabularyBank = null;
          
          for (const skill of skills) {
            for (const difficulty of difficulties) {
              console.log(`    🔹 Generating ${skill} - ${difficulty}...`);
              
              const exerciseMetadata = await generateExercisesForStep(
                skill, 
                level, 
                topic, 
                difficulty, 
                userId
              );
              
              // Thêm vào danh sách tổng hợp
              allExercises.push(...exerciseMetadata);
              
              // Generate vocabulary bank for vocabulary skill (only once per level)
              if (skill === 'vocabulary' && difficulty === 'easy' && !vocabularyBank) {
                console.log(`    📚 Generating vocabulary bank for ${level}...`);
                vocabularyBank = await generateVocabularyForLevel(level, topic, userId);
                console.log(`    ✅ Vocabulary bank generated: ${vocabularyBank.length} words`);
              }
            }
          }

          console.log(`  ✅ Generated ${allExercises.length} exercises for ${level}`);

          return {
            stepNumber: currentStepNumber,
            title: `Trình Độ ${level}`,
            description: `Hoàn thành tất cả bài tập ở trình độ ${level}, bao gồm đầy đủ 7 kỹ năng (Vocabulary, Grammar, Listening, Reading, Speaking, Writing, Mixed) với 3 độ khó (Easy, Medium, Hard). Hoàn thành để đạt ${levelXP} XP.`,
            skill: 'MIXED',
            level: level,
            difficulty: 'medium',
            minScore: 70,
            xpReward: levelXP,
            estimatedTime: (10 * 7) + (15 * 7) + (20 * 7),
            exercises: allExercises.map(ex => ex.exerciseId), // Store only ObjectIds
            vocabularyBank,
            isCompleted: false,
            // Store metadata separately for frontend use
            exerciseMetadata: allExercises
          };
        })()
      );
    }

    console.log(`\n🚀 Executing ${stepPromises.length} level generation tasks...`);
    console.log(`⚡ Processing in batches to avoid overload...`);
    
    // Process in batches (typically small number of levels, but keep batching for consistency)
    const batchSize = 3;
    const steps = [];
    
    for (let i = 0; i < stepPromises.length; i += batchSize) {
      const batch = stepPromises.slice(i, i + batchSize);
      console.log(`  🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(stepPromises.length / batchSize)} (${batch.length} levels)...`);
      const batchResults = await Promise.all(batch);
      steps.push(...batchResults);
    }
    
    steps.sort((a, b) => a.stepNumber - b.stepNumber);
    console.log(`\n✅ All ${steps.length} level steps generated and sorted.`);

    // Calculate statistics
    console.log('\n📊 Roadmap Statistics:');
    steps.forEach(step => {
      const skillCount = {};
      const difficultyCount = { easy: 0, medium: 0, hard: 0 };
      
      step.exerciseMetadata.forEach(ex => {
        skillCount[ex.skill] = (skillCount[ex.skill] || 0) + 1;
        difficultyCount[ex.difficulty.toLowerCase()]++;
      });
      
      console.log(`  ${step.level}: ${step.exercises.length} exercises`);
      console.log(`    Skills: ${Object.entries(skillCount).map(([k,v]) => `${k}=${v}`).join(', ')}`);
      console.log(`    Difficulties: Easy=${difficultyCount.easy}, Medium=${difficultyCount.medium}, Hard=${difficultyCount.hard}`);
    });

    console.log('\n⏳ Deactivating old roadmaps...');
    await LearningRoadmap.updateMany({ user: userId, isActive: true }, { isActive: false });

    console.log('✅ Creating new comprehensive roadmap in database...');
    console.log(`📋 Roadmap data: steps=${steps.length}, totalXP=${totalXP}, user=${userId}`);
    
    try {
      const roadmap = await LearningRoadmap.create({
        user: userId,
        topic,
        category: 'comprehensive-progressive',
        level: `${startLevel}-${endLevel}`,
        steps,
        totalXP,
        currentStep: 1,
        overallProgress: 0,
        startedAt: new Date(),
        estimatedCompletionDate: new Date(Date.now() + (steps.length * 2 * 24 * 60 * 60 * 1000))
      });

      console.log(`\n🎉 Successfully created comprehensive roadmap ${roadmap._id}:`);
      console.log(`   📚 Total levels: ${steps.length}`);
      console.log(`   🎯 Levels: ${selectedLevels.join(' → ')}`);
      console.log(`   💎 Total XP: ${totalXP}`);
      console.log(`   ⏱️ Estimated completion: ${roadmap.estimatedCompletionDate.toLocaleDateString('vi-VN')}`);

      res.status(201).json({
        success: true,
        message: `Lộ trình học toàn diện đã được tạo thành công! ${steps.length} trình độ từ ${startLevel} đến ${endLevel}.`,
        data: roadmap
      });
    } catch (createError) {
      console.error('❌ Error creating roadmap document:', createError);
      console.error('Error details:', createError.message);
      console.error('Validation errors:', createError.errors);
      res.status(500).json({
        success: false,
        message: 'Không thể lưu lộ trình vào database',
        error: createError.message
      });
    }
  } catch (error) {
    console.error('❌ Generate roadmap error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Không thể tạo lộ trình học',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};


// Hàm helper: Generate exercises cho từng step với độ khó cụ thể
const generateExercisesForStep = async (skill, level, topic, stepDifficulty, userId) => {
  try {
    const exerciseCount = 5; // Lấy 5 bài tập cho mỗi step
    console.log(`    - Finding ${exerciseCount} exercises for Step: [Skill: ${skill}, Level: ${level}, Difficulty: ${stepDifficulty}]`);

    // 1. Ưu tiên lấy bài tập có sẵn từ database
    const existingExercises = await getExistingExercises(skill, stepDifficulty, level, exerciseCount);
    
    if (existingExercises.length >= exerciseCount) {
      console.log(`    - ✅ Found ${existingExercises.length} existing exercises in DB. Using them.`);
      return existingExercises.map(e => ({
        exerciseId: e._id,
        skill: e.skill,
        difficulty: e.difficulty,
        level: e.level
      }));
    }

    // 2. Nếu không đủ, lấy tất cả có sẵn + tạo thêm bằng AI
    const neededCount = exerciseCount - existingExercises.length;
    console.log(`    - ⚠️ Only ${existingExercises.length} existing exercises. Need ${neededCount} more from AI...`);

    // Tạo thêm với AI
    const aiExercises = await generateExercisesWithAI(skill, stepDifficulty, level, topic, neededCount, userId);
    
    // 3. Kết hợp cả hai
    const allExercises = [
      ...existingExercises.map(e => ({
        exerciseId: e._id,
        skill: e.skill,
        difficulty: e.difficulty,
        level: e.level
      })),
      ...aiExercises
    ];

    console.log(`    - 🎯 Total exercises for this step: ${allExercises.length} (${existingExercises.length} from DB + ${aiExercises.length} from AI)`);
    return allExercises;
    
  } catch (error) {
    console.error('❌ Error generating exercises:', error);
    // Fallback: thử lấy ít nhất 1 bài từ DB
    try {
      const fallbackExercises = await getExistingExercises(skill, stepDifficulty, level, 1);
      if (fallbackExercises.length > 0) {
        console.log(`    - 🔄 Fallback: Using ${fallbackExercises.length} existing exercises`);
        return fallbackExercises.map(e => ({
          exerciseId: e._id,
          skill: e.skill,
          difficulty: e.difficulty,
          level: e.level
        }));
      }
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError);
    }
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
    
    let vocabularyList = [];
    try {
      vocabularyList = await geminiService.generateVocabularyList(topic, level, count);
    } catch (aiError) {
      console.error(`    - AI vocabulary generation failed:`, aiError.message);
      return []; // Return empty array on AI error
    }

    if (!vocabularyList || vocabularyList.length === 0) {
      console.log(`    - AI service returned no vocabulary. Skipping.`);
      return [];
    }
    
    const vocabularies = [];
    for (const vocab of vocabularyList) {
      try {
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
      } catch (vocabError) {
        console.error(`    - Error creating vocabulary entry for "${vocab.word}":`, vocabError.message);
        // Continue with next vocabulary
      }
    }
    console.log(`    - Created ${vocabularies.length} vocabulary entries.`);
    return vocabularies;
  } catch (error) {
    console.error(`Error generating vocabulary for ${level}:`, error);
    return []; // Return empty array on error
  }
};

// 🆕 Thêm function lấy bài tập có sẵn từ database
const getExistingExercises = async (skill, difficulty, level, limit = 10) => {
  try {
    console.log(`🔍 Looking for existing exercises: ${skill} ${difficulty} ${level}, limit: ${limit}`);
    
    const exercises = await Exercise.find({
      skill: skill.toUpperCase(),
      difficulty: difficulty.toLowerCase(),
      level: level.toUpperCase(),
      isActive: { $ne: false } // Không lấy bài tập bị disable
    })
    .limit(limit)
    .select('_id skill difficulty level type question')
    .lean();

    console.log(`✅ Found ${exercises.length} existing exercises in DB`);
    return exercises;
  } catch (error) {
    console.error(`❌ Error getting existing exercises for ${skill} ${difficulty} ${level}:`, error);
    return [];
  }
};

// 🆕 Thêm function tạo bài tập với AI khi cần
const generateExercisesWithAI = async (skill, difficulty, level, topic, count, userId) => {
  try {
    console.log(`🤖 Generating ${count} exercises with AI for ${skill} ${difficulty} ${level}`);
    
    const exercises = await geminiService.generateExercises(skill, level, topic, count, difficulty);
    
    if (!exercises || exercises.length === 0) {
      console.log(`❌ AI returned no exercises`);
      return [];
    }

    console.log(`✅ AI generated ${exercises.length} exercises`);

    // Lưu vào database và trả về metadata
    const savedExercises = [];
    for (const exerciseData of exercises) {
      try {
        // Transform type: multiple_choice -> multiple-choice
        let exerciseType = exerciseData.type || 'multiple-choice';
        if (exerciseType === 'multiple_choice') {
          exerciseType = 'multiple-choice';
        }
        if (exerciseType === 'fill_blank') {
          exerciseType = 'fill-in-blank';
        }

        // Transform options from array of strings to array of objects
        const transformedOptions = (exerciseData.options || []).map(opt => ({
          text: typeof opt === 'string' ? opt : opt.text,
          isCorrect: typeof opt === 'string' ? opt === exerciseData.correctAnswer : opt.isCorrect
        }));

        const exercise = new Exercise({
          question: exerciseData.question,
          type: exerciseType,
          options: transformedOptions,
          correctAnswer: exerciseData.correctAnswer,
          explanation: exerciseData.explanation || '',
          lesson: null, // Tạm thời set null vì roadmap exercises không thuộc lesson cụ thể
          difficulty: difficulty.toLowerCase(),
          points: difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15,
          audioUrl: exerciseData.audioUrl || null,
          imageUrl: exerciseData.imageUrl || null
        });
        
        const saved = await exercise.save();
        savedExercises.push({
          exerciseId: saved._id,
          skill: skill,
          difficulty: saved.difficulty,
          level: level
        });
      } catch (saveError) {
        console.error(`❌ Error saving AI-generated exercise:`, saveError.message);
        // Continue with next exercise
      }
    }

    console.log(`💾 Saved ${savedExercises.length} AI-generated exercises to DB`);
    return savedExercises;
    
  } catch (error) {
    console.error(`❌ Error generating exercises with AI for ${skill} ${difficulty} ${level}:`, error);
    return [];
  }
};