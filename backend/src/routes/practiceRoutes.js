// backend/src/routes/practiceRoutes.js
const express = require('express');
const router = express.Router();
const practiceController = require('../controllers/practiceController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Get exercises với filter
router.get('/exercises', practiceController.getExercises);

// Get exercise by ID
router.get('/exercises/:id', practiceController.getExerciseById);

// Submit answer
router.post('/exercises/:id/submit', practiceController.submitAnswer);

// Get history
router.get('/history', practiceController.getHistory);

// Get stats
router.get('/stats', practiceController.getStats);

module.exports = router;