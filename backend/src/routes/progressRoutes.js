const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { authenticate } = require('../middleware/auth'); // ✅ Sử dụng authenticate

// Get user progress
router.get('/', authenticate, progressController.getUserProgress);

// ✅ Update lesson progress - đúng endpoint
router.put('/lessons/:lessonId', authenticate, progressController.updateLessonProgress);

module.exports = router;