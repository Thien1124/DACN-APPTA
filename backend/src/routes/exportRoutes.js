const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  exportDeckCSV,
  exportDeckTSV,
  exportToAnki,
  getExportStats,
  backupDeck,
  restoreDeck,
  listBackups,
  getBackupDetails,
  downloadBackup,
  deleteBackup,
  exportStatistics,
} = require('../controllers/exportController');

// ===== Export Routes =====

// Export deck to CSV
router.get('/csv/:deckId', protect, exportDeckCSV);

// Export deck to TSV
router.get('/tsv/:deckId', protect, exportDeckTSV);

// Export to Anki format
router.get('/anki/:deckId', protect, exportToAnki);

// Get export statistics for deck
router.get('/stats/:deckId', protect, getExportStats);

// Export detailed statistics as JSON
router.get('/statistics/:deckId', protect, exportStatistics);

// ===== Backup & Restore Routes =====

// Create backup
router.post('/backup/:deckId', protect, backupDeck);

// Restore from backup
router.post('/restore', protect, restoreDeck);

// List all backups
router.get('/backups', protect, listBackups);

// Get backup details
router.get('/backup/:filename', protect, getBackupDetails);

// Download backup file
router.get('/backup/download/:filename', protect, downloadBackup);

// Delete backup
router.delete('/backup/:filename', protect, deleteBackup);

module.exports = router;
