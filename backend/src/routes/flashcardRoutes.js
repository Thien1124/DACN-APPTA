const express = require('express');
const {
  getFlashcards,
  getFlashcard,
  createFlashcard,
  createFlashcardsBulk,
  updateFlashcard,
  deleteFlashcard
} = require('../controllers/flashcardController');

const router = express.Router({ mergeParams: true });

// Middleware bảo vệ
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(getFlashcards)
  .post(protect, authorize('admin'), createFlashcard);

router
  .route('/bulk')
  .post(protect, authorize('admin'), createFlashcardsBulk);

router
  .route('/:id')
  .get(getFlashcard)
  .put(protect, authorize('admin'), updateFlashcard)
  .delete(protect, authorize('admin'), deleteFlashcard);

module.exports = router;