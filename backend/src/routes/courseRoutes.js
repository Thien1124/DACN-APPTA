const express = require('express');
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  togglePublishCourse
} = require('../controllers/courseController');

// Import middleware for advanced results
const Course = require('../models/Course');
const advancedResults = require('../middleware/advancedResults');

// Include other resource routers
const unitRouter = require('./unitRoutes');

const router = express.Router();

// Middleware bảo vệ và phân quyền
const { protect, authorize } = require('../middleware/authMiddleware');

// Re-route vào các resource routers khác (ví dụ: lấy units của một course)
router.use('/:courseId/units', unitRouter);

// Các route công khai để xem khóa học
router.route('/')
  .get(advancedResults(Course, 'units'), getCourses); // Thêm advancedResults

router.route('/:id')
  .get(getCourse);

// Các route yêu cầu quyền admin để quản lý khóa học
router.route('/')
  .post(protect, authorize('admin'), createCourse);

router.route('/:id')
  .put(protect, authorize('admin'), updateCourse)
  .delete(protect, authorize('admin'), deleteCourse);

// Sử dụng PATCH (từ nhánh 'main') vì nó đúng ngữ nghĩa hơn cho việc cập nhật một phần
router.route('/:id/publish')
  .patch(protect, authorize('admin'), togglePublishCourse);

module.exports = router;