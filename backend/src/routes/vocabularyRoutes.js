const express = require('express');
const router = express.Router();
const vocabularyController = require('../controllers/vocabularyController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Tất cả routes đều yêu cầu đăng nhập và quyền admin
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