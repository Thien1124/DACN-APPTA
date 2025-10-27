const express = require('express');
const router = express.Router();
const xpController = require('../controllers/xpController');
const { protect } = require('../middleware/authMiddleware');

// Cập nhật XP khi người dùng hoàn thành bài học
router.post('/update', protect, xpController.updateXP);

// Lấy thông tin XP của người dùng
router.get('/', protect, xpController.getXP);

module.exports = router;