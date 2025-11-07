const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');
const lessonController = require('../controllers/lessonController');
const { protect, authorize } = require('../middleware/authMiddleware');


// ========== PUBLIC ROUTES ==========
// ✅ Lấy lessons của unit (không cần login)
router.get('/:unitId/lessons', lessonController.getLessonsByUnit);

// ========== ADMIN ROUTES ==========
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

module.exports = router;