const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');
const lessonController = require('../controllers/lessonController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Tất cả routes đều yêu cầu đăng nhập và quyền admin
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(unitController.getAllUnits)
  .post(unitController.createUnit);

router
  .route('/:id')
  .get(unitController.getUnitById)
  .put(unitController.updateUnit)
  .delete(unitController.deleteUnit);

router.patch('/:id/publish', unitController.togglePublishUnit);

// Lay tat ca bai hoc theo unit
// GET /api/units/:unitId/lessons
router.get('/:unitId/lessons', lessonController.getLessonsByUnit);

module.exports = router;