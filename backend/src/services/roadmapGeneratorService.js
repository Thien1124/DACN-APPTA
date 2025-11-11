const geminiService = require('./geminiService');

/**
 * LEVEL PROGRESSION STRUCTURE
 * A1 → A2 → B1 → B2 → C1 → C2
 */
const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const LEVEL_DESCRIPTIONS = {
  A1: {
    name: 'Beginner',
    description: 'Hiểu và sử dụng các cụm từ thông dụng hàng ngày',
    vocabRange: [300, 500],
    grammarTopics: ['Present Simple', 'Basic pronouns', 'Articles', 'Singular/Plural']
  },
  A2: {
    name: 'Elementary',
    description: 'Giao tiếp đơn giản về các chủ đề quen thuộc',
    vocabRange: [600, 800],
    grammarTopics: ['Past Simple', 'Future with will/going to', 'Comparatives', 'Prepositions']
  },
  B1: {
    name: 'Intermediate',
    description: 'Hiểu ý chính trong các tình huống thông thường',
    vocabRange: [1200, 1500],
    grammarTopics: ['Present Perfect', 'Conditionals', 'Passive Voice', 'Reported Speech']
  },
  B2: {
    name: 'Upper Intermediate',
    description: 'Hiểu nội dung phức tạp và giao tiếp tự nhiên',
    vocabRange: [2000, 2500],
    grammarTopics: ['Advanced conditionals', 'Modal verbs', 'Phrasal verbs', 'Collocations']
  },
  C1: {
    name: 'Advanced',
    description: 'Sử dụng ngôn ngữ linh hoạt và hiệu quả',
    vocabRange: [3000, 4000],
    grammarTopics: ['Advanced grammar structures', 'Idiomatic expressions', 'Discourse markers']
  },
  C2: {
    name: 'Mastery',
    description: 'Hiểu hầu như mọi thứ và diễn đạt chính xác',
    vocabRange: [5000, 8000],
    grammarTopics: ['Nuanced language use', 'Advanced rhetoric', 'Academic writing']
  }
};

const CATEGORY_FOCUS = {
  vocabulary: {
    stepRatio: { vocab: 0.6, grammar: 0.2, practice: 0.2 },
    description: 'Tập trung xây dựng vốn từ vựng'
  },
  grammar: {
    stepRatio: { vocab: 0.2, grammar: 0.6, practice: 0.2 },
    description: 'Nắm vững ngữ pháp tiếng Anh'
  },
  listening: {
    stepRatio: { vocab: 0.3, listening: 0.5, practice: 0.2 },
    description: 'Rèn luyện kỹ năng nghe'
  },
  reading: {
    stepRatio: { vocab: 0.3, reading: 0.5, practice: 0.2 },
    description: 'Phát triển đọc hiểu'
  },
  speaking: {
    stepRatio: { vocab: 0.3, speaking: 0.5, practice: 0.2 },
    description: 'Luyện phát âm và giao tiếp'
  },
  writing: {
    stepRatio: { vocab: 0.3, writing: 0.5, practice: 0.2 },
    description: 'Viết tiếng Anh hiệu quả'
  },
  mixed: {
    stepRatio: { vocab: 0.25, grammar: 0.25, listening: 0.15, reading: 0.15, speaking: 0.1, writing: 0.1 },
    description: 'Phát triển toàn diện 4 kỹ năng'
  }
};

/**
 * Generate roadmap steps from start to target level
 */
exports.generateRoadmap = async (topic, category, startLevel, targetLevel) => {
  const startIndex = LEVEL_ORDER.indexOf(startLevel);
  const targetIndex = LEVEL_ORDER.indexOf(targetLevel);

  if (startIndex === -1 || targetIndex === -1 || startIndex > targetIndex) {
    throw new Error('Invalid level progression');
  }

  const levels = LEVEL_ORDER.slice(startIndex, targetIndex + 1);
  const steps = [];
  let stepNumber = 1;

  for (const level of levels) {
    const levelSteps = await generateLevelSteps(topic, category, level, stepNumber);
    steps.push(...levelSteps);
    stepNumber += levelSteps.length;
  }

  return {
    steps,
    totalSteps: steps.length,
    estimatedDays: Math.ceil(steps.length * 2), // 2 days per step average
    totalVocabulary: steps.reduce((sum, step) => sum + (step.vocabularySet?.length || 0), 0)
  };
};

/**
 * Generate steps for a specific level
 */
