const express = require('express');
<<<<<<< HEAD
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
=======
const router = express.Router();
const flashcardController = require('../controllers/flashcardController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Tất cả routes đều yêu cầu đăng nhập và quyền admin
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(flashcardController.getAllFlashcards)
  .post(flashcardController.createFlashcard);

router
  .route('/bulk')
  .post(flashcardController.createBulkFlashcards);

router
  .route('/:id')
  .get(flashcardController.getFlashcardById)
  .put(flashcardController.updateFlashcard)
  .delete(flashcardController.deleteFlashcard);

// Route để lấy flashcard theo deck
router.get('/deck/:deckId', flashcardController.getFlashcardsByDeck);
>>>>>>> main

module.exports = router;