const express = require('express');
<<<<<<< HEAD
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
=======
const router = express.Router();
const courseController = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Tất cả routes đều yêu cầu đăng nhập và quyền admin
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(courseController.getAllCourses)
  .post(courseController.createCourse);

router
  .route('/:id')
  .get(courseController.getCourseById)
  .put(courseController.updateCourse)
  .delete(courseController.deleteCourse);

router.patch('/:id/publish', courseController.togglePublishCourse);
>>>>>>> main

module.exports = router;