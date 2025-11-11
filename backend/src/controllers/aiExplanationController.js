const aiExplanationService = require('../services/aiExplanationService');

/**
 * @desc    Explain word with AI (meaning, nuances, usage)
 * @route   POST /api/ai-explain/word
 * @access  Private
 */
const explainWord = async (req, res) => {
  try {
    const { word, includeVietnamese, forceRefresh } = req.body;
    const userId = req.user._id;
    
    if (!word) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a word to explain'
      });
    }
    
    const explanation = await aiExplanationService.explainWord(word, userId, {
      includeVietnamese: includeVietnamese !== false,
      forceRefresh: forceRefresh === true
    });
    
    res.status(200).json({
      success: true,
      data: explanation
    });
  } catch (error) {
    console.error('Error explaining word:', error);
    res.status(500).json({
      success: false,
      message: 'Error explaining word',
      error: error.message
    });
  }
};

/**
 * @desc    Compare synonyms with detailed analysis
 * @route   POST /api/ai-explain/compare
 * @access  Private
 */
const compareSynonyms = async (req, res) => {
  try {
    const { words, includeVietnamese, forceRefresh } = req.body;
    const userId = req.user._id;
    
    if (!words || !Array.isArray(words) || words.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least 2 words to compare'
      });
    }
    
    const comparison = await aiExplanationService.compareSynonyms(words, userId, {
      includeVietnamese: includeVietnamese !== false,
      forceRefresh: forceRefresh === true
    });
    
    res.status(200).json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Error comparing synonyms:', error);
    res.status(500).json({
      success: false,
      message: 'Error comparing synonyms',
      error: error.message
    });
  }
};

/**
 * @desc    Get context-specific examples
 * @route   POST /api/ai-explain/context-examples
 * @access  Private
 */
const getContextExamples = async (req, res) => {
  try {
    const { word, context, includeVietnamese, forceRefresh } = req.body;
    const userId = req.user._id;
    
    if (!word || !context) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both word and context'
      });
    }
    
    const examples = await aiExplanationService.getContextExamples(word, context, userId, {
      includeVietnamese: includeVietnamese !== false,
      forceRefresh: forceRefresh === true
    });
    
    res.status(200).json({
      success: true,
      data: examples
    });
  } catch (error) {
    console.error('Error getting context examples:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting context examples',
      error: error.message
    });
  }
};

/**
 * @desc    Analyze word nuances (sắc thái)
 * @route   POST /api/ai-explain/nuances
 * @access  Private
 */
const analyzeNuances = async (req, res) => {
  try {
    const { word, includeVietnamese, forceRefresh } = req.body;
    const userId = req.user._id;
    
    if (!word) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a word to analyze'
      });
    }
    
    const nuances = await aiExplanationService.analyzeNuances(word, userId, {
      includeVietnamese: includeVietnamese !== false,
      forceRefresh: forceRefresh === true
    });
    
    res.status(200).json({
      success: true,
      data: nuances
    });
  } catch (error) {
    console.error('Error analyzing nuances:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing nuances',
      error: error.message
    });
  }
};

/**
 * @desc    Get usage tips for a word
 * @route   POST /api/ai-explain/usage-tips
 * @access  Private
 */
const getUsageTips = async (req, res) => {
  try {
    const { word, includeVietnamese, forceRefresh } = req.body;
    const userId = req.user._id;
    
    if (!word) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a word'
      });
    }
    
    const tips = await aiExplanationService.getUsageTips(word, userId, {
      includeVietnamese: includeVietnamese !== false,
      forceRefresh: forceRefresh === true
    });
    
    res.status(200).json({
      success: true,
      data: tips
    });
  } catch (error) {
    console.error('Error getting usage tips:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting usage tips',
      error: error.message
    });
  }
};

/**
 * @desc    Generate situation-specific examples
 * @route   POST /api/ai-explain/situation-examples
 * @access  Private
 */
const generateSituationExamples = async (req, res) => {
  try {
    const { word, situation, count } = req.body;
    const userId = req.user._id;
    
    if (!word || !situation) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both word and situation'
      });
    }
    
    const examples = await aiExplanationService.generateSituationExamples(
      word,
      situation,
      count || 5,
      userId
    );
    
    res.status(200).json({
      success: true,
      data: examples
    });
  } catch (error) {
    console.error('Error generating situation examples:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating situation examples',
      error: error.message
    });
  }
};

/**
 * @desc    Explain difference between two words
 * @route   POST /api/ai-explain/difference
 * @access  Private
 */
