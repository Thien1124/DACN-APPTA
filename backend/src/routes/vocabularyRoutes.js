const express = require('express');
const router = express.Router();
const vocabularyController = require('../controllers/vocabularyController');
const { protect, authorize } = require('../middleware/authMiddleware');

// ========== PUBLIC ROUTES (User có thể xem) ==========
// ✅ Route lấy từ vựng đã học - KHÔNG cần admin
router.get('/learned', protect, vocabularyController.getLearnedVocabularies);

// ✅ Route đánh dấu/star từ vựng
router.post('/:id/star', protect, vocabularyController.toggleStarVocabulary);

// ✅ Route đánh dấu đã học
router.post('/:id/learn', protect, vocabularyController.markAsLearned);

// ========== ADMIN ROUTES ==========
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(vocabularyController.getAllVocabularies)
  .post(vocabularyController.createVocabulary);

router
  .route('/bulk')
  .post(vocabularyController.createBulkVocabularies);

router
  .route('/:id')
  .get(vocabularyController.getVocabularyById)
  .put(vocabularyController.updateVocabulary)
  .delete(vocabularyController.deleteVocabulary);

module.exports = router;