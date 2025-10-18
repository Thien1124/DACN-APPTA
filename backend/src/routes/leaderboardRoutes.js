const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Routes công khai - không cần đăng nhập
router.get('/overall', leaderboardController.getOverallLeaderboard);
router.get('/weekly', leaderboardController.getWeeklyLeaderboard);
router.get('/monthly', leaderboardController.getMonthlyLeaderboard);

// Routes yêu cầu đăng nhập
router.use(protect);

// Lấy thông tin bảng xếp hạng của người dùng cụ thể
router.get('/user/:userId', leaderboardController.getUserLeaderboard);

// Routes yêu cầu quyền admin
router.use(authorize('admin'));

// Cập nhật XP và streak cho người dùng
router.post('/update-xp', leaderboardController.updateUserXP);
router.post('/update-streak', leaderboardController.updateUserStreak);

// Reset XP hàng tuần và hàng tháng
router.post('/reset-weekly', leaderboardController.resetWeeklyXP);
router.post('/reset-monthly', leaderboardController.resetMonthlyXP);

module.exports = router;