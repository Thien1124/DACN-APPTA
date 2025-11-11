const { WordbankEntry, UserWordbank, WordbankCollection } = require('../models/WordbankEntry');
const mongoose = require('mongoose');

/**
 * Helper function: Calculate next review date using SM-2 algorithm
 */
const calculateNextReview = (quality, easeFactor, reviewInterval) => {
  // SM-2 Algorithm
  // quality: 0-5 (how well user remembered)
  // easeFactor: difficulty multiplier (min 1.3)
  // reviewInterval: days since last review
  
  let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;
  
  let newInterval;
  if (quality < 3) {
    // Reset if failed
    newInterval = 1;
  } else {
    if (reviewInterval === 0) {
      newInterval = 1;
    } else if (reviewInterval === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(reviewInterval * newEaseFactor);
    }
  }
  
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
  
  return { newEaseFactor, newInterval, nextReviewDate };
};

/**
 * Search wordbank entries
 */
const searchWords = async (query, options = {}) => {
  const {
    page = 1,
    limit = 20,
    difficulty,
    topics,
    tags,
    minFrequency,
    maxFrequency,
    sortBy = 'frequency',
    sortOrder = 'desc'
  } = options;
  
  const filter = { isActive: true };
  
  // Text search
  if (query) {
    filter.$or = [
      { word: new RegExp(query, 'i') },
      { 'definitions.meaning': new RegExp(query, 'i') },
      { 'definitions.translation': new RegExp(query, 'i') }
    ];
  }
  
  // Difficulty filter
  if (difficulty) {
    filter.difficulty = difficulty;
  }
  
  // Topics filter
  if (topics && topics.length > 0) {
    filter.topics = { $in: Array.isArray(topics) ? topics : [topics] };
  }
  
  // Tags filter
  if (tags && tags.length > 0) {
    filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
  }
  
  // Frequency filter
  if (minFrequency !== undefined || maxFrequency !== undefined) {
    filter.frequency = {};
    if (minFrequency !== undefined) filter.frequency.$gte = minFrequency;
    if (maxFrequency !== undefined) filter.frequency.$lte = maxFrequency;
  }
  
  // Sort options
  const sortOptions = {};
  if (sortBy === 'frequency') {
    sortOptions.frequency = sortOrder === 'asc' ? 1 : -1;
  } else if (sortBy === 'word') {
    sortOptions.word = sortOrder === 'asc' ? 1 : -1;
  } else if (sortBy === 'difficulty') {
    sortOptions.difficulty = sortOrder === 'asc' ? 1 : -1;
  } else if (sortBy === 'popularity') {
    sortOptions.totalAddedToDecks = sortOrder === 'asc' ? 1 : -1;
  }
  
  const skip = (page - 1) * limit;
  
  const [words, total] = await Promise.all([
    WordbankEntry.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean(),
    WordbankEntry.countDocuments(filter)
  ]);
  
  return {
    words,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get word by ID with full details
 */
const getWordById = async (wordId) => {
  const word = await WordbankEntry.findById(wordId).lean();
  
  if (!word) {
    throw new Error('Word not found');
  }
  
  return word;
};

/**
 * Get words by topic
 */
const getWordsByTopic = async (topic, options = {}) => {
  return searchWords(null, { ...options, topics: topic });
};

/**
 * Get words by tag
 */
const getWordsByTag = async (tag, options = {}) => {
  return searchWords(null, { ...options, tags: tag });
};

/**
 * Get words by difficulty level
 */
const getWordsByDifficulty = async (difficulty, options = {}) => {
  return searchWords(null, { ...options, difficulty });
};

/**
 * Get related words (synonyms, antonyms, word families)
 */
const getRelatedWords = async (wordId) => {
  const word = await WordbankEntry.findById(wordId);
  
  if (!word) {
    throw new Error('Word not found');
  }
  
  const relatedWords = {
    synonyms: [],
    antonyms: [],
    wordFamilies: [],
    sameTopic: []
  };
  
  // Get synonyms
  if (word.synonyms && word.synonyms.length > 0) {
    relatedWords.synonyms = await WordbankEntry.find({
      word: { $in: word.synonyms }
    }).select('word definitions.meaning pronunciation.ipa').limit(10).lean();
  }
  
  // Get antonyms
  if (word.antonyms && word.antonyms.length > 0) {
    relatedWords.antonyms = await WordbankEntry.find({
      word: { $in: word.antonyms }
    }).select('word definitions.meaning pronunciation.ipa').limit(10).lean();
  }
  
  // Get words from same topic
  if (word.topics && word.topics.length > 0) {
    relatedWords.sameTopic = await WordbankEntry.find({
      topics: { $in: word.topics },
      _id: { $ne: wordId }
    }).select('word definitions.meaning topics').limit(15).lean();
  }
  
  return relatedWords;
};

/**
 * Get random words (for practice/discovery)
 */
const getRandomWords = async (count = 10, options = {}) => {
  const { difficulty, topics, tags } = options;
  
  const filter = { isActive: true };
  
  if (difficulty) filter.difficulty = difficulty;
  if (topics) filter.topics = { $in: Array.isArray(topics) ? topics : [topics] };
  if (tags) filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
  
  const words = await WordbankEntry.aggregate([
    { $match: filter },
    { $sample: { size: count } }
  ]);
  
  return words;
};

/**
 * Get all available topics
 */
const getAllTopics = async () => {
  const topics = await WordbankEntry.distinct('topics', { isActive: true });
  
  // Get word count for each topic
  const topicsWithCount = await Promise.all(
    topics.map(async (topic) => {
      const count = await WordbankEntry.countDocuments({ topics: topic, isActive: true });
      return { topic, count };
    })
  );
  
  return topicsWithCount.sort((a, b) => b.count - a.count);
};

/**
 * Get all available tags
 */
const getAllTags = async () => {
  const tags = await WordbankEntry.distinct('tags', { isActive: true });
  
  // Get word count for each tag
  const tagsWithCount = await Promise.all(
    tags.map(async (tag) => {
      const count = await WordbankEntry.countDocuments({ tags: tag, isActive: true });
      return { tag, count };
    })
  );
  
  return tagsWithCount.sort((a, b) => b.count - a.count);
};

/**
 * Add word to user's personal wordbank
 */
const addToPersonalWordbank = async (userId, wordId, options = {}) => {
  const word = await WordbankEntry.findById(wordId);
  
  if (!word) {
    throw new Error('Word not found');
  }
  
  // Check if already exists
  let userWord = await UserWordbank.findOne({ user: userId, word: wordId });
  
  if (userWord) {
    throw new Error('Word already in your wordbank');
  }
  
  // Create new entry
  userWord = new UserWordbank({
    user: userId,
    word: wordId,
    status: 'new',
    sourceContext: options.sourceContext || '',
    personalNotes: options.personalNotes || '',
    personalTags: options.personalTags || [],
    nextReviewDate: new Date()
  });
  
  await userWord.save();
  
  // Update word statistics
  await WordbankEntry.findByIdAndUpdate(wordId, {
    $inc: { totalAddedToDecks: 1 }
  });
  
  return userWord;
};

/**
 * Remove word from personal wordbank
 */
const removeFromPersonalWordbank = async (userId, wordId) => {
  const result = await UserWordbank.findOneAndDelete({ user: userId, word: wordId });
  
  if (!result) {
    throw new Error('Word not found in your wordbank');
  }
  
  // Update word statistics
  await WordbankEntry.findByIdAndUpdate(wordId, {
    $inc: { totalAddedToDecks: -1 }
  });
  
  return result;
};

/**
 * Get user's personal wordbank
 */
const getPersonalWordbank = async (userId, options = {}) => {
  const {
    page = 1,
    limit = 20,
    status,
    isFavorite,
    isPriority,
    sortBy = 'addedAt',
    sortOrder = 'desc'
  } = options;
  
  const filter = { user: userId };
  
  if (status) filter.status = status;
  if (isFavorite !== undefined) filter.isFavorite = isFavorite;
  if (isPriority !== undefined) filter.isPriority = isPriority;
  
  const sortOptions = {};
  if (sortBy === 'addedAt') {
    sortOptions.addedAt = sortOrder === 'asc' ? 1 : -1;
  } else if (sortBy === 'confidence') {
    sortOptions.confidence = sortOrder === 'asc' ? 1 : -1;
  } else if (sortBy === 'nextReview') {
    sortOptions.nextReviewDate = sortOrder === 'asc' ? 1 : -1;
  }
  
  const skip = (page - 1) * limit;
  
  const [words, total] = await Promise.all([
    UserWordbank.find(filter)
      .populate('word')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean(),
    UserWordbank.countDocuments(filter)
  ]);
  
  return {
    words,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Update user word progress
 */
const updateWordProgress = async (userId, wordId, progressData) => {
  const { isCorrect, timeSpent, quality } = progressData;
  
  const userWord = await UserWordbank.findOne({ user: userId, word: wordId });
  
  if (!userWord) {
    throw new Error('Word not found in your wordbank');
  }
  
  // Update counts
  userWord.timesReviewed += 1;
  if (isCorrect) {
    userWord.correctCount += 1;
  } else {
    userWord.incorrectCount += 1;
  }
  
  // Calculate confidence (percentage of correct answers)
  const totalAttempts = userWord.correctCount + userWord.incorrectCount;
  userWord.confidence = Math.round((userWord.correctCount / totalAttempts) * 100);
  
  // Update status based on confidence and review count
  if (userWord.confidence >= 90 && userWord.timesReviewed >= 5) {
    userWord.status = 'mastered';
  } else if (userWord.confidence >= 70 && userWord.timesReviewed >= 3) {
    userWord.status = 'reviewing';
  } else if (userWord.timesReviewed >= 1) {
    userWord.status = 'learning';
  }
  
  // Calculate next review date using SM-2
  if (quality !== undefined) {
    const { newEaseFactor, newInterval, nextReviewDate } = calculateNextReview(
      quality,
      userWord.easeFactor,
      userWord.reviewInterval
    );
    
    userWord.easeFactor = newEaseFactor;
    userWord.reviewInterval = newInterval;
    userWord.nextReviewDate = nextReviewDate;
  }
  
  userWord.lastReviewedAt = new Date();
  
  await userWord.save();
  
  return userWord;
};

/**
 * Get words due for review
 */
const getWordsForReview = async (userId, limit = 20) => {
  const words = await UserWordbank.find({
    user: userId,
    status: { $in: ['learning', 'reviewing'] },
    nextReviewDate: { $lte: new Date() }
  })
    .populate('word')
    .sort({ nextReviewDate: 1 })
    .limit(limit)
    .lean();
  
  return words;
};

/**
 * Update user word (notes, tags, etc.)
 */
const updateUserWord = async (userId, wordId, updates) => {
  const allowedUpdates = ['personalNotes', 'personalTags', 'isFavorite', 'isPriority', 'userRating'];
  const validUpdates = {};
  
  Object.keys(updates).forEach(key => {
    if (allowedUpdates.includes(key)) {
      validUpdates[key] = updates[key];
    }
  });
  
  const userWord = await UserWordbank.findOneAndUpdate(
    { user: userId, word: wordId },
    validUpdates,
    { new: true }
  ).populate('word');
  
  if (!userWord) {
    throw new Error('Word not found in your wordbank');
  }
  
  return userWord;
};

/**
 * Get user statistics
 */
const getUserStats = async (userId, options = {}) => {
  const { startDate, endDate } = options;
  
  const stats = await UserWordbank.getUserStats(userId);
  
  // Get recent activity
  const recentWords = await UserWordbank.find({ user: userId })
    .sort({ addedAt: -1 })
    .limit(10)
    .populate('word', 'word')
    .lean();
  
  return {
    ...stats,
    recentWords: recentWords.map(w => ({
      word: w.word.word,
      addedAt: w.addedAt,
      status: w.status
    }))
  };
};

/**
 * Get learning progress over time
 */
const getLearningProgress = async (userId, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const progress = await UserWordbank.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        addedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$addedAt' }
        },
        wordsAdded: { $sum: 1 },
        avgConfidence: { $avg: '$confidence' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
  
  return progress;
};

/**
 * Get suggested words for user (based on their level and interests)
 */
const getSuggestedWords = async (userId, limit = 10) => {
  // Get user's current words to understand their level and interests
  const userWords = await UserWordbank.find({ user: userId })
    .populate('word')
    .lean();
  
  if (userWords.length === 0) {
    // New user - suggest beginner words
    return getRandomWords(limit, { difficulty: 'A1' });
  }
  
  // Analyze user's topics and difficulty
  const topics = {};
  const difficulties = {};
  
  userWords.forEach(uw => {
    if (uw.word) {
      // Count topics
      if (uw.word.topics) {
        uw.word.topics.forEach(topic => {
          topics[topic] = (topics[topic] || 0) + 1;
        });
      }
      
      // Count difficulties
      if (uw.word.difficulty) {
        difficulties[uw.word.difficulty] = (difficulties[uw.word.difficulty] || 0) + 1;
      }
    }
  });
  
  // Get most common topic
  const topTopic = Object.keys(topics).sort((a, b) => topics[b] - topics[a])[0];
  
  // Get user's word IDs to exclude
  const userWordIds = userWords.map(uw => uw.word._id);
  
  // Suggest words from same topic that user doesn't have
  const suggestions = await WordbankEntry.find({
    _id: { $nin: userWordIds },
    topics: topTopic,
    isActive: true
  })
    .sort({ frequency: -1 })
    .limit(limit)
    .lean();
  
  return suggestions;
};

/**
 * Collections management
 */

/**
 * Get all collections
 */
const getCollections = async (options = {}) => {
  const { category, difficulty, page = 1, limit = 20 } = options;
  
  const filter = { isPublic: true };
  
  if (category) filter.category = category;
  if (difficulty) filter.difficulty = difficulty;
  
  const skip = (page - 1) * limit;
  
  const [collections, total] = await Promise.all([
    WordbankCollection.find(filter)
      .select('-words')
      .sort({ subscriberCount: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    WordbankCollection.countDocuments(filter)
  ]);
  
  return {
    collections,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get collection by ID with words
 */
const getCollectionById = async (collectionId) => {
  const collection = await WordbankCollection.findById(collectionId)
    .populate('words')
    .lean();
  
  if (!collection) {
    throw new Error('Collection not found');
  }
  
  return collection;
};

/**
 * Add all words from collection to user's wordbank
 */
const addCollectionToWordbank = async (userId, collectionId) => {
  const collection = await WordbankCollection.findById(collectionId);
  
  if (!collection) {
    throw new Error('Collection not found');
  }
  
  const results = {
    added: 0,
    skipped: 0,
    errors: []
  };
  
  for (const wordId of collection.words) {
    try {
      await addToPersonalWordbank(userId, wordId, {
        sourceContext: `Collection: ${collection.name}`
      });
      results.added++;
    } catch (error) {
      if (error.message === 'Word already in your wordbank') {
        results.skipped++;
      } else {
        results.errors.push({ wordId, error: error.message });
      }
    }
  }
  
  // Update subscriber count
  await WordbankCollection.findByIdAndUpdate(collectionId, {
    $inc: { subscriberCount: 1 }
  });
  
  return results;
};

/**
 * Export user's wordbank to JSON/CSV
 */
const exportWordbank = async (userId, format = 'json') => {
  const words = await UserWordbank.find({ user: userId })
    .populate('word')
    .lean();
  
  if (format === 'json') {
    return words;
  } else if (format === 'csv') {
    // Convert to CSV format
    const csv = words.map(w => {
      const word = w.word;
      return {
        word: word.word,
        definition: word.definitions[0]?.meaning || '',
        translation: word.definitions[0]?.translation || '',
        status: w.status,
        confidence: w.confidence,
        notes: w.personalNotes || ''
      };
    });
    
    return csv;
  }
  
  throw new Error('Unsupported format');
};

module.exports = {
  searchWords,
  getWordById,
  getWordsByTopic,
  getWordsByTag,
  getWordsByDifficulty,
  getRelatedWords,
  getRandomWords,
  getAllTopics,
  getAllTags,
  addToPersonalWordbank,
  removeFromPersonalWordbank,
  getPersonalWordbank,
  updateWordProgress,
  getWordsForReview,
  updateUserWord,
  getUserStats,
  getLearningProgress,
  getSuggestedWords,
  getCollections,
  getCollectionById,
  addCollectionToWordbank,
  exportWordbank
};
