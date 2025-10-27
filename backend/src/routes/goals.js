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
  body('type').isIn(['SCORE', 'CHAPTER', 'TEST', 'LESSON']).withMessage('Loại mục tiêu không hợp lệ'),
  body('target').isInt({ min: 1 }).withMessage('Mục tiêu phải là số nguyên dương'),
  body('deadline').isISO8601().withMessage('Deadline không hợp lệ')
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