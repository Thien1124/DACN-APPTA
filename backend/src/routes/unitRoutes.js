const express = require('express');
const {
  getUnits,
  getUnit,
  createUnit,
  updateUnit,
  deleteUnit,
  togglePublishUnit
} = require('../controllers/unitController');

// Import middleware for advanced results
const Unit = require('../models/Unit');
const advancedResults = require('../middleware/advancedResults');

// Include other resource routers
const lessonRouter = require('./lessonRoutes');

const router = express.Router({ mergeParams: true });

// Middleware bảo vệ và phân quyền
const { protect, authorize } = require('../middleware/authMiddleware');

// Re-route vào các resource routers khác
router.use('/:unitId/lessons', lessonRouter);

// Các route công khai để xem units
router
  .route('/')
  .get(advancedResults(Unit, 'lessons'), getUnits);

router
  .route('/:id')
  .get(getUnit);

// Các route yêu cầu quyền admin để quản lý units
router
  .route('/')
  .post(protect, authorize('admin'), createUnit);

router
  .route('/:id')
  .put(protect, authorize('admin'), updateUnit)
  .delete(protect, authorize('admin'), deleteUnit);

// Sử dụng PATCH (từ nhánh 'main') vì nó đúng ngữ nghĩa hơn
router
  .route('/:id/publish')
  .patch(protect, authorize('admin'), togglePublishUnit);

module.exports = router;