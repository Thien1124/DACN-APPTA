const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { csvUpload } = require('../middleware/upload');
const {
  previewCSVImport,
  previewTSVImport,
  importFromCSV,
  importFromTSV,
  previewGoogleSheetsImport,
  importFromGoogleSheetsController,
  getGoogleSheetsMetadata,
  validateImport,
} = require('../controllers/importController');

// ===== CSV/TSV Import Routes =====

// Preview imports (no actual import)
router.post('/csv/preview', protect, csvUpload.single('file'), previewCSVImport);
router.post('/tsv/preview', protect, csvUpload.single('file'), previewTSVImport);

// Actual import to deck
router.post('/csv/:deckId', protect, csvUpload.single('file'), importFromCSV);
router.post('/tsv/:deckId', protect, csvUpload.single('file'), importFromTSV);

// ===== Google Sheets Import Routes =====

// Preview Google Sheets import
router.post('/google-sheets/preview', protect, previewGoogleSheetsImport);

// Get Google Sheets metadata (sheet names, etc.)
router.get('/google-sheets/metadata', protect, getGoogleSheetsMetadata);

// Import from Google Sheets to deck
router.post('/google-sheets/:deckId', protect, importFromGoogleSheetsController);

// ===== Validation Route =====

// Validate import data before importing
router.post('/validate', protect, validateImport);

module.exports = router;
