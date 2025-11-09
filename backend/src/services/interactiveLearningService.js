const Flashcard = require('../models/Flashcard');
const {
  ImageMatchAttempt,
  MultipleChoiceAttempt,
  MatchingAttempt,
  SpellingBeeAttempt
} = require('../models/InteractiveLearning');

/**
 * ===============================================
 * IMAGE-WORD MATCHING SERVICE
 * ===============================================
 */

/**
 * Generate image-word matching game
 * @param {String} deckId - Deck ID
 * @param {Object} options - { count, difficulty }
 * @returns {Object} Game data
 */
exports.generateImageMatchGame = async (deckId, options = {}) => {
  const { count = 10, difficulty = 'medium' } = options;
  
  // Get flashcards with images
  const flashcards = await Flashcard.find({
    deck: deckId,
    imageUrl: { $exists: true, $ne: null }
  })
    .limit(count * 2) // Get more for randomization
    .select('front back imageUrl');
  
  if (flashcards.length < count) {
    throw new Error(`Không đủ flashcards với hình ảnh. Cần ${count}, có ${flashcards.length}`);
  }
  
  // Shuffle and pick
  const selectedCards = shuffleArray(flashcards).slice(0, count);
  
  // Create game data
  const images = selectedCards.map(card => ({
    flashcardId: card._id,
    imageUrl: card.imageUrl,
    correctWord: card.front
  }));
  
  // Create word options (correct + distractors)
  const allWords = flashcards.map(c => c.front);
  const words = selectedCards.map(card => card.front);
  const distractors = allWords.filter(w => !words.includes(w));
  
  // Add some distractors
  const wordOptions = [...words, ...shuffleArray(distractors).slice(0, Math.min(5, distractors.length))];
  
  return {
    gameId: Date.now().toString(),
    mode: 'image-match',
    difficulty,
    images: shuffleArray(images),
    wordOptions: shuffleArray(wordOptions),
    totalQuestions: count,
    timeLimit: count * 10 // 10 seconds per question
  };
};

/**
 * Submit image-word matching answers
 */
exports.submitImageMatch = async (userId, deckId, answers) => {
  // Get correct words from flashcards
  const flashcardIds = answers.map(a => a.flashcardId);
  const flashcards = await Flashcard.find({ _id: { $in: flashcardIds } }).select('_id front');
  
  // Create a map for quick lookup
  const flashcardMap = {};
  flashcards.forEach(fc => {
    flashcardMap[fc._id.toString()] = fc.front;
  });
  
  const attempt = new ImageMatchAttempt({
    user: userId,
    deck: deckId,
    flashcards: answers.map(a => a.flashcardId),
    answers: answers.map(answer => {
      const correctWord = flashcardMap[answer.flashcardId.toString()];
      return {
        flashcard: answer.flashcardId,
        selectedWord: answer.selectedWord,
        correctWord: correctWord,
        isCorrect: answer.selectedWord && correctWord && answer.selectedWord.toLowerCase().trim() === correctWord.toLowerCase().trim(),
        timeSpent: answer.timeTaken || 0
      };
    }),
    totalQuestions: answers.length,
    timeSpent: answers.reduce((sum, a) => sum + (a.timeTaken || 0), 0)
  });
  
  await attempt.save();
  
  return {
    attemptId: attempt._id,
    score: attempt.score,
    accuracy: attempt.accuracy,
    correctAnswers: attempt.correctAnswers,
    totalQuestions: attempt.totalQuestions,
    timeSpent: attempt.timeSpent,
    answers: attempt.answers
  };
};

/**
 * ===============================================
 * MULTIPLE CHOICE SERVICE
 * ===============================================
 */

/**
 * Generate multiple choice quiz
 */
