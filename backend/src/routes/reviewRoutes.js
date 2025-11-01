const express = require('express');
const router = express.Router();
const deckPreviewController = require('../controllers/deckPreviewController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/reviews/:reviewId/helpful
// @access  Private
router.post('/:reviewId/helpful', protect, deckPreviewController.markReviewHelpful);

// @route   POST /api/reviews/:reviewId/report
// @access  Private
router.post('/:reviewId/report', protect, deckPreviewController.reportReview);

module.exports = router;
