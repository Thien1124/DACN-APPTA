const express = require('express');
<<<<<<< HEAD
const {
  getVocabularies,
  getVocabulary,
  createVocabulary,
  createVocabulariesBulk,
  updateVocabulary,
  deleteVocabulary
} = require('../controllers/vocabularyController');

const router = express.Router({ mergeParams: true });

// Middleware bảo vệ
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(getVocabularies)
  .post(protect, authorize('admin'), createVocabulary);

router
  .route('/bulk')
  .post(protect, authorize('admin'), createVocabulariesBulk);

router
  .route('/:id')
  .get(getVocabulary)
  .put(protect, authorize('admin'), updateVocabulary)
  .delete(protect, authorize('admin'), deleteVocabulary);
=======
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
>>>>>>> main

module.exports = router;