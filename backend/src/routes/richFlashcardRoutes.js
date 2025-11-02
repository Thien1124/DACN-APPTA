const express = require('express');
const router = express.Router();
const richFlashcardController = require('../controllers/richFlashcardController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// ==================== TASK 20: RICH FLASHCARD ROUTES ====================

// IMPORTANT: Specific routes MUST come BEFORE parameterized routes
// Otherwise Express will match /:id first!

// Search and filter routes (All authenticated users) - MUST BE FIRST
router.get('/search/tags', richFlashcardController.searchByTags);
router.get('/difficulty/:level', richFlashcardController.getByDifficulty);
router.get('/cefr/:level', richFlashcardController.getByCEFR);
router.get('/pos/:partOfSpeech', richFlashcardController.getByPartOfSpeech);

// Create routes (Admin only)
router.post('/rich', authorize('admin'), richFlashcardController.createRichFlashcard);
router.post('/vocabulary', authorize('admin'), richFlashcardController.createVocabularyCard);

// Add related data to flashcard (Admin only)
router.post('/:id/synonyms', authorize('admin'), richFlashcardController.addSynonym);
router.post('/:id/antonyms', authorize('admin'), richFlashcardController.addAntonym);
router.post('/:id/collocations', authorize('admin'), richFlashcardController.addCollocation);
router.post('/:id/meanings', authorize('admin'), richFlashcardController.addMeaning);
router.post('/:id/images', authorize('admin'), richFlashcardController.addImage);
router.post('/:id/audios', authorize('admin'), richFlashcardController.addAudio);

// Update rich data (Admin only)
router.put('/:id/rich', authorize('admin'), richFlashcardController.updateRichData);

// Get flashcard with rich data (All authenticated users)
router.get('/:id/rich', richFlashcardController.getRichFlashcard);

module.exports = router;
