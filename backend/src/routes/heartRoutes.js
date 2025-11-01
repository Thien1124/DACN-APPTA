const express = require('express');
const router = express.Router();
const heartController = require('../controllers/heartController');
const { protect } = require('../middleware/authMiddleware');

// Giảm số tim khi người dùng trả lời sai
router.post('/use', protect, heartController.useHeart);

// Nạp lại tim theo thời gian
router.get('/refill', protect, heartController.refillHearts);

// Mua thêm tim bằng gems
router.post('/buy', protect, heartController.buyHearts);

module.exports = router;