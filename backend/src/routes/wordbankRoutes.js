const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const wordbankController = require('../controllers/wordbankController');

/**
 * @route   GET /api/wordbank/search
 * @desc    Search wordbank entries with filters
 * @access  Public
 * @query   q, page, limit, difficulty, topics, tags, minFrequency, maxFrequency, sortBy, sortOrder
 */
router.get('/search', wordbankController.searchWords);

/**
 * @route   GET /api/wordbank/words/:wordId
 * @desc    Get word details by ID
 * @access  Public
 */
router.get('/words/:wordId', wordbankController.getWord);

/**
 * @route   GET /api/wordbank/words/:wordId/related
 * @desc    Get related words (synonyms, antonyms, word families, same topic)
 * @access  Public
 */
router.get('/words/:wordId/related', wordbankController.getRelatedWords);

/**
 * @route   GET /api/wordbank/topics
 * @desc    Get all available topics with word counts
 * @access  Public
 */
router.get('/topics', wordbankController.getAllTopics);

/**
 * @route   GET /api/wordbank/topics/:topic
 * @desc    Get words by topic
 * @access  Public
 * @query   page, limit, difficulty, sortBy, sortOrder
 */
router.get('/topics/:topic', wordbankController.getWordsByTopic);

/**
 * @route   GET /api/wordbank/tags
 * @desc    Get all available tags with word counts
 * @access  Public
 */
router.get('/tags', wordbankController.getAllTags);

/**
 * @route   GET /api/wordbank/tags/:tag
 * @desc    Get words by tag
 * @access  Public
 * @query   page, limit, difficulty, sortBy, sortOrder
 */
router.get('/tags/:tag', wordbankController.getWordsByTag);

/**
 * @route   GET /api/wordbank/difficulty/:level
 * @desc    Get words by difficulty level (A1, A2, B1, B2, C1, C2)
 * @access  Public
 * @query   page, limit, topics, tags, sortBy, sortOrder
 */
router.get('/difficulty/:level', wordbankController.getWordsByDifficulty);

/**
 * @route   GET /api/wordbank/random
 * @desc    Get random words for discovery
 * @access  Public
 * @query   count, difficulty, topics, tags
 */
router.get('/random', wordbankController.getRandomWords);

/**
 * @route   GET /api/wordbank/collections
 * @desc    Get all word collections
 * @access  Public
 * @query   category, difficulty, page, limit
 */
router.get('/collections', wordbankController.getCollections);

/**
 * @route   GET /api/wordbank/collections/:collectionId
 * @desc    Get collection details with all words
 * @access  Public
 */
router.get('/collections/:collectionId', wordbankController.getCollection);

/**
 * @route   POST /api/wordbank/collections/:collectionId/subscribe
 * @desc    Add all words from a collection to personal wordbank
 * @access  Private
 */
router.post('/collections/:collectionId/subscribe', protect, wordbankController.addCollectionToWordbank);

/**
 * @route   GET /api/wordbank/my-words
 * @desc    Get user's personal wordbank
 * @access  Private
 * @query   page, limit, status, isFavorite, isPriority, sortBy, sortOrder
 */
router.get('/my-words', protect, wordbankController.getPersonalWordbank);

/**
 * @route   POST /api/wordbank/my-words/:wordId
 * @desc    Add word to personal wordbank
 * @access  Private
 * @body    sourceContext, personalNotes, personalTags
 */
router.post('/my-words/:wordId', protect, wordbankController.addToPersonalWordbank);

/**
 * @route   DELETE /api/wordbank/my-words/:wordId
 * @desc    Remove word from personal wordbank
 * @access  Private
 */
router.delete('/my-words/:wordId', protect, wordbankController.removeFromPersonalWordbank);

/**
 * @route   PUT /api/wordbank/my-words/:wordId
 * @desc    Update user word (notes, tags, favorite, priority, rating)
 * @access  Private
 * @body    personalNotes, personalTags, isFavorite, isPriority, userRating
 */
router.put('/my-words/:wordId', protect, wordbankController.updateUserWord);

/**
 * @route   POST /api/wordbank/my-words/:wordId/progress
 * @desc    Update word learning progress
 * @access  Private
 * @body    isCorrect, timeSpent, quality (0-5 for SM-2 algorithm)
 */
router.post('/my-words/:wordId/progress', protect, wordbankController.updateWordProgress);

/**
 * @route   GET /api/wordbank/my-words/review
 * @desc    Get words due for review
 * @access  Private
 * @query   limit
 */
router.get('/my-words/review', protect, wordbankController.getWordsForReview);

/**
 * @route   GET /api/wordbank/stats
 * @desc    Get user's wordbank statistics
 * @access  Private
 * @query   startDate, endDate
 */
router.get('/stats', protect, wordbankController.getUserStats);

/**
 * @route   GET /api/wordbank/progress
 * @desc    Get learning progress over time
 * @access  Private
 * @query   days (default 30)
 */
router.get('/progress', protect, wordbankController.getLearningProgress);

/**
 * @route   GET /api/wordbank/suggestions
 * @desc    Get personalized word suggestions based on user's learning history
 * @access  Private
 * @query   limit
 */
router.get('/suggestions', protect, wordbankController.getSuggestedWords);

/**
 * @route   GET /api/wordbank/export
 * @desc    Export personal wordbank
 * @access  Private
 * @query   format (json or csv)
 */
router.get('/export', protect, wordbankController.exportWordbank);

module.exports = router;
