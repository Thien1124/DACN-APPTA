const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Tất cả routes đều yêu cầu đăng nhập và quyền admin
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(exerciseController.getAllExercises)
  .post(exerciseController.createExercise);

router
  .route('/bulk')
  .post(exerciseController.createBulkExercises);

router
  .route('/:id')
  .get(exerciseController.getExerciseById)
  .put(exerciseController.updateExercise)
  .delete(exerciseController.deleteExercise);

module.exports = router;