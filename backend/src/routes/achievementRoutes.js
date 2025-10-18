const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Tất cả routes đều yêu cầu đăng nhập và quyền admin
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(achievementController.getAllAchievements)
  .post(achievementController.createAchievement);

router
  .route('/:id')
  .get(achievementController.getAchievementById)
  .put(achievementController.updateAchievement)
  .delete(achievementController.deleteAchievement);

router.patch('/:id/toggle-active', achievementController.toggleActiveAchievement);

module.exports = router;