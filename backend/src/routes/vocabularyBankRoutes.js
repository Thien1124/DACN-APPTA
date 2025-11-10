const express = require('express');
const router = express.Router();
const vocabularyBankController = require('../controllers/vocabularyBankController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Get all vocabulary & stats
router.get('/', vocabularyBankController.getMyVocabulary);
router.get('/stats', vocabularyBankController.getStats);

// Add vocabulary manually
router.post('/', vocabularyBankController.addVocabulary);

// Save flashcard to bank
router.post('/save-flashcard/:flashcardId', vocabularyBankController.saveFlashcardToBank);
router.get('/check/:flashcardId', vocabularyBankController.checkFlashcardSaved);

// Update, delete, toggle
router.put('/:id', vocabularyBankController.updateVocabulary);
router.delete('/:id', vocabularyBankController.deleteVocabulary);
router.put('/:id/star', vocabularyBankController.toggleStar);
router.put('/:id/learned', vocabularyBankController.toggleLearned);

module.exports = router;