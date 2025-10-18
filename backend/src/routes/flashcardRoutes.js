const express = require('express');
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

module.exports = router;