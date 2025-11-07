const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// @route   POST /api/ai/analyze
// @desc    Analyze word with AI
// @access  Private
router.post('/analyze', aiController.analyzeWord);

// @route   POST /api/ai/detect-polysemy
// @desc    Detect if word has multiple meanings
// @access  Private
router.post('/detect-polysemy', aiController.detectPolysemy);

// @route   POST /api/ai/generate-examples
// @desc    Generate example sentences
// @access  Private
router.post('/generate-examples', aiController.generateExamples);

// @route   POST /api/ai/suggest-images
// @desc    Suggest image keywords
// @access  Private
router.post('/suggest-images', aiController.suggestImageKeywords);

// @route   POST /api/ai/suggest-collocations
// @desc    Suggest collocations
// @access  Private
router.post('/suggest-collocations', aiController.suggestCollocations);

// Admin/Teacher only routes
router.use(authorize('admin', 'teacher'));

// @route   POST /api/ai/analyze-and-create
// @desc    Analyze word and create flashcard
// @access  Private (Admin/Teacher)
router.post('/analyze-and-create', aiController.analyzeAndCreateFlashcard);

// @route   POST /api/ai/enrich/:id
// @desc    Enrich existing flashcard with AI
// @access  Private (Admin/Teacher)
router.post('/enrich/:id', aiController.enrichFlashcard);

// @route   POST /api/ai/batch-analyze
// @desc    Batch analyze multiple words
// @access  Private (Admin/Teacher)
router.post('/batch-analyze', aiController.batchAnalyze);

// @route   POST /api/ai/batch-create
// @desc    Batch create flashcards
// @access  Private (Admin/Teacher)
router.post('/batch-create', aiController.batchCreateFlashcards);

module.exports = router;