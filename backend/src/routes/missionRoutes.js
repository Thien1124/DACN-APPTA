const express = require('express');
const router = express.Router();
const missionController = require('../controllers/missionController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Lấy danh sách nhiệm vụ có sẵn cho người dùng
router.get('/', protect, missionController.getMissions);

// Cập nhật tiến độ nhiệm vụ
router.post('/progress', protect, missionController.updateMissionProgress);

// Nhận phần thưởng từ nhiệm vụ đã hoàn thành
router.post('/claim-reward', protect, missionController.claimReward);

// =========================
// Admin: Tạo/Sửa/Xóa nhiệm vụ
// =========================
router.post('/', protect, authorize('admin'), missionController.createMission);
router.put('/:id', protect, authorize('admin'), missionController.updateMissionAdmin);
router.delete('/:id', protect, authorize('admin'), missionController.deleteMission);

module.exports = router;