async function generateLevelSteps(topic, category, level, startStepNumber) {
  const levelInfo = LEVEL_DESCRIPTIONS[level];
  const categoryInfo = CATEGORY_FOCUS[category];
  const steps = [];

  let stepNumber = startStepNumber;

  // Step 1: Vocabulary Introduction
  if (categoryInfo.stepRatio.vocab || category === 'mixed') {
    const vocabStep = await generateVocabularyStep(topic, level, stepNumber++);
    steps.push(vocabStep);
  }

  // Step 2: Grammar Rules
  if (categoryInfo.stepRatio.grammar || category === 'mixed') {
    const grammarStep = await generateGrammarStep(topic, level, stepNumber++);
    steps.push(grammarStep);
  }

  // Step 3: Listening (if applicable)
  if (category === 'listening' || category === 'mixed') {
    const listeningStep = generateListeningStep(topic, level, stepNumber++);
    steps.push(listeningStep);
  }

  // Step 4: Reading (if applicable)
  if (category === 'reading' || category === 'mixed') {
    const readingStep = generateReadingStep(topic, level, stepNumber++);
    steps.push(readingStep);
  }

  // Step 5: Speaking (if applicable)
  if (category === 'speaking' || category === 'mixed') {
    const speakingStep = generateSpeakingStep(topic, level, stepNumber++);
    steps.push(speakingStep);
  }

  // Step 6: Writing (if applicable)
  if (category === 'writing' || category === 'mixed') {
    const writingStep = generateWritingStep(topic, level, stepNumber++);
    steps.push(writingStep);
  }

  // Step 7: Mixed Practice
  const practiceStep = generatePracticeStep(topic, level, stepNumber++);
  steps.push(practiceStep);

  return steps;
}

/**
 * Generate vocabulary step with AI
 */
async function generateVocabularyStep(topic, level, stepNumber) {
  const levelInfo = LEVEL_DESCRIPTIONS[level];
  const vocabCount = Math.floor((levelInfo.vocabRange[0] + levelInfo.vocabRange[1]) / 2 / 10); // Divide into chunks

  // Call Gemini to generate vocabulary
  const vocabularySet = await geminiService.generateVocabularyList(
    topic,
    level,
    vocabCount
  );

  // Get detailed info for each word
  const detailedVocab = [];
  for (const word of vocabularySet.slice(0, 15)) { // Limit to 15 words per step
    try {
      const wordData = await geminiService.generateFlashcardContent(word);
      detailedVocab.push({
        word: wordData.word,
        pronunciation: wordData.pronunciation,
        meaning: wordData.meanings?.[0]?.translation || wordData.meanings?.[0]?.definition,
        example: wordData.meanings?.[0]?.example,
        exampleTranslation: wordData.meanings?.[0]?.translation,
        partOfSpeech: wordData.partOfSpeech,
        difficulty: wordData.difficulty,
        cefrLevel: level
      });
    } catch (error) {
      console.error(`Error generating word data for: ${word}`, error);
    }
  }

  // Generate exercises
  const exercises = detailedVocab.slice(0, 10).map(vocab => ({
    type: 'multiple_choice',
    content: `What is the meaning of "${vocab.word}"?`,
    options: [
      vocab.meaning,
      'Wrong option 1',
      'Wrong option 2',
      'Wrong option 3'
    ].sort(() => Math.random() - 0.5),
    correctAnswer: vocab.meaning,
    explanation: `"${vocab.word}" (${vocab.pronunciation}) means "${vocab.meaning}". Example: ${vocab.example}`,
    points: 10
  }));

  return {
    stepNumber,
    level,
    title: `${level} - Vocabulary: ${topic}`,
    description: `Learn ${detailedVocab.length} essential words for ${topic} at ${levelInfo.name} level`,
    category: 'vocabulary',
    difficulty: getDifficultyFromLevel(level),
    vocabularySet: detailedVocab,
    exercises,
    minScore: 70,
    xpReward: detailedVocab.length * 5,
    estimatedTime: detailedVocab.length * 2, // 2 minutes per word
    isCompleted: false,
    attempts: 0
  };
}

/**
 * Generate grammar step
 */
async function generateGrammarStep(topic, level, stepNumber) {
  const levelInfo = LEVEL_DESCRIPTIONS[level];
  const grammarTopic = levelInfo.grammarTopics[0]; // Pick first grammar topic

  return {
    stepNumber,
    level,
    title: `${level} - Grammar: ${grammarTopic}`,
    description: `Master ${grammarTopic} at ${levelInfo.name} level`,
    category: 'grammar',
    difficulty: getDifficultyFromLevel(level),
    grammarRules: [
      {
        rule: grammarTopic,
        explanation: `Learn how to use ${grammarTopic} correctly`,
        examples: [
          'Example sentence 1',
          'Example sentence 2',
          'Example sentence 3'
        ]
      }
    ],
    exercises: [
      {
        type: 'fill_blank',
        content: `Complete the sentence: I ___ (go) to school every day.`,
        options: ['go', 'goes', 'went', 'going'],
        correctAnswer: 'go',
        explanation: `Use simple present tense for habitual actions`,
        points: 10
      }
    ],
    minScore: 70,
    xpReward: 50,
    estimatedTime: 15,
    isCompleted: false,
    attempts: 0
  };
}

