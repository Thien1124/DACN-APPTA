const express = require('express');
const {
  getVocabularies,
  getVocabulary,
  createVocabulary,
  createVocabulariesBulk,
  updateVocabulary,
  deleteVocabulary
} = require('../controllers/vocabularyController');

const router = express.Router({ mergeParams: true });

// Middleware bảo vệ
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(getVocabularies)
  .post(protect, authorize('admin'), createVocabulary);

router
  .route('/bulk')
  .post(protect, authorize('admin'), createVocabulariesBulk);

router
  .route('/:id')
  .get(getVocabulary)
  .put(protect, authorize('admin'), updateVocabulary)
  .delete(protect, authorize('admin'), deleteVocabulary);

module.exports = router;