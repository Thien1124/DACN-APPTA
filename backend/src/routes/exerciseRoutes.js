const express = require('express');
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

module.exports = router;