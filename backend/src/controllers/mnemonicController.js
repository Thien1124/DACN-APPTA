const mnemonicService = require('../services/mnemonicService');

/**
 * @route   POST /api/mnemonic/generate
 * @desc    Generate comprehensive mnemonic for a word
 * @desc    Tạo mnemonic toàn diện cho một từ
 * @access  Private
 */
const generateMnemonic = async (req, res) => {
  try {
    const { word, wordVietnamese, userContext } = req.body;

    if (!word) {
      return res.status(400).json({
        success: false,
        message: 'Word is required',
        messageVietnamese: 'Từ vựng là bắt buộc'
      });
    }

    const mnemonic = await mnemonicService.generateMnemonic(word, wordVietnamese, userContext);

    res.json({
      success: true,
      message: 'Mnemonic generated successfully',
      messageVietnamese: 'Tạo mnemonic thành công',
      data: mnemonic
    });
  } catch (error) {
    console.error('Generate mnemonic error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate mnemonic',
      messageVietnamese: 'Không thể tạo mnemonic'
    });
  }
};

/**
 * @route   POST /api/mnemonic/visualization
 * @desc    Generate detailed visualization suggestion
 * @desc    Tạo gợi ý hình ảnh hóa chi tiết
 * @access  Private
 */
const generateVisualization = async (req, res) => {
  try {
    const { word, wordVietnamese, visualizationType } = req.body;

    if (!word) {
      return res.status(400).json({
        success: false,
        message: 'Word is required',
        messageVietnamese: 'Từ vựng là bắt buộc'
      });
    }

    const visualization = await mnemonicService.generateVisualization(
      word,
      wordVietnamese,
      visualizationType
    );

    res.json({
      success: true,
      message: 'Visualization generated successfully',
      messageVietnamese: 'Tạo hình ảnh hóa thành công',
      data: visualization
    });
  } catch (error) {
    console.error('Generate visualization error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate visualization',
      messageVietnamese: 'Không thể tạo hình ảnh hóa'
    });
  }
};

/**
 * @route   POST /api/mnemonic/techniques
 * @desc    Get memory techniques for word type
 * @desc    Lấy kỹ thuật ghi nhớ cho loại từ
 * @access  Private
 */
const getMemoryTechniques = async (req, res) => {
  try {
    const { wordType, difficulty } = req.body;

    if (!wordType) {
      return res.status(400).json({
        success: false,
        message: 'Word type is required',
        messageVietnamese: 'Loại từ là bắt buộc'
      });
    }

    const techniques = await mnemonicService.getMemoryTechniques(wordType, difficulty);

    res.json({
      success: true,
      message: 'Memory techniques retrieved successfully',
      messageVietnamese: 'Lấy kỹ thuật ghi nhớ thành công',
      data: techniques
    });
  } catch (error) {
    console.error('Get memory techniques error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get memory techniques',
      messageVietnamese: 'Không thể lấy kỹ thuật ghi nhớ'
    });
  }
};

/**
 * @route   POST /api/mnemonic/story
 * @desc    Generate story-based mnemonic for multiple words
 * @desc    Tạo mnemonic dựa trên câu chuyện cho nhiều từ
 * @access  Private
 */
const generateStoryMnemonic = async (req, res) => {
  try {
    const { words, theme } = req.body;

    if (!words || !Array.isArray(words) || words.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Words array is required',
        messageVietnamese: 'Mảng từ vựng là bắt buộc'
      });
    }

    const story = await mnemonicService.generateStoryMnemonic(words, theme);

    res.json({
      success: true,
      message: 'Story mnemonic generated successfully',
      messageVietnamese: 'Tạo câu chuyện ghi nhớ thành công',
      data: story
    });
  } catch (error) {
    console.error('Generate story mnemonic error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate story mnemonic',
      messageVietnamese: 'Không thể tạo câu chuyện ghi nhớ'
    });
  }
};

/**
 * @route   POST /api/mnemonic/association-chain
 * @desc    Generate association chain for a word
 * @desc    Tạo chuỗi liên tưởng cho một từ
 * @access  Private
 */
const generateAssociationChain = async (req, res) => {
  try {
    const { word, wordVietnamese, depth } = req.body;

    if (!word) {
      return res.status(400).json({
        success: false,
        message: 'Word is required',
        messageVietnamese: 'Từ vựng là bắt buộc'
      });
    }

    const chain = await mnemonicService.generateAssociationChain(
      word,
      wordVietnamese,
      depth || 5
    );

    res.json({
      success: true,
      message: 'Association chain generated successfully',
      messageVietnamese: 'Tạo chuỗi liên tưởng thành công',
      data: chain
    });
  } catch (error) {
    console.error('Generate association chain error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate association chain',
      messageVietnamese: 'Không thể tạo chuỗi liên tưởng'
    });
  }
};

/**
 * @route   POST /api/mnemonic/phonetic
 * @desc    Generate phonetic-based mnemonic
 * @desc    Tạo mnemonic dựa trên phát âm
 * @access  Private
 */
