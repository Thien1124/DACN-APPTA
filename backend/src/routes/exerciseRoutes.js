const express = require('express');
const {
  getExercises,
  getExercise,
  createExercise,
  createExercisesBulk,
  updateExercise,
  deleteExercise
} = require('../controllers/exerciseController');

// Import middleware for advanced results
const Exercise = require('../models/Exercise');
const advancedResults = require('../middleware/advancedResults');

const router = express.Router({ mergeParams: true });

// Middleware bảo vệ và phân quyền
const { protect, authorize } = require('../middleware/authMiddleware');

// Các route công khai để xem bài tập
router
  .route('/')
  .get(advancedResults(Exercise, {
    path: 'lesson',
    select: 'title type'
  }), getExercises);

router
  .route('/:id')
  .get(getExercise);

// Các route yêu cầu quyền admin để quản lý bài tập
router
  .route('/')
  .post(protect, authorize('admin'), createExercise);

router
  .route('/bulk')
  .post(protect, authorize('admin'), createExercisesBulk);

router
  .route('/:id')
  .put(protect, authorize('admin'), updateExercise)
  .delete(protect, authorize('admin'), deleteExercise);

module.exports = router;