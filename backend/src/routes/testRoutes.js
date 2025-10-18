const express = require('express');
const {
  getTests,
  getTest,
  createTest,
  updateTest,
  deleteTest,
  togglePublishTest,
  getTestsByCourse,
  getTestsByUnit,
  addExerciseToTest,
  removeExerciseFromTest
} = require('../controllers/testController');

const router = express.Router({ mergeParams: true });

// Middleware bảo vệ
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(getTests)
  .post(protect, authorize('admin'), createTest);

router
  .route('/:id')
  .get(getTest)
  .put(protect, authorize('admin'), updateTest)
  .delete(protect, authorize('admin'), deleteTest);

router
  .route('/:id/publish')
  .put(protect, authorize('admin'), togglePublishTest);

router
  .route('/course/:courseId')
  .get(getTestsByCourse);

router
  .route('/unit/:unitId')
  .get(getTestsByUnit);

router
  .route('/:id/exercises')
  .post(protect, authorize('admin'), addExerciseToTest);

router
  .route('/:id/exercises/:exerciseId')
  .delete(protect, authorize('admin'), removeExerciseFromTest);

module.exports = router;