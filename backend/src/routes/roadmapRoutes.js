const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
const { protect } = require('../middleware/authMiddleware');

// Tạo lộ trình dựa trên mục tiêu
router.post('/generate', protect, roadmapController.generateRoadmap);

// Lấy lộ trình hiện tại
router.get('/current', protect, roadmapController.getCurrentRoadmap);

// Cập nhật tiến độ lộ trình
router.post('/progress', protect, roadmapController.updateProgress);

module.exports = router;


