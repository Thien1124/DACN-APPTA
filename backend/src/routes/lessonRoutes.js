const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const vocabularyController = require('../controllers/vocabularyController');
const exerciseController = require('../controllers/exerciseController');
const { protect, authorize } = require('../middleware/authMiddleware');

// ========== PUBLIC ROUTES (User có thể xem) ==========
router.get('/', lessonController.getAllLessons);
// ✅ Đặt TRƯỚC middleware admin
router.get('/:id', lessonController.getLessonById);
router.get('/:lessonId/vocabularies', vocabularyController.getVocabulariesByLesson);
router.get('/:lessonId/exercises', exerciseController.getExercisesByLesson);

// ========== ADMIN ROUTES ==========
// ✅ Middleware chỉ apply cho các routes phía dưới
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .post(lessonController.createLesson);

router
  .route('/:id')
  .put(lessonController.updateLesson)
  .delete(lessonController.deleteLesson);

router.patch('/:id/publish', lessonController.togglePublishLesson);

module.exports = router;