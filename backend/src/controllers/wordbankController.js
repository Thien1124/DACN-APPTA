const wordbankService = require('../services/wordbankService');

/**
 * @desc    Search wordbank entries
 * @route   GET /api/wordbank/search
 * @access  Public
 */
const searchWords = async (req, res) => {
  try {
    const { q, page, limit, difficulty, topics, tags, minFrequency, maxFrequency, sortBy, sortOrder } = req.query;
    
    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      difficulty,
      topics: topics ? topics.split(',') : undefined,
      tags: tags ? tags.split(',') : undefined,
      minFrequency: minFrequency ? parseInt(minFrequency) : undefined,
      maxFrequency: maxFrequency ? parseInt(maxFrequency) : undefined,
      sortBy: sortBy || 'frequency',
      sortOrder: sortOrder || 'desc'
    };
    
    const result = await wordbankService.searchWords(q, options);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error searching words:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching words',
      error: error.message
    });
  }
};

/**
 * @desc    Get word by ID
 * @route   GET /api/wordbank/words/:wordId
 * @access  Public
 */
const getWord = async (req, res) => {
  try {
    const { wordId } = req.params;
    
    const word = await wordbankService.getWordById(wordId);
    
    res.status(200).json({
      success: true,
      data: word
    });
  } catch (error) {
    console.error('Error getting word:', error);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get words by topic
 * @route   GET /api/wordbank/topics/:topic
 * @access  Public
 */
const getWordsByTopic = async (req, res) => {
  try {
    const { topic } = req.params;
    const { page, limit, difficulty, sortBy, sortOrder } = req.query;
    
    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      difficulty,
      sortBy: sortBy || 'frequency',
      sortOrder: sortOrder || 'desc'
    };
    
    const result = await wordbankService.getWordsByTopic(topic, options);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting words by topic:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting words by topic',
      error: error.message
    });
  }
};

/**
 * @desc    Get words by tag
 * @route   GET /api/wordbank/tags/:tag
 * @access  Public
 */
const getWordsByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const { page, limit, difficulty, sortBy, sortOrder } = req.query;
    
    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      difficulty,
      sortBy: sortBy || 'frequency',
      sortOrder: sortOrder || 'desc'
    };
    
    const result = await wordbankService.getWordsByTag(tag, options);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting words by tag:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting words by tag',
      error: error.message
    });
  }
};

/**
 * @desc    Get words by difficulty
 * @route   GET /api/wordbank/difficulty/:level
 * @access  Public
 */
const getWordsByDifficulty = async (req, res) => {
  try {
    const { level } = req.params;
    const { page, limit, topics, tags, sortBy, sortOrder } = req.query;
    
    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      topics: topics ? topics.split(',') : undefined,
      tags: tags ? tags.split(',') : undefined,
      sortBy: sortBy || 'frequency',
      sortOrder: sortOrder || 'desc'
    };
    
    const result = await wordbankService.getWordsByDifficulty(level, options);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting words by difficulty:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting words by difficulty',
      error: error.message
    });
  }
};

/**
 * @desc    Get related words
 * @route   GET /api/wordbank/words/:wordId/related
 * @access  Public
 */
const getRelatedWords = async (req, res) => {
  try {
    const { wordId } = req.params;
    
    const relatedWords = await wordbankService.getRelatedWords(wordId);
    
    res.status(200).json({
      success: true,
      data: relatedWords
    });
  } catch (error) {
    console.error('Error getting related words:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get random words
 * @route   GET /api/wordbank/random
 * @access  Public
 */
const getRandomWords = async (req, res) => {
  try {
    const { count, difficulty, topics, tags } = req.query;
    
    const options = {
      difficulty,
      topics: topics ? topics.split(',') : undefined,
      tags: tags ? tags.split(',') : undefined
    };
    
    const words = await wordbankService.getRandomWords(parseInt(count) || 10, options);
    
    res.status(200).json({
      success: true,
      data: words
    });
  } catch (error) {
    console.error('Error getting random words:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting random words',
      error: error.message
    });
  }
};

/**
 * @desc    Get all topics
 * @route   GET /api/wordbank/topics
 * @access  Public
 */
const getAllTopics = async (req, res) => {
  try {
    const topics = await wordbankService.getAllTopics();
    
    res.status(200).json({
      success: true,
      data: topics
    });
  } catch (error) {
    console.error('Error getting topics:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting topics',
      error: error.message
    });
  }
};

/**
 * @desc    Get all tags
 * @route   GET /api/wordbank/tags
 * @access  Public
 */
const getAllTags = async (req, res) => {
  try {
    const tags = await wordbankService.getAllTags();
    
    res.status(200).json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('Error getting tags:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting tags',
      error: error.message
    });
  }
};

/**
 * @desc    Add word to personal wordbank
 * @route   POST /api/wordbank/my-words/:wordId
 * @access  Private
 */
