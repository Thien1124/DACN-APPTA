
const express = require('express');
const router = express.Router();
const practiceController = require('../controllers/practiceController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);
// Get stats
router.get('/stats', practiceController.getStats);

/**
 * Task 16: Practice Routes - Collocation/Phrasal Verbs/Word Family
 * Tất cả routes đều yêu cầu đăng nhập
 */

// Lấy danh sách bài tập luyện tập
router.get('/exercises', protect, practiceController.getExercises);

// Lấy chi tiết một bài tập
router.get('/exercises/:id', protect, practiceController.getExerciseById);

// Nộp đáp án bài tập
router.post('/exercises/:id/submit', protect, practiceController.submitAnswer);

// Lấy lịch sử làm bài
router.get('/history', protect, practiceController.getHistory);

// Ôn tập thông minh với AI - Task 23
router.get('/smart-review', protect, practiceController.getSmartReview);

module.exports = router;
