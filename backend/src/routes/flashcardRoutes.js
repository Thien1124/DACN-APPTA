const express = require('express');
const router = express.Router();
const flashcardController = require('../controllers/flashcardController');
const noteTypeController = require('../controllers/noteTypeController');
const { protect, authorize } = require('../middleware/authMiddleware');


router.get('/user', protect, flashcardController.getUserFlashcards); 

// Route for TypeRacer game - get random flashcards
router.get('/typeracer/random', protect, flashcardController.getRandomFlashcardsForTypeRacer);

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

// ==================== TASK 19: NOTE TYPE ROUTES ====================
// Create flashcard with specific note type
router.post('/note-type', noteTypeController.createNoteTypeFlashcard);

// Create bulk flashcards with note types
router.post('/note-type/bulk', noteTypeController.createBulkNoteTypeFlashcards);

// Get flashcards by note type
router.get('/note-type/:noteType', noteTypeController.getFlashcardsByNoteType);

// Get note type statistics for a deck
router.get('/note-type/stats/:deckId', noteTypeController.getNoteTypeStats);

// Update flashcard with note type
router.put('/note-type/:id', noteTypeController.updateNoteTypeFlashcard);

router
  .route('/:id')
  .get(flashcardController.getFlashcardById)
  .put(flashcardController.updateFlashcard)
  .delete(flashcardController.deleteFlashcard);

// Route để lấy flashcard theo deck
router.get('/deck/:deckId', flashcardController.getFlashcardsByDeck);

module.exports = router;