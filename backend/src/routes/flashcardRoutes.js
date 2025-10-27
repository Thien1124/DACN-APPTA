const express = require('express');
const {
  getFlashcards,
  getFlashcard,
  createFlashcard,
  createFlashcardsBulk,
  updateFlashcard,
  deleteFlashcard
} = require('../controllers/flashcardController');

// Import middleware for advanced results
const Flashcard = require('../models/Flashcard');
const advancedResults = require('../middleware/advancedResults');

const router = express.Router({ mergeParams: true });

// Middleware bảo vệ và phân quyền
const { protect, authorize } = require('../middleware/authMiddleware');

// Các route công khai để xem flashcards
router
  .route('/')
  .get(advancedResults(Flashcard, {
    path: 'deck',
    select: 'title description'
  }), getFlashcards);

router
  .route('/:id')
  .get(getFlashcard);

// Các route yêu cầu quyền admin để quản lý flashcards
router
  .route('/')
  .post(protect, authorize('admin'), createFlashcard);

router
  .route('/bulk')
  .post(protect, authorize('admin'), createFlashcardsBulk);

router
  .route('/:id')
  .put(protect, authorize('admin'), updateFlashcard)
  .delete(protect, authorize('admin'), deleteFlashcard);

module.exports = router;