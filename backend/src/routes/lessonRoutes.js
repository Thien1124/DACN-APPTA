const express = require('express');
const {
  getLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  togglePublishLesson
} = require('../controllers/lessonController');

// Import middleware for advanced results
const Lesson = require('../models/Lesson');
const advancedResults = require('../middleware/advancedResults');

// Include other resource routers
const vocabularyRouter = require('./vocabularyRoutes');
const exerciseRouter = require('./exerciseRoutes');

const router = express.Router({ mergeParams: true });

// Middleware bảo vệ và phân quyền
const { protect, authorize } = require('../middleware/authMiddleware');

// Re-route vào các resource routers khác
// Ví dụ: /api/v1/lessons/:lessonId/vocabularies
router.use('/:lessonId/vocabularies', vocabularyRouter);
router.use('/:lessonId/exercises', exerciseRouter);

// Các route công khai để xem bài học
router
  .route('/')
  .get(advancedResults(Lesson, ['vocabularies', 'exercises']), getLessons);

router
  .route('/:id')
  .get(getLesson);

// Các route yêu cầu quyền admin để quản lý bài học
router
  .route('/')
  .post(protect, authorize('admin'), createLesson);

router
  .route('/:id')
  .put(protect, authorize('admin'), updateLesson)
  .delete(protect, authorize('admin'), deleteLesson);

// Sử dụng PATCH (từ nhánh 'main') vì nó đúng ngữ nghĩa hơn cho việc cập nhật một phần
router
  .route('/:id/publish')
  .patch(protect, authorize('admin'), togglePublishLesson);

module.exports = router;