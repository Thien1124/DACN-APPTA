const express = require('express');
const router = express.Router();
const studyController = require('../controllers/studyController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

/**
 * Study Session Routes
 */

// Start a new study session
router.post('/sessions/start', studyController.startStudySession);

// Submit answer for a flashcard
router.post('/sessions/:sessionId/answer', studyController.submitAnswer);

// Complete study session
router.post('/sessions/:sessionId/complete', studyController.completeSession);

// Abandon study session
router.post('/sessions/:sessionId/abandon', studyController.abandonSession);

// Get session details
router.get('/sessions/:sessionId', studyController.getSessionDetails);

/**
 * Progress & Statistics Routes
 */

// Get user's study progress for a deck
router.get('/progress/:deckId', studyController.getDeckProgress);

// Get overall study statistics
router.get('/stats', studyController.getStudyStats);

module.exports = router;
