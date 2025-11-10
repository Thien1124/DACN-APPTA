const express = require('express');
const router = express.Router();
const leechController = require('../controllers/leechController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// ==================== SINGLE CARD OPERATIONS ====================

// Mark/unmark as leech
router.post('/mark/:id', leechController.markAsLeech);
router.post('/unmark/:id', leechController.unmarkLeech);

// Suspend/unsuspend
router.post('/suspend/:id', leechController.suspendCard);
router.post('/unsuspend/:id', leechController.unsuspendCard);

// Bury/unbury
router.post('/bury/:id', leechController.buryCard);
router.post('/unbury/:id', leechController.unburyCard);

// ==================== BULK OPERATIONS ====================

// Bulk suspend and bury
router.post('/bulk/suspend', leechController.bulkSuspend);
router.post('/bulk/bury', leechController.bulkBury);

// ==================== GET LISTS ====================

// Get leeched cards in a deck
router.get('/:deckId', leechController.getLeechedCards);

// Get buried cards in a deck
router.get('/buried/:deckId', leechController.getBuriedCards);

// Get suspended cards in a deck
router.get('/suspended/:deckId', leechController.getSuspendedCards);

// ==================== MAINTENANCE ====================

// Auto-unbury expired cards (can be called by cron or manually)
router.post('/unbury-expired', leechController.unburyExpired);

module.exports = router;
