const express = require('express');
<<<<<<< HEAD
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
=======
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Tất cả routes đều yêu cầu đăng nhập và quyền admin
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(lessonController.getAllLessons)
  .post(lessonController.createLesson);

router
  .route('/:id')
  .get(lessonController.getLessonById)
  .put(lessonController.updateLesson)
  .delete(lessonController.deleteLesson);

router.patch('/:id/publish', lessonController.togglePublishLesson);
>>>>>>> main

module.exports = router;