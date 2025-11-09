const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const unitController = require('../controllers/unitController');
const { protect, authorize } = require('../middleware/authMiddleware');



// ✅ Route PUBLIC - Lấy courses published (không cần login)
router.get('/published', courseController.getPublishedCourses);
// Route cho user thường - lấy courses đã enroll
router.get('/enrolled', protect, courseController.getEnrolledCourses);
// Lấy tất cả units theo khóa học
// GET /api/courses/:courseId/units
router.get('/:courseId/units', unitController.getUnitsByCourse);


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
  

module.exports = router;