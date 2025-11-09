const DictationAttempt = require('../models/DictationAttempt');
const Flashcard = require('../models/Flashcard');

/**
 * Calculate Levenshtein distance between two strings
 * Used for measuring edit distance between correct and user answers
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Normalize text for comparison
 * - Convert to lowercase
 * - Remove extra spaces
 * - Trim
 * - Optionally remove punctuation
 */
function normalizeText(text, removePunctuation = true) {
  let normalized = text.toLowerCase().trim();
  
  if (removePunctuation) {
    // Remove common punctuation but keep apostrophes for contractions
    normalized = normalized.replace(/[.,!?;:"()\[\]{}—–-]/g, '');
  }
  
  // Replace multiple spaces with single space
  normalized = normalized.replace(/\s+/g, ' ');
  
  return normalized;
}

/**
 * Analyze differences between correct and user answers
 * Returns detailed mistake information
 */
function analyzeMistakes(correctAnswer, userAnswer) {
  const correct = normalizeText(correctAnswer);
  const user = normalizeText(userAnswer);
  
  const correctWords = correct.split(' ');
  const userWords = user.split(' ');
  
  const mistakes = [];
  
  // Word-level comparison
  const maxLength = Math.max(correctWords.length, userWords.length);
  
  for (let i = 0; i < maxLength; i++) {
    const correctWord = correctWords[i] || '';
    const userWord = userWords[i] || '';
    
    if (correctWord && !userWord) {
      mistakes.push({
        type: 'missing',
        position: i,
        expected: correctWord,
        actual: ''
      });
    } else if (!correctWord && userWord) {
      mistakes.push({
        type: 'extra',
        position: i,
        expected: '',
        actual: userWord
      });
    } else if (correctWord !== userWord) {
      // Check if it's a typo (similar) or completely wrong
      const distance = levenshteinDistance(correctWord, userWord);
      const similarity = 1 - distance / Math.max(correctWord.length, userWord.length);
      
      mistakes.push({
        type: similarity > 0.5 ? 'typo' : 'wrong',
        position: i,
        expected: correctWord,
        actual: userWord
      });
    }
  }
  
  return mistakes;
}

/**
 * Calculate accuracy scores
 */
function calculateAccuracy(correctAnswer, userAnswer) {
  const correct = normalizeText(correctAnswer);
  const user = normalizeText(userAnswer);
  
  // Character-level accuracy
  const charDistance = levenshteinDistance(correct, user);
  const maxCharLength = Math.max(correct.length, user.length);
  const characterAccuracy = maxCharLength > 0 
    ? Math.round((1 - charDistance / maxCharLength) * 100) 
    : 0;
  
  // Word-level accuracy
  const correctWords = correct.split(' ');
  const userWords = user.split(' ');
  
  let correctWordCount = 0;
  const minLength = Math.min(correctWords.length, userWords.length);
  
  for (let i = 0; i < minLength; i++) {
    if (correctWords[i] === userWords[i]) {
      correctWordCount++;
    }
  }
  
  const wordAccuracy = correctWords.length > 0
    ? Math.round((correctWordCount / correctWords.length) * 100)
    : 0;
  
  // Overall accuracy (weighted average)
  const overallAccuracy = Math.round(characterAccuracy * 0.6 + wordAccuracy * 0.4);
  
  return {
    characterAccuracy,
    wordAccuracy,
    accuracy: overallAccuracy
  };
}

/**
 * Determine difficulty level based on text characteristics
 */
function determineDifficulty(text) {
  const wordCount = text.split(/\s+/).length;
  const avgWordLength = text.replace(/\s+/g, '').length / wordCount;
  const hasComplexPunctuation = /[;:—–]/.test(text);
  const hasNumbers = /\d/.test(text);
  
  let difficultyScore = 0;
  
  // Word count
  if (wordCount > 15) difficultyScore += 3;
  else if (wordCount > 8) difficultyScore += 2;
  else difficultyScore += 1;
  
  // Average word length
  if (avgWordLength > 6) difficultyScore += 2;
  else if (avgWordLength > 4) difficultyScore += 1;
  
  // Complexity
  if (hasComplexPunctuation) difficultyScore += 1;
  if (hasNumbers) difficultyScore += 1;
  
  // Determine level
  if (difficultyScore >= 6) return 'hard';
  if (difficultyScore >= 3) return 'medium';
  return 'easy';
}

/**
 * Validate and score a dictation answer
 */
async function validateDictationAnswer(flashcardId, userAnswer, options = {}) {
  const {
    playCount = 1,
    timeSpent = 0,
    audioSpeed = 1.0
  } = options;
  
  // Get flashcard
  const flashcard = await Flashcard.findById(flashcardId);
  if (!flashcard) {
    throw new Error('Flashcard không tồn tại');
  }
  
  const correctAnswer = flashcard.front; // Assuming front is the text to dictate
  
  // Calculate accuracy
  const accuracyScores = calculateAccuracy(correctAnswer, userAnswer);
  
  // Analyze mistakes
  const mistakes = analyzeMistakes(correctAnswer, userAnswer);
  
  // Determine difficulty
  const difficultyLevel = determineDifficulty(correctAnswer);
  
  // Determine if passed (80% threshold)
  const passed = accuracyScores.accuracy >= 80;
  
  return {
    correctAnswer,
    userAnswer,
    ...accuracyScores,
    mistakes,
    difficultyLevel,
    passed,
    playCount,
    timeSpent,
    audioSpeed
  };
}

/**
 * Save a dictation attempt
 */
async function saveDictationAttempt(userId, flashcardId, deckId, validationResult) {
  const attempt = new DictationAttempt({
    user: userId,
    flashcard: flashcardId,
    deck: deckId,
    ...validationResult
  });
  
  await attempt.save();
  return attempt;
}

/**
 * Get dictation exercise for a flashcard
 */
async function getDictationExercise(flashcardId) {
  const flashcard = await Flashcard.findById(flashcardId)
    .select('front back audioUrl example pronunciation ipa');
  
  if (!flashcard) {
    throw new Error('Flashcard không tồn tại');
  }
  
  // Determine difficulty
  const difficultyLevel = determineDifficulty(flashcard.front);
  
  // Calculate hints
  const wordCount = flashcard.front.split(/\s+/).length;
  const charCount = flashcard.front.length;
  
  return {
    flashcardId: flashcard._id,
    audioUrl: flashcard.audioUrl,
    example: flashcard.example,
    pronunciation: flashcard.pronunciation,
    ipa: flashcard.ipa,
    hints: {
      wordCount,
      charCount,
      difficultyLevel,
      firstLetter: flashcard.front.charAt(0).toLowerCase()
    },
    // Don't send the answer!
    // answer is hidden for the exercise
  };
}

/**
 * Get user's dictation statistics
 */
async function getUserDictationStats(userId, options = {}) {
  const stats = await DictationAttempt.getUserStats(userId, options);
  const commonMistakes = await DictationAttempt.getCommonMistakes(userId, 10);
  const difficultyStats = await DictationAttempt.getDifficultyStats(userId);
  
  // Calculate pass rate
  const passRate = stats.totalAttempts > 0
    ? Math.round((stats.passedAttempts / stats.totalAttempts) * 100)
    : 0;
  
  return {
    ...stats,
    passRate,
    commonMistakes,
    difficultyStats
  };
}

/**
 * Get dictation history for a user
 */
async function getDictationHistory(userId, options = {}) {
  const {
    deckId,
    limit = 20,
    skip = 0,
    sortBy = 'completedAt',
    sortOrder = 'desc'
  } = options;
  
  const query = { user: userId };
  if (deckId) query.deck = deckId;
  
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
  
  const [attempts, total] = await Promise.all([
    DictationAttempt.find(query)
      .populate('flashcard', 'front back audioUrl')
      .populate('deck', 'name')
      .sort(sort)
      .limit(limit)
      .skip(skip),
    DictationAttempt.countDocuments(query)
  ]);
  
  return {
    attempts,
    total,
    page: Math.floor(skip / limit) + 1,
    totalPages: Math.ceil(total / limit)
  };
}

module.exports = {
  levenshteinDistance,
  normalizeText,
  analyzeMistakes,
  calculateAccuracy,
  determineDifficulty,
  validateDictationAnswer,
  saveDictationAttempt,
  getDictationExercise,
  getUserDictationStats,
  getDictationHistory
};
