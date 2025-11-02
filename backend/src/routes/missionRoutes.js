const express = require('express');
const router = express.Router();
const missionController = require('../controllers/missionController');
const { protect } = require('../middleware/authMiddleware');

// Lấy danh sách nhiệm vụ có sẵn cho người dùng
router.get('/', protect, missionController.getMissions);

// Cập nhật tiến độ nhiệm vụ
router.post('/progress', protect, missionController.updateMissionProgress);

// Nhận phần thưởng từ nhiệm vụ đã hoàn thành
router.post('/claim-reward', protect, missionController.claimReward);

module.exports = router;