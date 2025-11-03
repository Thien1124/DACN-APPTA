const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

/**
 * Task 18 & 19: Analytics/Recommendations Routes
 * Tất cả routes yêu cầu đăng nhập
 */

// Tóm tắt lỗi cá nhân (30 ngày gần nhất mặc định)
router.get('/errors/summary', protect, analyticsController.getErrorSummary);

// Đề xuất thẻ tiếp theo (Next-Best-Card)
router.get('/next-best-card', protect, analyticsController.getNextBestCard);

// Tạo quiz phụ từ các thẻ/bài hay sai
router.post('/weak-quiz/generate', protect, analyticsController.generateWeakQuiz);

module.exports = router;


