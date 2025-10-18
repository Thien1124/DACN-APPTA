const express = require('express');
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  togglePublishCourse
} = require('../controllers/courseController');

// Include other resource routers
const unitRouter = require('./unitRoutes');

const router = express.Router();

// Middleware bảo vệ
const { protect, authorize } = require('../middleware/authMiddleware');

// Re-route vào các resource routers khác
router.use('/:courseId/units', unitRouter);

router
  .route('/')
  .get(getCourses)
  .post(protect, authorize('admin'), createCourse);

router
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize('admin'), updateCourse)
  .delete(protect, authorize('admin'), deleteCourse);

router
  .route('/:id/publish')
  .put(protect, authorize('admin'), togglePublishCourse);

module.exports = router;