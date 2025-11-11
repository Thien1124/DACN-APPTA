const express = require('express');
const router = express.Router();
const roadmapTopicController = require('../controllers/roadmapTopicController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Generate roadmap
router.post('/generate', roadmapTopicController.generateRoadmap);

// Get current roadmap
router.get('/current', roadmapTopicController.getCurrentRoadmap);

// Complete a step
router.post('/:roadmapId/complete-step', roadmapTopicController.completeStep);

// Get step exercises
router.get('/:roadmapId/step/:stepNumber/exercises', roadmapTopicController.getStepExercises);
router.post('/generate-exercises', roadmapTopicController.generateExercisesForRoadmap);


module.exports = router;