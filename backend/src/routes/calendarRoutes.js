const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const { protect } = require('../middleware/authMiddleware');

// Lưu token (stub) để kết nối Google
router.post('/connect', protect, calendarController.connect);

// Trạng thái kết nối
router.get('/status', protect, calendarController.status);

// Đồng bộ schedule -> Google Calendar (stub events)
router.post('/sync', protect, calendarController.sync);

module.exports = router;


