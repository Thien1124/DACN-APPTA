const express = require('express');
const router = express.Router();
const streakController = require('../controllers/streakController');
const { protect } = require('../middleware/authMiddleware');

// Cập nhật streak khi người dùng hoàn thành bài học
router.post('/update', protect, streakController.updateStreak);

// Lấy thông tin streak của người dùng
router.get('/', protect, streakController.getStreak);

module.exports = router;