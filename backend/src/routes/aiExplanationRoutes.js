const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const aiExplanationController = require('../controllers/aiExplanationController');

/**
 * @route   POST /api/ai-explain/word
 * @desc    Get AI explanation for a word (meaning, nuances, usage)
 * @access  Private
 * @body    { word, includeVietnamese, forceRefresh }
 */
router.post('/word', protect, aiExplanationController.explainWord);

/**
 * @route   POST /api/ai-explain/compare
 * @desc    Compare synonyms with detailed AI analysis
 * @access  Private
 * @body    { words: [word1, word2, ...], includeVietnamese, forceRefresh }
 */
router.post('/compare', protect, aiExplanationController.compareSynonyms);

/**
 * @route   POST /api/ai-explain/context-examples
 * @desc    Get context-specific examples and usage
 * @access  Private
 * @body    { word, context, includeVietnamese, forceRefresh }
 */
router.post('/context-examples', protect, aiExplanationController.getContextExamples);

/**
 * @route   POST /api/ai-explain/nuances
 * @desc    Analyze word nuances (sắc thái sử dụng)
 * @access  Private
 * @body    { word, includeVietnamese, forceRefresh }
 */
router.post('/nuances', protect, aiExplanationController.analyzeNuances);

/**
 * @route   POST /api/ai-explain/usage-tips
 * @desc    Get usage tips, common mistakes, and collocations
 * @access  Private
 * @body    { word, includeVietnamese, forceRefresh }
 */
router.post('/usage-tips', protect, aiExplanationController.getUsageTips);

/**
 * @route   POST /api/ai-explain/situation-examples
 * @desc    Generate examples for specific situations
 * @access  Private
 * @body    { word, situation, count }
 */
router.post('/situation-examples', protect, aiExplanationController.generateSituationExamples);

/**
 * @route   POST /api/ai-explain/difference
 * @desc    Explain the difference between two similar words
 * @access  Private
 * @body    { word1, word2, includeVietnamese }
 */
router.post('/difference', protect, aiExplanationController.explainDifference);

/**
 * @route   POST /api/ai-explain/explanations/:explanationId/rate
 * @desc    Rate an explanation (1-5 stars)
 * @access  Private
 * @body    { rating, feedback }
 */
router.post('/explanations/:explanationId/rate', protect, aiExplanationController.rateExplanation);

/**
 * @route   POST /api/ai-explain/comparisons/:comparisonId/feedback
 * @desc    Mark comparison as helpful/not helpful
 * @access  Private
 * @body    { isHelpful: true/false }
 */
router.post('/comparisons/:comparisonId/feedback', protect, aiExplanationController.rateComparison);

/**
 * @route   GET /api/ai-explain/cache/explanation/:word
 * @desc    Get cached explanation if available
 * @access  Private
 */
router.get('/cache/explanation/:word', protect, aiExplanationController.getCachedExplanation);

/**
 * @route   GET /api/ai-explain/cache/comparison
 * @desc    Get cached comparison if available
 * @access  Private
 * @query   words (comma-separated)
 */
router.get('/cache/comparison', protect, aiExplanationController.getCachedComparison);

/**
 * @route   GET /api/ai-explain/cache/context-examples
 * @desc    Get cached context examples if available
 * @access  Private
 * @query   word, context
 */
router.get('/cache/context-examples', protect, aiExplanationController.getCachedContextExamples);

/**
 * @route   DELETE /api/ai-explain/cache/expired
 * @desc    Clear expired cache entries (Admin only)
 * @access  Private/Admin
 */
router.delete('/cache/expired', protect, aiExplanationController.clearExpiredCache);

module.exports = router;
