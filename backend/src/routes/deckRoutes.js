const express = require('express');
const router = express.Router();
const deckController = require('../controllers/deckController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Tất cả routes đều yêu cầu đăng nhập và quyền admin
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(deckController.getAllDecks)
  .post(deckController.createDeck);

router
  .route('/:id')
  .get(deckController.getDeckById)
  .put(deckController.updateDeck)
  .delete(deckController.deleteDeck);

router.patch('/:id/publish', deckController.togglePublishDeck);

// Routes để lấy deck theo khóa học và unit
router.get('/course/:courseId', deckController.getDecksByCourse);
router.get('/unit/:unitId', deckController.getDecksByUnit);

module.exports = router;