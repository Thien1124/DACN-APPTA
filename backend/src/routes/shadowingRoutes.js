const express = require('express');
const router = express.Router();
const shadowingController = require('../controllers/shadowingController');
const { protect } = require('../middleware/auth');

/**
 * ===============================================
 * EXERCISE ROUTES
 * ===============================================
 */

/**
 * @route   POST /api/shadowing/exercises
 * @desc    Create new shadowing exercise
 * @access  Private
 * @body    { title, description, deck, audioUrl, audioDuration, transcript, segments, difficulty, tags, defaultSpeed, isPublic }
 */
router.post('/exercises', protect, shadowingController.createExercise);

/**
 * @route   GET /api/shadowing/exercises
 * @desc    Get user's exercises
 * @access  Private
 * @query   difficulty, page, limit
 */
router.get('/exercises', protect, shadowingController.getUserExercises);

/**
 * @route   GET /api/shadowing/exercises/:exerciseId
 * @desc    Get exercise by ID
 * @access  Private
 */
router.get('/exercises/:exerciseId', protect, shadowingController.getExercise);

/**
 * @route   GET /api/shadowing/exercises/deck/:deckId
 * @desc    Get exercises by deck
 * @access  Private
 */
router.get('/exercises/deck/:deckId', protect, shadowingController.getExercisesByDeck);

/**
 * @route   PUT /api/shadowing/exercises/:exerciseId
 * @desc    Update exercise
 * @access  Private
 * @body    { title, description, transcript, segments, difficulty, tags, defaultSpeed, isPublic }
 */
router.put('/exercises/:exerciseId', protect, shadowingController.updateExercise);

/**
 * @route   DELETE /api/shadowing/exercises/:exerciseId
 * @desc    Delete exercise
 * @access  Private
 */
router.delete('/exercises/:exerciseId', protect, shadowingController.deleteExercise);

/**
 * ===============================================
 * ATTEMPT ROUTES
 * ===============================================
 */

/**
 * @route   POST /api/shadowing/exercises/:exerciseId/start
 * @desc    Start new shadowing attempt
 * @access  Private
 * @body    { playbackSpeed }
 */
router.post('/exercises/:exerciseId/start', protect, shadowingController.startAttempt);

/**
 * @route   PUT /api/shadowing/attempts/:attemptId/speed
 * @desc    Update playback speed
 * @access  Private
 * @body    { speed }
 */
router.put('/attempts/:attemptId/speed', protect, shadowingController.updateSpeed);

/**
 * @route   POST /api/shadowing/attempts/:attemptId/ab-repeat
 * @desc    Set A-B repeat markers
 * @access  Private
 * @body    { startTime, endTime }
 */
router.post('/attempts/:attemptId/ab-repeat', protect, shadowingController.setABRepeat);

/**
 * @route   DELETE /api/shadowing/attempts/:attemptId/ab-repeat
 * @desc    Clear A-B repeat markers
 * @access  Private
 */
router.delete('/attempts/:attemptId/ab-repeat', protect, shadowingController.clearABRepeat);

/**
 * @route   POST /api/shadowing/attempts/:attemptId/record
 * @desc    Submit recording for analysis
 * @access  Private
 * @body    FormData with audio file and optional segmentIndex
 */
router.post('/attempts/:attemptId/record', protect, shadowingController.submitRecording);

/**
 * @route   POST /api/shadowing/attempts/:attemptId/complete
 * @desc    Complete attempt
 * @access  Private
 * @body    { timeSpent }
 */
router.post('/attempts/:attemptId/complete', protect, shadowingController.completeAttempt);

/**
 * @route   GET /api/shadowing/attempts/:attemptId
 * @desc    Get attempt by ID
 * @access  Private
 */
router.get('/attempts/:attemptId', protect, shadowingController.getAttempt);

/**
 * @route   GET /api/shadowing/attempts
 * @desc    Get user's attempts
 * @access  Private
 * @query   exerciseId, status, page, limit
 */
router.get('/attempts', protect, shadowingController.getUserAttempts);

/**
 * ===============================================
 * STATISTICS & PROGRESS ROUTES
 * ===============================================
 */

/**
 * @route   GET /api/shadowing/stats
 * @desc    Get user statistics
 * @access  Private
 * @query   exerciseId, startDate
 */
router.get('/stats', protect, shadowingController.getStats);

/**
 * @route   GET /api/shadowing/progress
 * @desc    Get progress over time
 * @access  Private
 * @query   exerciseId
 */
router.get('/progress', protect, shadowingController.getProgress);

module.exports = router;
