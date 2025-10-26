const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * ROUTES CHO USER THƯỜNG - Chỉ cần đăng nhập
 */

// Lấy danh sách tests (public)
router.get('/', protect, testController.getAllTests);

// Lấy chi tiết test
router.get('/:id', protect, testController.getTestById);

// Lấy tests theo course
router.get('/course/:courseId', protect, testController.getTestsByCourse);

// Lấy tests theo unit
router.get('/unit/:unitId', protect, testController.getTestsByUnit);

// Bắt đầu làm test
router.post('/:id/start', protect, testController.startTest);

// Submit câu trả lời
router.post('/attempts/:attemptId/answer', protect, testController.submitAnswer);

// Hoàn thành test
router.post('/attempts/:attemptId/complete', protect, testController.completeTest);

// Lấy kết quả test
router.get('/attempts/:attemptId/result', protect, testController.getTestResult);

// Lấy lịch sử làm bài của user
router.get('/user/history', protect, testController.getUserHistory);

/**
 * ROUTES CHO ADMIN - Quản lý tests
 */

// Tạo test mới
router.post('/admin/create', protect, authorize('admin', 'teacher'), testController.createTest);

// Cập nhật test
router.put('/admin/:id', protect, authorize('admin', 'teacher'), testController.updateTest);

// Xóa test
router.delete('/admin/:id', protect, authorize('admin'), testController.deleteTest);

// Publish/Unpublish test
router.patch('/admin/:id/publish', protect, authorize('admin', 'teacher'), testController.togglePublishTest);

// Thêm exercise vào test
router.post('/admin/:testId/exercises/:exerciseId', protect, authorize('admin', 'teacher'), testController.addExerciseToTest);

// Xóa exercise khỏi test
router.delete('/admin/:testId/exercises/:exerciseId', protect, authorize('admin', 'teacher'), testController.removeExerciseFromTest);

module.exports = router;