const express = require('express');
const router = express.Router();
const grammarQuizController = require('../controllers/grammarQuizController');
const { protect } = require('../middleware/authMiddleware');

/**
 * Task 17: Grammar Quiz Routes - Mini-quiz ngữ pháp gắn với flashcard
 * Tất cả routes đều yêu cầu đăng nhập
 */

// Lấy quiz gắn với một flashcard
router.get('/flashcard/:flashcardId', protect, grammarQuizController.getQuizByFlashcard);

// Lấy danh sách quiz ngữ pháp
router.get('/quizzes', protect, grammarQuizController.getQuizzes);

// Lấy chi tiết một quiz
router.get('/quizzes/:id', protect, grammarQuizController.getQuizById);

// Nộp đáp án quiz
router.post('/quizzes/:id/submit', protect, grammarQuizController.submitAnswer);

// Lấy lịch sử làm quiz
router.get('/history', protect, grammarQuizController.getHistory);

module.exports = router;

