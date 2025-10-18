const express = require('express');
const {
  getDecks,
  getDeck,
  createDeck,
  updateDeck,
  deleteDeck,
  togglePublishDeck,
  getDecksByCourse,
  getDecksByUnit
} = require('../controllers/deckController');

// Include other resource routers
const flashcardRouter = require('./flashcardRoutes');

const router = express.Router({ mergeParams: true });

// Middleware bảo vệ
const { protect, authorize } = require('../middleware/authMiddleware');

// Re-route vào các resource routers khác
router.use('/:deckId/flashcards', flashcardRouter);

router
  .route('/')
  .get(getDecks)
  .post(protect, authorize('admin'), createDeck);

router
  .route('/:id')
  .get(getDeck)
  .put(protect, authorize('admin'), updateDeck)
  .delete(protect, authorize('admin'), deleteDeck);

router
  .route('/:id/publish')
  .put(protect, authorize('admin'), togglePublishDeck);

router
  .route('/course/:courseId')
  .get(getDecksByCourse);

router
  .route('/unit/:unitId')
  .get(getDecksByUnit);

module.exports = router;