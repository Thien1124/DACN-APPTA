const express = require('express');
const router = express.Router();
const mnemonicController = require('../controllers/mnemonicController');
const { protect } = require('../middleware/auth');

/**
 * Mnemonic Generation Routes
 * Routes tạo mnemonic
 */

// @route   POST /api/mnemonic/generate
// @desc    Generate comprehensive mnemonic for a word
// @desc    Tạo mnemonic toàn diện cho một từ
// @access  Private
router.post('/generate', protect, mnemonicController.generateMnemonic);

// @route   POST /api/mnemonic/visualization
// @desc    Generate detailed visualization suggestion
// @desc    Tạo gợi ý hình ảnh hóa chi tiết
// @access  Private
router.post('/visualization', protect, mnemonicController.generateVisualization);

// @route   POST /api/mnemonic/techniques
// @desc    Get memory techniques for word type
// @desc    Lấy kỹ thuật ghi nhớ cho loại từ
// @access  Private
router.post('/techniques', protect, mnemonicController.getMemoryTechniques);

// @route   POST /api/mnemonic/story
// @desc    Generate story-based mnemonic for multiple words
// @desc    Tạo mnemonic dựa trên câu chuyện cho nhiều từ
// @access  Private
router.post('/story', protect, mnemonicController.generateStoryMnemonic);

// @route   POST /api/mnemonic/association-chain
// @desc    Generate association chain for a word
// @desc    Tạo chuỗi liên tưởng cho một từ
// @access  Private
router.post('/association-chain', protect, mnemonicController.generateAssociationChain);

// @route   POST /api/mnemonic/phonetic
// @desc    Generate phonetic-based mnemonic
// @desc    Tạo mnemonic dựa trên phát âm
// @access  Private
router.post('/phonetic', protect, mnemonicController.generatePhoneticMnemonic);

/**
 * Rating & Feedback Routes
 * Routes đánh giá và phản hồi
 */

// @route   POST /api/mnemonic/:id/rate
// @desc    Rate a mnemonic
// @desc    Đánh giá mnemonic
// @access  Private
router.post('/:id/rate', protect, mnemonicController.rateMnemonic);

// @route   POST /api/mnemonic/visualization/:id/feedback
// @desc    Provide feedback on visualization
// @desc    Cung cấp phản hồi về hình ảnh hóa
// @access  Private
router.post('/visualization/:id/feedback', protect, mnemonicController.feedbackVisualization);

/**
 * Cache Management Routes
 * Routes quản lý bộ nhớ
 */

// @route   GET /api/mnemonic/cache/:word
// @desc    Get cached mnemonic for a word
// @desc    Lấy mnemonic đã lưu cho một từ
// @access  Private
router.get('/cache/:word', protect, mnemonicController.getCachedMnemonic);

// @route   GET /api/mnemonic/cache/visualization/:word
// @desc    Get cached visualization for a word
// @desc    Lấy hình ảnh hóa đã lưu cho một từ
// @access  Private
router.get('/cache/visualization/:word', protect, mnemonicController.getCachedVisualization);

// @route   DELETE /api/mnemonic/cache/expired
// @desc    Clear expired cache (admin only)
// @desc    Xóa bộ nhớ hết hạn (chỉ admin)
// @access  Private/Admin
router.delete('/cache/expired', protect, mnemonicController.clearExpiredCache);

module.exports = router;
