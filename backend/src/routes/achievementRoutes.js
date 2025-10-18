const express = require('express');
const {
  getAchievements,
  getAchievement,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  toggleActiveAchievement
} = require('../controllers/achievementController');

const router = express.Router();

// Middleware bảo vệ
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(getAchievements)
  .post(protect, authorize('admin'), createAchievement);

router
  .route('/:id')
  .get(getAchievement)
  .put(protect, authorize('admin'), updateAchievement)
  .delete(protect, authorize('admin'), deleteAchievement);

router
  .route('/:id/toggle')
  .put(protect, authorize('admin'), toggleActiveAchievement);

module.exports = router;