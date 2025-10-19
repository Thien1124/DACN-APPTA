const express = require('express');
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

module.exports = router;