const generatePhoneticMnemonic = async (req, res) => {
  try {
    const { word, wordVietnamese } = req.body;

    if (!word) {
      return res.status(400).json({
        success: false,
        message: 'Word is required',
        messageVietnamese: 'Từ vựng là bắt buộc'
      });
    }

    const phonetic = await mnemonicService.generatePhoneticMnemonic(word, wordVietnamese);

    res.json({
      success: true,
      message: 'Phonetic mnemonic generated successfully',
      messageVietnamese: 'Tạo mnemonic phát âm thành công',
      data: phonetic
    });
  } catch (error) {
    console.error('Generate phonetic mnemonic error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate phonetic mnemonic',
      messageVietnamese: 'Không thể tạo mnemonic phát âm'
    });
  }
};

/**
 * @route   POST /api/mnemonic/:id/rate
 * @desc    Rate a mnemonic
 * @desc    Đánh giá mnemonic
 * @access  Private
 */
const rateMnemonic = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, mnemonicType, feedback } = req.body;
    const userId = req.user._id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
        messageVietnamese: 'Đánh giá phải từ 1 đến 5'
      });
    }

    const mnemonic = await mnemonicService.rateMnemonic(
      id,
      userId,
      rating,
      mnemonicType,
      feedback
    );

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      messageVietnamese: 'Gửi đánh giá thành công',
      data: {
        averageRating: mnemonic.averageRating,
        totalRatings: mnemonic.totalRatings
      }
    });
  } catch (error) {
    console.error('Rate mnemonic error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit rating',
      messageVietnamese: 'Không thể gửi đánh giá'
    });
  }
};

/**
 * @route   POST /api/mnemonic/visualization/:id/feedback
 * @desc    Provide feedback on visualization
 * @desc    Cung cấp phản hồi về hình ảnh hóa
 * @access  Private
 */
const feedbackVisualization = async (req, res) => {
  try {
    const { id } = req.params;
    const { isHelpful, comment } = req.body;
    const userId = req.user._id;

    if (typeof isHelpful !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isHelpful is required',
        messageVietnamese: 'isHelpful là bắt buộc'
      });
    }

    const visualization = await mnemonicService.feedbackVisualization(
      id,
      userId,
      isHelpful,
      comment
    );

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      messageVietnamese: 'Gửi phản hồi thành công',
      data: {
        helpfulCount: visualization.helpfulCount,
        notHelpfulCount: visualization.notHelpfulCount
      }
    });
  } catch (error) {
    console.error('Feedback visualization error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit feedback',
      messageVietnamese: 'Không thể gửi phản hồi'
    });
  }
};

/**
 * @route   GET /api/mnemonic/cache/:word
 * @desc    Get cached mnemonic for a word
 * @desc    Lấy mnemonic đã lưu cho một từ
 * @access  Private
 */
const getCachedMnemonic = async (req, res) => {
  try {
    const { word } = req.params;

    const mnemonic = await mnemonicService.getCachedMnemonic(word);

    if (!mnemonic) {
      return res.status(404).json({
        success: false,
        message: 'Mnemonic not found in cache',
        messageVietnamese: 'Không tìm thấy mnemonic trong bộ nhớ'
      });
    }

    res.json({
      success: true,
      message: 'Cached mnemonic retrieved',
      messageVietnamese: 'Lấy mnemonic từ bộ nhớ thành công',
      data: mnemonic
    });
  } catch (error) {
    console.error('Get cached mnemonic error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get cached mnemonic',
      messageVietnamese: 'Không thể lấy mnemonic từ bộ nhớ'
    });
  }
};

/**
 * @route   GET /api/mnemonic/cache/visualization/:word
 * @desc    Get cached visualization for a word
 * @desc    Lấy hình ảnh hóa đã lưu cho một từ
 * @access  Private
 */
const getCachedVisualization = async (req, res) => {
  try {
    const { word } = req.params;

    const visualization = await mnemonicService.getCachedVisualization(word);

    if (!visualization) {
      return res.status(404).json({
        success: false,
        message: 'Visualization not found in cache',
        messageVietnamese: 'Không tìm thấy hình ảnh hóa trong bộ nhớ'
      });
    }

    res.json({
      success: true,
      message: 'Cached visualization retrieved',
      messageVietnamese: 'Lấy hình ảnh hóa từ bộ nhớ thành công',
      data: visualization
    });
  } catch (error) {
    console.error('Get cached visualization error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get cached visualization',
      messageVietnamese: 'Không thể lấy hình ảnh hóa từ bộ nhớ'
    });
  }
};

/**
 * @route   DELETE /api/mnemonic/cache/expired
 * @desc    Clear expired cache (admin only)
 * @desc    Xóa bộ nhớ hết hạn (chỉ admin)
 * @access  Private/Admin
 */
const clearExpiredCache = async (req, res) => {
  try {
    const result = await mnemonicService.clearExpiredCache();

    res.json({
      success: true,
      message: 'Expired cache cleared successfully',
      messageVietnamese: 'Xóa bộ nhớ hết hạn thành công',
      data: result
    });
  } catch (error) {
    console.error('Clear expired cache error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to clear expired cache',
      messageVietnamese: 'Không thể xóa bộ nhớ hết hạn'
    });
  }
};

module.exports = {
  generateMnemonic,
  generateVisualization,
  getMemoryTechniques,
  generateStoryMnemonic,
  generateAssociationChain,
  generatePhoneticMnemonic,
  rateMnemonic,
  feedbackVisualization,
  getCachedMnemonic,
  getCachedVisualization,
  clearExpiredCache
};
