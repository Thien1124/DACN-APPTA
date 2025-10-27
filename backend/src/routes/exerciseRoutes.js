const express = require('express');
<<<<<<< HEAD
const {
  getExercises,
  getExercise,
  createExercise,
  createExercisesBulk,
  updateExercise,
  deleteExercise
} = require('../controllers/exerciseController');

const router = express.Router({ mergeParams: true });

// Middleware bảo vệ
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(getExercises)
  .post(protect, authorize('admin'), createExercise);

router
  .route('/bulk')
  .post(protect, authorize('admin'), createExercisesBulk);

router
  .route('/:id')
  .get(getExercise)
  .put(protect, authorize('admin'), updateExercise)
  .delete(protect, authorize('admin'), deleteExercise);
=======
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
>>>>>>> main

module.exports = router;