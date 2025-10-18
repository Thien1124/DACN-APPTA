const express = require('express');
const {
  getLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  togglePublishLesson
} = require('../controllers/lessonController');

// Include other resource routers
const vocabularyRouter = require('./vocabularyRoutes');
const exerciseRouter = require('./exerciseRoutes');

const router = express.Router({ mergeParams: true });

// Middleware bảo vệ
const { protect, authorize } = require('../middleware/authMiddleware');

// Re-route vào các resource routers khác
router.use('/:lessonId/vocabularies', vocabularyRouter);
router.use('/:lessonId/exercises', exerciseRouter);

router
  .route('/')
  .get(getLessons)
  .post(protect, authorize('admin'), createLesson);

router
  .route('/:id')
  .get(getLesson)
  .put(protect, authorize('admin'), updateLesson)
  .delete(protect, authorize('admin'), deleteLesson);

router
  .route('/:id/publish')
  .put(protect, authorize('admin'), togglePublishLesson);

module.exports = router;