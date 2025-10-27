const express = require('express');
const {
  // Admin functions
  getTestsForAdmin,
  getTestForAdmin,
  createTest,
  updateTest,
  deleteTest,
  togglePublishTest,
  addExerciseToTest,
  removeExerciseFromTest,
  // User functions
  getPublicTests,
  getTestForUser,
  getTestsByCourse,
  getTestsByUnit,
  startTest,
  submitAnswer,
  completeTest,
  getTestResult,
  getUserHistory
} = require('../controllers/testController');

// Import middleware for advanced results
const Test = require('../models/Test');
const advancedResults = require('../middleware/advancedResults');

const router = express.Router({ mergeParams: true });

// Middleware bảo vệ và phân quyền
const { protect, authorize } = require('../middleware/authMiddleware');

// ==================== PUBLIC & USER ROUTES ====================
// Các routes này dành cho người dùng xem và làm bài test

// Lấy danh sách tests (công khai) với filter, sort, pagination
router.route('/')
    .get(advancedResults(Test, { path: 'exercises' }), getPublicTests);

// Lấy lịch sử làm bài của user hiện tại
router.route('/history/me')
    .get(protect, getUserHistory);
    
// Lấy chi tiết một bài test (công khai, không có đáp án)
router.route('/:id')
    .get(getTestForUser);

// Lấy tests theo course và unit (công khai)
router.route('/course/:courseId').get(getTestsByCourse);
router.route('/unit/:unitId').get(getTestsByUnit);

// Các route cho quy trình làm bài (yêu cầu đăng nhập)
router.route('/:id/start')
    .post(protect, startTest);

router.route('/attempts/:attemptId/answer')
    .post(protect, submitAnswer);

router.route('/attempts/:attemptId/complete')
    .post(protect, completeTest);

router.route('/attempts/:attemptId/result')
    .get(protect, getTestResult);


// ==================== ADMIN MANAGEMENT ROUTES ====================
// Các routes này yêu cầu quyền admin/teacher để quản lý bài test

router.use(protect, authorize('admin', 'teacher')); // Áp dụng middleware cho tất cả các route bên dưới

router.route('/')
    .post(createTest);

router.route('/:id')
    .put(updateTest)
    .delete(authorize('admin'), deleteTest); // Chỉ admin mới được xóa hẳn

router.route('/:id/admin-view') // Route riêng cho admin xem chi tiết (có đáp án)
    .get(getTestForAdmin);

router.route('/:id/publish')
    .patch(togglePublishTest);

router.route('/:testId/exercises')
    .post(addExerciseToTest);

router.route('/:testId/exercises/:exerciseId')
    .delete(removeExerciseFromTest);

module.exports = router;