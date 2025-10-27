const express = require('express');
const {
  getVocabularies,
  getVocabulary,
  createVocabulary,
  createVocabulariesBulk,
  updateVocabulary,
  deleteVocabulary
} = require('../controllers/vocabularyController');

// Import middleware for advanced results
const Vocabulary = require('../models/Vocabulary');
const advancedResults = require('../middleware/advancedResults');

const router = express.Router({ mergeParams: true });

// Middleware bảo vệ và phân quyền
const { protect, authorize } = require('../middleware/authMiddleware');

// Các route công khai để xem từ vựng
router
  .route('/')
  .get(advancedResults(Vocabulary, {
    path: 'lesson',
    select: 'title type'
  }), getVocabularies);

router
  .route('/:id')
  .get(getVocabulary);

// Các route yêu cầu quyền admin để quản lý từ vựng
router
  .route('/')
  .post(protect, authorize('admin'), createVocabulary);

router
  .route('/bulk')
  .post(protect, authorize('admin'), createVocabulariesBulk);

router
  .route('/:id')
  .put(protect, authorize('admin'), updateVocabulary)
  .delete(protect, authorize('admin'), deleteVocabulary);

module.exports = router;