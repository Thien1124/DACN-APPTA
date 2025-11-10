const express = require('express');
const router = express.Router();
const interactiveLearningController = require('../controllers/interactiveLearningController');
const { protect } = require('../middleware/auth');

/**
 * ===============================================
 * IMAGE-WORD MATCHING ROUTES
 * ===============================================
 */

/**
 * @route   POST /api/interactive/image-match/:deckId/start
 * @desc    Start image-word matching game
 * @access  Private
 * @body    { count, difficulty }
 */
router.post('/image-match/:deckId/start', protect, interactiveLearningController.startImageMatch);

/**
 * @route   POST /api/interactive/image-match/:deckId/submit
 * @desc    Submit image-word matching answers
 * @access  Private
 * @body    { answers }
 */
router.post('/image-match/:deckId/submit', protect, interactiveLearningController.submitImageMatch);

/**
 * ===============================================
 * MULTIPLE CHOICE ROUTES
 * ===============================================
 */

/**
 * @route   POST /api/interactive/multiple-choice/:deckId/start
 * @desc    Start multiple choice quiz
 * @access  Private
 * @body    { count, questionType, difficulty }
 */
router.post('/multiple-choice/:deckId/start', protect, interactiveLearningController.startMultipleChoice);

/**
 * @route   POST /api/interactive/multiple-choice/:deckId/submit
 * @desc    Submit multiple choice answers
 * @access  Private
 * @body    { questions }
 */
router.post('/multiple-choice/:deckId/submit', protect, interactiveLearningController.submitMultipleChoice);

/**
 * ===============================================
 * MATCHING PAIRS ROUTES
 * ===============================================
 */

/**
 * @route   POST /api/interactive/matching/:deckId/start
 * @desc    Start matching pairs game
 * @access  Private
 * @body    { count, matchType, difficulty }
 */
router.post('/matching/:deckId/start', protect, interactiveLearningController.startMatching);

/**
 * @route   POST /api/interactive/matching/:deckId/submit
 * @desc    Submit matching pairs answers
 * @access  Private
 * @body    { pairs, matches, timeSpent }
 */
router.post('/matching/:deckId/submit', protect, interactiveLearningController.submitMatching);

/**
 * ===============================================
 * SPELLING BEE ROUTES
 * ===============================================
 */

/**
 * @route   POST /api/interactive/spelling-bee/:deckId/start
 * @desc    Start spelling bee game
 * @access  Private
 * @body    { count, difficulty }
 */
router.post('/spelling-bee/:deckId/start', protect, interactiveLearningController.startSpellingBee);

/**
 * @route   POST /api/interactive/spelling-bee/check
 * @desc    Check spelling for a word
 * @access  Private
 * @body    { flashcardId, userSpelling }
 */
router.post('/spelling-bee/check', protect, interactiveLearningController.checkSpelling);

/**
 * @route   POST /api/interactive/spelling-bee/:deckId/submit
 * @desc    Submit spelling bee answers
 * @access  Private
 * @body    { words }
 */
router.post('/spelling-bee/:deckId/submit', protect, interactiveLearningController.submitSpellingBee);

/**
 * ===============================================
 * STATISTICS & HISTORY ROUTES
 * ===============================================
 */

/**
 * @route   GET /api/interactive/stats
 * @desc    Get user statistics for all game modes
 * @access  Private
 * @query   ?deckId=xxx
 */
router.get('/stats', protect, interactiveLearningController.getStats);

/**
 * @route   GET /api/interactive/history/:gameType
 * @desc    Get game history by type
 * @access  Private
 * @query   ?deckId=xxx&limit=20&page=1
 */
router.get('/history/:gameType', protect, interactiveLearningController.getHistory);

/**
 * @route   GET /api/interactive/attempt/:gameType/:attemptId
 * @desc    Get specific attempt details
 * @access  Private
 */
router.get('/attempt/:gameType/:attemptId', protect, interactiveLearningController.getAttemptDetail);

module.exports = router;
