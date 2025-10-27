const express = require('express');
const {
  getAchievements,
  getAchievement,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  toggleActiveAchievement
} = require('../controllers/achievementController');

// Import middleware for advanced results
const Achievement = require('../models/Achievement');
const advancedResults = require('../middleware/advancedResults');

const router = express.Router();

// Middleware bảo vệ và phân quyền
const { protect, authorize } = require('../middleware/authMiddleware');

// Các route công khai để xem thành tích
router.route('/')
  .get(advancedResults(Achievement), getAchievements); // Thêm advancedResults

router.route('/:id')
  .get(getAchievement);

// Các route yêu cầu quyền admin để quản lý
router.route('/')
  .post(protect, authorize('admin'), createAchievement);

router.route('/:id')
  .put(protect, authorize('admin'), updateAchievement)
  .delete(protect, authorize('admin'), deleteAchievement);

// Sử dụng PATCH và đường dẫn rõ ràng hơn từ nhánh 'main'
router.route('/:id/toggle-active')
  .patch(protect, authorize('admin'), toggleActiveAchievement);

module.exports = router;