exports.generateMultipleChoiceQuiz = async (deckId, options = {}) => {
  const { count = 10, questionType = 'word-to-meaning', difficulty = 'medium' } = options;
  
  // Get flashcards
  const flashcards = await Flashcard.find({ deck: deckId })
    .limit(count * 3) // Get more for distractors
    .select('front back imageUrl audioUrl');
  
  if (flashcards.length < count) {
    throw new Error(`Không đủ flashcards. Cần ${count}, có ${flashcards.length}`);
  }
  
  // Shuffle and pick questions
  const selectedCards = shuffleArray(flashcards).slice(0, count);
  const allCards = flashcards;
  
  // Generate questions
  const questions = selectedCards.map(card => {
    let question, correctAnswer, distractors;
    
    switch (questionType) {
      case 'word-to-meaning':
        question = card.front;
        correctAnswer = card.back;
        distractors = allCards
          .filter(c => c._id.toString() !== card._id.toString())
          .map(c => c.back);
        break;
        
      case 'meaning-to-word':
        question = card.back;
        correctAnswer = card.front;
        distractors = allCards
          .filter(c => c._id.toString() !== card._id.toString())
          .map(c => c.front);
        break;
        
      case 'image-to-word':
        if (!card.imageUrl) return null;
        question = card.imageUrl;
        correctAnswer = card.front;
        distractors = allCards
          .filter(c => c._id.toString() !== card._id.toString())
          .map(c => c.front);
        break;
        
      case 'audio-to-word':
        if (!card.audioUrl) return null;
        question = card.audioUrl;
        correctAnswer = card.front;
        distractors = allCards
          .filter(c => c._id.toString() !== card._id.toString())
          .map(c => c.front);
        break;
        
      default:
        question = card.front;
        correctAnswer = card.back;
        distractors = allCards
          .filter(c => c._id.toString() !== card._id.toString())
          .map(c => c.back);
    }
    
    // Pick 3 random distractors
    const selectedDistractors = shuffleArray(distractors).slice(0, 3);
    
    // Create 4 options
    const options = shuffleArray([correctAnswer, ...selectedDistractors]);
    
    return {
      flashcardId: card._id,
      questionType,
      question,
      options,
      correctAnswer
    };
  }).filter(q => q !== null); // Remove null questions
  
  return {
    gameId: Date.now().toString(),
    mode: 'multiple-choice',
    difficulty,
    questions,
    totalQuestions: questions.length,
    timeLimit: questions.length * 15 // 15 seconds per question
  };
};

/**
 * Submit multiple choice answers
 */
exports.submitMultipleChoice = async (userId, deckId, questions) => {
  const attempt = new MultipleChoiceAttempt({
    user: userId,
    deck: deckId,
    questions: questions.map(q => ({
      flashcard: q.flashcardId,
      questionType: q.questionType,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      selectedAnswer: q.selectedAnswer,
      isCorrect: q.selectedAnswer === q.correctAnswer,
      timeSpent: q.timeSpent || 0
    })),
    totalQuestions: questions.length,
    timeSpent: questions.reduce((sum, q) => sum + (q.timeSpent || 0), 0) / 1000
  });
  
  await attempt.save();
  
  return {
    attemptId: attempt._id,
    score: attempt.score,
    accuracy: attempt.accuracy,
    correctAnswers: attempt.correctAnswers,
    totalQuestions: attempt.totalQuestions,
    timeSpent: attempt.timeSpent,
    questions: attempt.questions
  };
};

/**
 * ===============================================
 * MATCHING PAIRS SERVICE
 * ===============================================
 */

/**
 * Generate matching pairs game
 */
