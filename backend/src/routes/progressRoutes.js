const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, progressController.getUserProgress);
router.post('/lesson', protect, progressController.updateLessonProgress);

module.exports = router;