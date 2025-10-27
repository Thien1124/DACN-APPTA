const express = require('express');
<<<<<<< HEAD
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
=======
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
>>>>>>> main

module.exports = router;