exports.generateMatchingGame = async (deckId, options = {}) => {
  const { count = 6, matchType = 'word-meaning', difficulty = 'medium' } = options;
  
  // Get flashcards
  const flashcards = await Flashcard.find({ deck: deckId })
    .limit(count)
    .select('front back imageUrl audioUrl');
  
  if (flashcards.length < count) {
    throw new Error(`Không đủ flashcards. Cần ${count}, có ${flashcards.length}`);
  }
  
  // Create pairs based on type
  const pairs = flashcards.map(card => {
    let leftItem, rightItem, leftType, rightType;
    
    switch (matchType) {
      case 'word-meaning':
        leftItem = card.front;
        rightItem = card.back;
        leftType = 'word';
        rightType = 'meaning';
        break;
        
      case 'image-word':
        leftItem = card.imageUrl || card.front;
        rightItem = card.front;
        leftType = card.imageUrl ? 'image' : 'word';
        rightType = 'word';
        break;
        
      case 'audio-word':
        leftItem = card.audioUrl || card.front;
        rightItem = card.front;
        leftType = card.audioUrl ? 'audio' : 'word';
        rightType = 'word';
        break;
        
      default:
        leftItem = card.front;
        rightItem = card.back;
        leftType = 'word';
        rightType = 'meaning';
    }
    
    return {
      flashcardId: card._id,
      leftItem,
      rightItem,
      leftType,
      rightType
    };
  });
  
  // Shuffle right items
  const leftItems = pairs.map((p, index) => ({ ...p, originalIndex: index }));
  const rightItems = shuffleArray([...pairs]).map((p, index) => ({ 
    ...p, 
    shuffledIndex: index 
  }));
  
  return {
    gameId: Date.now().toString(),
    mode: 'matching',
    difficulty,
    leftItems: leftItems.map(item => ({
      index: item.originalIndex,
      content: item.leftItem,
      type: item.leftType,
      flashcardId: item.flashcardId
    })),
    rightItems: rightItems.map(item => ({
      index: item.shuffledIndex,
      content: item.rightItem,
      type: item.rightType,
      flashcardId: item.flashcardId
    })),
    totalPairs: pairs.length,
    timeLimit: pairs.length * 20 // 20 seconds per pair
  };
};

/**
 * Submit matching answers
 */
exports.submitMatching = async (userId, deckId, data) => {
  const { pairs, matches } = data;
  
  const attempt = new MatchingAttempt({
    user: userId,
    deck: deckId,
    pairs: pairs.map(p => ({
      flashcard: p.flashcardId,
      leftItem: p.leftItem,
      rightItem: p.rightItem,
      leftType: p.leftType,
      rightType: p.rightType
    })),
    matches: matches.map(m => ({
      leftIndex: m.leftIndex,
      rightIndex: m.rightIndex,
      isCorrect: m.isCorrect,
      attempts: m.attempts || 1
    })),
    totalPairs: pairs.length,
    totalAttempts: matches.reduce((sum, m) => sum + (m.attempts || 1), 0),
    timeSpent: data.timeSpent || 0
  });
  
  await attempt.save();
  
  return {
    attemptId: attempt._id,
    score: attempt.score,
    accuracy: attempt.accuracy,
    correctMatches: attempt.correctMatches,
    totalPairs: attempt.totalPairs,
    totalAttempts: attempt.totalAttempts,
    timeSpent: attempt.timeSpent
  };
};

/**
 * ===============================================
 * SPELLING BEE SERVICE
 * ===============================================
 */

/**
 * Generate spelling bee game
 */
exports.generateSpellingBee = async (deckId, options = {}) => {
  const { count = 10, difficulty = 'medium' } = options;
  
  // Get flashcards with audio
  let flashcards = await Flashcard.find({
    deck: deckId,
    audioUrl: { $exists: true, $ne: null }
  })
    .limit(count)
    .select('front back audioUrl pronunciation ipa');
  
  // Fallback: if not enough with audio, get all
  if (flashcards.length < count) {
    flashcards = await Flashcard.find({ deck: deckId })
      .limit(count)
      .select('front back audioUrl pronunciation ipa');
  }
  
  if (flashcards.length === 0) {
    throw new Error('Không có flashcards trong deck này');
  }
  
  // Create words list
  const words = flashcards.map(card => ({
    flashcardId: card._id,
    audioUrl: card.audioUrl,
    wordLength: card.front.length,
    firstLetter: card.front.charAt(0).toUpperCase(),
    definition: card.back,
    pronunciation: card.pronunciation || card.ipa,
    // Don't send correct word to client
    _correctWord: card.front // Will be removed before sending
  }));
  
  return {
    gameId: Date.now().toString(),
    mode: 'spelling-bee',
    difficulty,
    words: words.map(({ _correctWord, ...word }) => word), // Remove correct answer
    totalWords: words.length,
    maxAttemptsPerWord: 3,
    timeLimit: words.length * 30 // 30 seconds per word
  };
};

/**
 * Check spelling
 */