/**
 * Generate listening step
 */
function generateListeningStep(topic, level, stepNumber) {
  const levelInfo = LEVEL_DESCRIPTIONS[level];

  return {
    stepNumber,
    level,
    title: `${level} - Listening: ${topic}`,
    description: `Practice listening comprehension at ${levelInfo.name} level`,
    category: 'listening',
    difficulty: getDifficultyFromLevel(level),
    exercises: [
      {
        type: 'listening',
        content: 'Listen to the audio and answer the question',
        options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
        correctAnswer: 'Option 1',
        explanation: 'The speaker mentioned...',
        points: 15
      }
    ],
    minScore: 70,
    xpReward: 60,
    estimatedTime: 20,
    isCompleted: false,
    attempts: 0
  };
}

/**
 * Generate reading step
 */
function generateReadingStep(topic, level, stepNumber) {
  const levelInfo = LEVEL_DESCRIPTIONS[level];

  return {
    stepNumber,
    level,
    title: `${level} - Reading: ${topic}`,
    description: `Improve reading comprehension at ${levelInfo.name} level`,
    category: 'reading',
    difficulty: getDifficultyFromLevel(level),
    exercises: [
      {
        type: 'reading',
        content: 'Read the passage and answer the questions',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'A',
        explanation: 'The passage states that...',
        points: 15
      }
    ],
    minScore: 70,
    xpReward: 60,
    estimatedTime: 25,
    isCompleted: false,
    attempts: 0
  };
}

/**
 * Generate speaking step
 */
function generateSpeakingStep(topic, level, stepNumber) {
  const levelInfo = LEVEL_DESCRIPTIONS[level];

  return {
    stepNumber,
    level,
    title: `${level} - Speaking: ${topic}`,
    description: `Practice speaking and pronunciation at ${levelInfo.name} level`,
    category: 'speaking',
    difficulty: getDifficultyFromLevel(level),
    exercises: [
      {
        type: 'speaking',
        content: 'Record yourself saying: "Hello, how are you?"',
        correctAnswer: 'Hello, how are you?',
        explanation: 'Focus on clear pronunciation and natural intonation',
        points: 20
      }
    ],
    minScore: 70,
    xpReward: 70,
    estimatedTime: 15,
    isCompleted: false,
    attempts: 0
  };
}

/**
 * Generate writing step
 */
function generateWritingStep(topic, level, stepNumber) {
  const levelInfo = LEVEL_DESCRIPTIONS[level];

  return {
    stepNumber,
    level,
    title: `${level} - Writing: ${topic}`,
    description: `Develop writing skills at ${levelInfo.name} level`,
    category: 'writing',
    difficulty: getDifficultyFromLevel(level),
    exercises: [
      {
        type: 'writing',
        content: 'Write a short paragraph about your daily routine (50-80 words)',
        correctAnswer: '',
        explanation: 'Use simple present tense and time expressions',
        points: 25
      }
    ],
    minScore: 70,
    xpReward: 80,
    estimatedTime: 20,
    isCompleted: false,
    attempts: 0
  };
}

/**
 * Generate mixed practice step
 */
function generatePracticeStep(topic, level, stepNumber) {
  const levelInfo = LEVEL_DESCRIPTIONS[level];

  return {
    stepNumber,
    level,
    title: `${level} - Mixed Practice: ${topic}`,
    description: `Review all skills at ${levelInfo.name} level`,
    category: 'mixed',
    difficulty: getDifficultyFromLevel(level),
    exercises: [
      {
        type: 'multiple_choice',
        content: 'Choose the correct answer',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'A',
        explanation: 'Review explanation',
        points: 10
      }
    ],
    minScore: 80,
    xpReward: 100,
    estimatedTime: 30,
    isCompleted: false,
    attempts: 0
  };
}

/**
 * Helper: Get difficulty from level
 */
function getDifficultyFromLevel(level) {
  const difficultyMap = {
    'A1': 'beginner',
    'A2': 'elementary',
    'B1': 'intermediate',
    'B2': 'upper-intermediate',
    'C1': 'advanced',
    'C2': 'advanced'
  };
  return difficultyMap[level] || 'intermediate';
}

module.exports = exports;