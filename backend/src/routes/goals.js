const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createGoal,
  getGoals,
  getGoal,
  updateGoal,
  updateProgress,
  deleteGoal,
  getStats
} = require('../controllers/goalController');
const { authenticate } = require('../middleware/auth'); // ✅ ĐỔI protect thành authenticate

// Validation rules
const createGoalValidation = [
  body('title').trim().notEmpty().withMessage('Tiêu đề không được để trống'),
  body('type').isIn(['SCORE', 'CHAPTER', 'TEST', 'LESSON', 'POMODORO']).withMessage('Loại mục tiêu không hợp lệ'),
  body('target').isInt({ min: 1 }).withMessage('Mục tiêu phải là số nguyên dương'),
  // ✅ Deadline chỉ required khi không phải POMODORO
  body('deadline').optional().isISO8601().withMessage('Deadline không hợp lệ').custom((value, { req }) => {
    if (req.body.type !== 'POMODORO' && !value) {
      throw new Error('Deadline là bắt buộc cho loại mục tiêu này');
    }
    if (req.body.type !== 'POMODORO' && value && new Date(value) <= new Date()) {
      throw new Error('Deadline phải là thời gian trong tương lai');
    }
    return true;
  }),
  // ✅ Thêm validation cho Pomodoro fields
  body('workDuration').optional().isInt({ min: 15, max: 60 }).withMessage('Thời gian làm việc phải từ 15-60 phút'),
  body('shortBreakDuration').optional().isInt({ min: 3, max: 15 }).withMessage('Thời gian nghỉ ngắn phải từ 3-15 phút'),
  body('longBreakInterval').optional().isInt({ min: 2, max: 8 }).withMessage('Khoảng nghỉ dài phải từ 2-8 phiên'),
  body('longBreakDuration').optional().isInt({ min: 10, max: 30 }).withMessage('Thời gian nghỉ dài phải từ 10-30 phút')
];

// Routes - ✅ ĐỔI tất cả protect thành authenticate
router.get('/stats', authenticate, getStats);
router.post('/', authenticate, createGoalValidation, createGoal);
router.get('/', authenticate, getGoals);
router.get('/:id', authenticate, getGoal);
router.put('/:id', authenticate, updateGoal);
router.put('/:id/progress', authenticate, updateProgress);
router.delete('/:id', authenticate, deleteGoal);

module.exports = router;