exports.checkSpelling = async (flashcardId, userSpelling) => {
  const flashcard = await Flashcard.findById(flashcardId).select('front');
  
  if (!flashcard) {
    throw new Error('Flashcard không tồn tại');
  }
  
  const correctWord = flashcard.front.toLowerCase().trim();
  const userWord = userSpelling.toLowerCase().trim();
  
  const isCorrect = correctWord === userWord;
  
  // Calculate similarity for feedback
  const similarity = calculateSimilarity(correctWord, userWord);
  
  return {
    isCorrect,
    correctWord: isCorrect ? flashcard.front : null, // Only reveal if correct
    similarity,
    feedback: getFeedback(isCorrect, similarity)
  };
};

/**
 * Submit spelling bee answers
 */
exports.submitSpellingBee = async (userId, deckId, words) => {
  const attempt = new SpellingBeeAttempt({
    user: userId,
    deck: deckId,
    words: words.map(w => ({
      flashcard: w.flashcardId,
      correctWord: w.correctWord,
      userSpelling: w.userSpelling,
      isCorrect: w.isCorrect,
      attempts: w.attempts || 1,
      hints: w.hints || [],
      timeSpent: w.timeSpent || 0,
      audioPlayCount: w.audioPlayCount || 1
    })),
    totalWords: words.length,
    timeSpent: words.reduce((sum, w) => sum + (w.timeSpent || 0), 0) / 1000
  });
  
  await attempt.save();
  
  return {
    attemptId: attempt._id,
    score: attempt.score,
    accuracy: attempt.accuracy,
    correctWords: attempt.correctWords,
    perfectWords: attempt.perfectWords,
    totalWords: attempt.totalWords,
    timeSpent: attempt.timeSpent
  };
};

/**
 * ===============================================
 * STATISTICS & LEADERBOARD
 * ===============================================
 */

/**
 * Get user statistics for all game modes
 */
exports.getUserStats = async (userId, options = {}) => {
  const { deckId } = options;
  
  const [imageMatchStats, multipleChoiceStats, matchingStats, spellingBeeStats] = await Promise.all([
    ImageMatchAttempt.getUserStats(userId, options),
    MultipleChoiceAttempt.getUserStats(userId, options),
    MatchingAttempt.getUserStats(userId, options),
    SpellingBeeAttempt.getUserStats(userId, options)
  ]);
  
  return {
    imageMatch: imageMatchStats,
    multipleChoice: multipleChoiceStats,
    matching: matchingStats,
    spellingBee: spellingBeeStats,
    overall: {
      totalGames: 
        imageMatchStats.totalAttempts + 
        multipleChoiceStats.totalAttempts + 
        matchingStats.totalAttempts + 
        spellingBeeStats.totalAttempts,
      averageScore: (
        imageMatchStats.averageScore + 
        multipleChoiceStats.averageScore + 
        matchingStats.averageScore + 
        spellingBeeStats.averageScore
      ) / 4,
      totalTimeSpent: 
        imageMatchStats.totalTimeSpent + 
        multipleChoiceStats.totalTimeSpent + 
        matchingStats.totalTimeSpent + 
        spellingBeeStats.totalTimeSpent
    }
  };
};

/**
 * ===============================================
 * HELPER FUNCTIONS
 * ===============================================
 */

/**
 * Shuffle array
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Calculate string similarity (Levenshtein distance)
 */
function calculateSimilarity(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = [];
  
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  const similarity = ((maxLen - distance) / maxLen) * 100;
  
  return Math.round(similarity);
}

/**
 * Get feedback based on correctness and similarity
 */
function getFeedback(isCorrect, similarity) {
  if (isCorrect) {
    return '🎉 Perfect! Correct spelling!';
  }
  
  if (similarity >= 80) {
    return '👍 Very close! Check your spelling again.';
  } else if (similarity >= 60) {
    return '💪 Good try! You\'re on the right track.';
  } else if (similarity >= 40) {
    return '📚 Not quite. Listen to the audio again.';
  } else {
    return '🎯 Try again! Use a hint if needed.';
  }
}

module.exports = exports;
