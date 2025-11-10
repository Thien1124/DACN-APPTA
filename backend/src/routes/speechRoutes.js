const express = require('express');
const router = express.Router();
const speechController = require('../controllers/speechController');
const { protect } = require('../middleware/auth');
const { audioUpload } = require('../middleware/upload');

// ===== Speech Exercises =====

/**
 * @route   GET /api/speech/exercise/:flashcardId
 * @desc    Get speech exercise for a specific flashcard
 * @access  Private
 */
router.get('/exercise/:flashcardId', protect, speechController.getSpeechExercise);

/**
 * @route   GET /api/speech/deck/:deckId/exercises
 * @desc    Get batch of speech exercises for a deck
 * @access  Private
 */
router.get('/deck/:deckId/exercises', protect, speechController.getDeckSpeechExercises);

// ===== Speech Analysis =====

/**
 * @route   POST /api/speech/analyze/:flashcardId
 * @desc    Analyze user's speech recording
 * @access  Private
 * @body    multipart/form-data with audio file
 */
router.post(
  '/analyze/:flashcardId',
  protect,
  audioUpload.single('audio'),
  speechController.analyzeSpeech
);

/**
 * @route   POST /api/speech/compare/:flashcardId
 * @desc    Compare pronunciation with reference
 * @access  Private
 * @body    multipart/form-data with audio file
 */
router.post(
  '/compare/:flashcardId',
  protect,
  audioUpload.single('audio'),
  speechController.comparePronunciation
);

// ===== Text-to-Speech =====

/**
 * @route   POST /api/speech/generate-audio
 * @desc    Generate TTS audio from text
 * @access  Private
 * @body    { text, language }
 */
router.post('/generate-audio', protect, speechController.generateAudio);

// ===== History & Stats =====

/**
 * @route   GET /api/speech/history
 * @desc    Get user's speech attempt history
 * @access  Private
 * @query   ?deckId=xxx&page=1&limit=20&sortBy=completedAt&sortOrder=desc
 */
router.get('/history', protect, speechController.getSpeechHistory);

/**
 * @route   GET /api/speech/stats
 * @desc    Get user's speech statistics
 * @access  Private
 * @query   ?deckId=xxx&startDate=2024-01-01&endDate=2024-12-31
 */
router.get('/stats', protect, speechController.getSpeechStats);

/**
 * @route   GET /api/speech/attempt/:attemptId
 * @desc    Get specific speech attempt details
 * @access  Private
 */
router.get('/attempt/:attemptId', protect, speechController.getSpeechAttempt);

module.exports = router;
