const express = require('express');
const router = express.Router();
const dictationController = require('../controllers/dictationController');
const { protect } = require('../middleware/auth');

// ===== Dictation Exercises =====

/**
 * @route   POST /api/dictation/start/:flashcardId
 * @desc    Start dictation exercise (alias for getDictationExercise)
 * @access  Private
 */
router.post('/start/:flashcardId', protect, dictationController.getDictationExercise);

/**
 * @route   GET /api/dictation/exercise/:flashcardId
 * @desc    Get dictation exercise for a specific flashcard
 * @access  Private
 */
router.get('/exercise/:flashcardId', protect, dictationController.getDictationExercise);

/**
 * @route   GET /api/dictation/deck/:deckId/exercises
 * @desc    Get batch of dictation exercises for a deck
 * @access  Private
 */
router.get('/deck/:deckId/exercises', protect, dictationController.getDeckDictationExercises);

// ===== Submit Dictation =====

/**
 * @route   POST /api/dictation/submit
 * @desc    Submit dictation answer (flashcardId in body)
 * @access  Private
 * @body    { flashcardId, userAnswer, playCount, timeSpent, audioSpeed }
 */
router.post('/submit', protect, dictationController.submitDictation);

/**
 * @route   POST /api/dictation/submit/:flashcardId
 * @desc    Submit dictation answer for scoring (flashcardId in params)
 * @access  Private
 * @body    { userAnswer, playCount, timeSpent, audioSpeed }
 */
router.post('/submit/:flashcardId', protect, dictationController.submitDictation);

// ===== History & Stats =====

/**
 * @route   GET /api/dictation/history
 * @desc    Get user's dictation attempt history
 * @access  Private
 * @query   ?deckId=xxx&page=1&limit=20&sortBy=completedAt&sortOrder=desc
 */
router.get('/history', protect, dictationController.getDictationHistory);

/**
 * @route   GET /api/dictation/stats
 * @desc    Get user's dictation statistics
 * @access  Private
 * @query   ?deckId=xxx&startDate=2024-01-01&endDate=2024-12-31
 */
router.get('/stats', protect, dictationController.getDictationStats);

/**
 * @route   GET /api/dictation/attempt/:attemptId
 * @desc    Get specific dictation attempt details
 * @access  Private
 */
router.get('/attempt/:attemptId', protect, dictationController.getDictationAttempt);

module.exports = router;
