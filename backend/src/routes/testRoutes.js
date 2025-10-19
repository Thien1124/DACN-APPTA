const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Tất cả routes đều yêu cầu đăng nhập và quyền admin
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(testController.getAllTests)
  .post(testController.createTest);

router
  .route('/:id')
  .get(testController.getTestById)
  .put(testController.updateTest)
  .delete(testController.deleteTest);

router.patch('/:id/publish', testController.togglePublishTest);

// Routes để lấy bài test theo khóa học và unit
router.get('/course/:courseId', testController.getTestsByCourse);
router.get('/unit/:unitId', testController.getTestsByUnit);

// Routes để quản lý bài tập trong bài test
router.post('/:testId/exercises/:exerciseId', testController.addExerciseToTest);
router.delete('/:testId/exercises/:exerciseId', testController.removeExerciseFromTest);

module.exports = router;