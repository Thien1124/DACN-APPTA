const express = require('express');
const router = express.Router();
const {
  bulkUpdateFlashcards,
  bulkAddTags,
  bulkRemoveTags,
  bulkDeleteFlashcards,
  getFlashcardsByTags,
  getFlashcardsByPartOfSpeech,
  getAllTags,
  getFlashcardStatistics
} = require('../controllers/bulkFlashcardController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

// ==================== BULK OPERATIONS ====================

// Bulk update flashcards
router.put('/bulk-update', bulkUpdateFlashcards);

// Bulk add tags
router.put('/bulk-add-tags', bulkAddTags);

// Bulk remove tags
router.put('/bulk-remove-tags', bulkRemoveTags);

// Bulk delete flashcards
router.delete('/bulk-delete', bulkDeleteFlashcards);

// ==================== FILTERING & ORGANIZATION ====================

// Get flashcards by tags
router.get('/by-tags', getFlashcardsByTags);

// Get flashcards by Part of Speech
router.get('/by-pos', getFlashcardsByPartOfSpeech);

// Get all unique tags
router.get('/tags/all', getAllTags);

// Get statistics
router.get('/statistics', getFlashcardStatistics);

module.exports = router;