const addToPersonalWordbank = async (req, res) => {
  try {
    const { wordId } = req.params;
    const userId = req.user._id;
    const { sourceContext, personalNotes, personalTags } = req.body;
    
    const userWord = await wordbankService.addToPersonalWordbank(userId, wordId, {
      sourceContext,
      personalNotes,
      personalTags
    });
    
    res.status(201).json({
      success: true,
      message: 'Word added to your wordbank',
      data: userWord
    });
  } catch (error) {
    console.error('Error adding word to wordbank:', error);
    const statusCode = error.message === 'Word not found' ? 404 : 
                       error.message === 'Word already in your wordbank' ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Remove word from personal wordbank
 * @route   DELETE /api/wordbank/my-words/:wordId
 * @access  Private
 */
const removeFromPersonalWordbank = async (req, res) => {
  try {
    const { wordId } = req.params;
    const userId = req.user._id;
    
    await wordbankService.removeFromPersonalWordbank(userId, wordId);
    
    res.status(200).json({
      success: true,
      message: 'Word removed from your wordbank'
    });
  } catch (error) {
    console.error('Error removing word from wordbank:', error);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get personal wordbank
 * @route   GET /api/wordbank/my-words
 * @access  Private
 */
const getPersonalWordbank = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page, limit, status, isFavorite, isPriority, sortBy, sortOrder } = req.query;
    
    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      status,
      isFavorite: isFavorite === 'true' ? true : isFavorite === 'false' ? false : undefined,
      isPriority: isPriority === 'true' ? true : isPriority === 'false' ? false : undefined,
      sortBy: sortBy || 'addedAt',
      sortOrder: sortOrder || 'desc'
    };
    
    const result = await wordbankService.getPersonalWordbank(userId, options);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting personal wordbank:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting personal wordbank',
      error: error.message
    });
  }
};

/**
 * @desc    Update word progress
 * @route   POST /api/wordbank/my-words/:wordId/progress
 * @access  Private
 */
const updateWordProgress = async (req, res) => {
  try {
    const { wordId } = req.params;
    const userId = req.user._id;
    const { isCorrect, timeSpent, quality } = req.body;
    
    const userWord = await wordbankService.updateWordProgress(userId, wordId, {
      isCorrect,
      timeSpent,
      quality
    });
    
    res.status(200).json({
      success: true,
      message: 'Progress updated',
      data: userWord
    });
  } catch (error) {
    console.error('Error updating word progress:', error);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get words due for review
 * @route   GET /api/wordbank/my-words/review
 * @access  Private
 */
const getWordsForReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit } = req.query;
    
    const words = await wordbankService.getWordsForReview(userId, parseInt(limit) || 20);
    
    res.status(200).json({
      success: true,
      data: words
    });
  } catch (error) {
    console.error('Error getting words for review:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting words for review',
      error: error.message
    });
  }
};

/**
 * @desc    Update user word (notes, tags, etc.)
 * @route   PUT /api/wordbank/my-words/:wordId
 * @access  Private
 */
const updateUserWord = async (req, res) => {
  try {
    const { wordId } = req.params;
    const userId = req.user._id;
    const updates = req.body;
    
    const userWord = await wordbankService.updateUserWord(userId, wordId, updates);
    
    res.status(200).json({
      success: true,
      message: 'Word updated',
      data: userWord
    });
  } catch (error) {
    console.error('Error updating user word:', error);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get user statistics
 * @route   GET /api/wordbank/stats
 * @access  Private
 */
const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;
    
    const stats = await wordbankService.getUserStats(userId, { startDate, endDate });
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user stats',
      error: error.message
    });
  }
};

/**
 * @desc    Get learning progress over time
 * @route   GET /api/wordbank/progress
 * @access  Private
 */
const getLearningProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { days } = req.query;
    
    const progress = await wordbankService.getLearningProgress(userId, parseInt(days) || 30);
    
    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error getting learning progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting learning progress',
      error: error.message
    });
  }
};

/**
 * @desc    Get suggested words
 * @route   GET /api/wordbank/suggestions
 * @access  Private
 */
const getSuggestedWords = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit } = req.query;
    
    const suggestions = await wordbankService.getSuggestedWords(userId, parseInt(limit) || 10);
    
    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Error getting suggested words:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting suggested words',
      error: error.message
    });
  }
};

/**
 * @desc    Get all collections
 * @route   GET /api/wordbank/collections
 * @access  Public
 */
const getCollections = async (req, res) => {
  try {
    const { category, difficulty, page, limit } = req.query;
    
    const options = {
      category,
      difficulty,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    };
    
    const result = await wordbankService.getCollections(options);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting collections:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting collections',
      error: error.message
    });
  }
};

/**
 * @desc    Get collection by ID
 * @route   GET /api/wordbank/collections/:collectionId
 * @access  Public
 */
const getCollection = async (req, res) => {
  try {
    const { collectionId } = req.params;
    
    const collection = await wordbankService.getCollectionById(collectionId);
    
    res.status(200).json({
      success: true,
      data: collection
    });
  } catch (error) {
    console.error('Error getting collection:', error);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Add collection to personal wordbank
 * @route   POST /api/wordbank/collections/:collectionId/subscribe
 * @access  Private
 */
const addCollectionToWordbank = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const userId = req.user._id;
    
    const result = await wordbankService.addCollectionToWordbank(userId, collectionId);
    
    res.status(200).json({
      success: true,
      message: 'Collection added to your wordbank',
      data: result
    });
  } catch (error) {
    console.error('Error adding collection to wordbank:', error);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Export personal wordbank
 * @route   GET /api/wordbank/export
 * @access  Private
 */
const exportWordbank = async (req, res) => {
  try {
    const userId = req.user._id;
    const { format } = req.query;
    
    const data = await wordbankService.exportWordbank(userId, format || 'json');
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=wordbank.csv');
      
      // Convert to CSV string
      const headers = Object.keys(data[0] || {}).join(',');
      const rows = data.map(row => Object.values(row).join(',')).join('\n');
      res.send(`${headers}\n${rows}`);
    } else {
      res.status(200).json({
        success: true,
        data
      });
    }
  } catch (error) {
    console.error('Error exporting wordbank:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting wordbank',
      error: error.message
    });
  }
};

module.exports = {
  searchWords,
  getWord,
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
  getCollection,
  addCollectionToWordbank,
  exportWordbank
};
