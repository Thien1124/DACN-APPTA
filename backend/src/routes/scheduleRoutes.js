const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { protect } = require('../middleware/authMiddleware');

// Tạo lịch học
router.post('/', protect, scheduleController.createSchedule);

// Lấy lịch học của tôi
router.get('/', protect, scheduleController.getMySchedules);

// Cập nhật lịch học
router.put('/:id', protect, scheduleController.updateSchedule);

// Xoá (vô hiệu) lịch học
router.delete('/:id', protect, scheduleController.deleteSchedule);

module.exports = router;