const explainDifference = async (req, res) => {
  try {
    const { word1, word2, includeVietnamese } = req.body;
    const userId = req.user._id;
    
    if (!word1 || !word2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide two words to compare'
      });
    }
    
    const difference = await aiExplanationService.explainDifference(word1, word2, userId, {
      includeVietnamese: includeVietnamese !== false
    });
    
    res.status(200).json({
      success: true,
      data: difference
    });
  } catch (error) {
    console.error('Error explaining difference:', error);
    res.status(500).json({
      success: false,
      message: 'Error explaining difference',
      error: error.message
    });
  }
};

/**
 * @desc    Rate an explanation
 * @route   POST /api/ai-explain/explanations/:explanationId/rate
 * @access  Private
 */
const rateExplanation = async (req, res) => {
  try {
    const { explanationId } = req.params;
    const { rating, feedback } = req.body;
    const userId = req.user._id;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a rating between 1 and 5'
      });
    }
    
    const explanation = await aiExplanationService.rateExplanation(
      explanationId,
      userId,
      rating,
      feedback
    );
    
    res.status(200).json({
      success: true,
      message: 'Thank you for your feedback',
      data: {
        averageRating: explanation.averageRating,
        totalRatings: explanation.userRatings.length
      }
    });
  } catch (error) {
    console.error('Error rating explanation:', error);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Mark comparison as helpful/not helpful
 * @route   POST /api/ai-explain/comparisons/:comparisonId/feedback
 * @access  Private
 */
const rateComparison = async (req, res) => {
  try {
    const { comparisonId } = req.params;
    const { isHelpful } = req.body;
    
    if (typeof isHelpful !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Please specify if the comparison was helpful (true/false)'
      });
    }
    
    const comparison = await aiExplanationService.rateComparison(comparisonId, isHelpful);
    
    res.status(200).json({
      success: true,
      message: 'Thank you for your feedback',
      data: {
        helpfulCount: comparison.helpfulCount,
        notHelpfulCount: comparison.notHelpfulCount
      }
    });
  } catch (error) {
    console.error('Error rating comparison:', error);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get cached explanation
 * @route   GET /api/ai-explain/cache/explanation/:word
 * @access  Private
 */
const getCachedExplanation = async (req, res) => {
  try {
    const { word } = req.params;
    
    const explanation = await aiExplanationService.getCachedExplanation(word);
    
    if (!explanation) {
      return res.status(404).json({
        success: false,
        message: 'No cached explanation found for this word'
      });
    }
    
    res.status(200).json({
      success: true,
      data: explanation
    });
  } catch (error) {
    console.error('Error getting cached explanation:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting cached explanation',
      error: error.message
    });
  }
};

/**
 * @desc    Get cached comparison
 * @route   GET /api/ai-explain/cache/comparison
 * @access  Private
 */
const getCachedComparison = async (req, res) => {
  try {
    const { words } = req.query;
    
    if (!words) {
      return res.status(400).json({
        success: false,
        message: 'Please provide words parameter (comma-separated)'
      });
    }
    
    const wordArray = words.split(',').map(w => w.trim());
    const comparison = await aiExplanationService.getCachedComparison(wordArray);
    
    if (!comparison) {
      return res.status(404).json({
        success: false,
        message: 'No cached comparison found for these words'
      });
    }
    
    res.status(200).json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Error getting cached comparison:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting cached comparison',
      error: error.message
    });
  }
};

/**
 * @desc    Get cached context examples
 * @route   GET /api/ai-explain/cache/context-examples
 * @access  Private
 */
const getCachedContextExamples = async (req, res) => {
  try {
    const { word, context } = req.query;
    
    if (!word || !context) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both word and context parameters'
      });
    }
    
    const examples = await aiExplanationService.getCachedContextExamples(word, context);
    
    if (!examples) {
      return res.status(404).json({
        success: false,
        message: 'No cached examples found for this word and context'
      });
    }
    
    res.status(200).json({
      success: true,
      data: examples
    });
  } catch (error) {
    console.error('Error getting cached context examples:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting cached context examples',
      error: error.message
    });
  }
};

/**
 * @desc    Clear expired cache (Admin only)
 * @route   DELETE /api/ai-explain/cache/expired
 * @access  Private/Admin
 */
const clearExpiredCache = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can clear cache'
      });
    }
    
    const result = await aiExplanationService.clearExpiredCache();
    
    res.status(200).json({
      success: true,
      message: 'Expired cache cleared successfully',
      data: result
    });
  } catch (error) {
    console.error('Error clearing expired cache:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing expired cache',
      error: error.message
    });
  }
};

module.exports = {
  explainWord,
  compareSynonyms,
  getContextExamples,
  analyzeNuances,
  getUsageTips,
  generateSituationExamples,
  explainDifference,
  rateExplanation,
  rateComparison,
  getCachedExplanation,
  getCachedComparison,
  getCachedContextExamples,
  clearExpiredCache
};
