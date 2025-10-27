const express = require('express');
const {
  getDecks,
  getDeck,
  createDeck,
  updateDeck,
  deleteDeck,
  togglePublishDeck,
  getDecksByCourse,
  getDecksByUnit,
  browseDecks,       // From main
  getCategories,     // From main
  getFeaturedDecks,  // From main
  getPopularDecks,   // From main
  incrementViewCount,// From main
  getMyDecks,        // From main
  incrementStudyCount// From main
} = require('../controllers/deckController');

// Import middleware for advanced results
const Deck = require('../models/Deck');
const advancedResults = require('../middleware/advancedResults');

// Include other resource routers
const flashcardRouter = require('./flashcardRoutes');

const router = express.Router({ mergeParams: true });

// Middleware bảo vệ và phân quyền
const { protect, authorize } = require('../middleware/authMiddleware');

// Re-route vào resource flashcards (ví dụ: /api/v1/decks/:deckId/flashcards)
router.use('/:deckId/flashcards', flashcardRouter);

// ==================== COMMUNITY & PUBLIC ROUTES ====================
// Các routes này KHÔNG cần đăng nhập

router.get('/browse', browseDecks);
router.get('/categories', getCategories);
router.get('/featured', getFeaturedDecks);
router.get('/popular', getPopularDecks);
router.post('/:id/view', incrementViewCount); // User xem deck

// ==================== USER-SPECIFIC ROUTES ====================
// Các routes này yêu cầu đăng nhập

router.get('/my-decks', protect, getMyDecks); // Lấy các bộ thẻ của tôi
router.post('/:id/study', protect, incrementStudyCount); // User học deck

// ==================== ADMIN MANAGEMENT ROUTES ====================
// Các routes này yêu cầu quyền admin

// Lấy decks theo course và unit (dùng cho admin)
router.get('/course/:courseId', getDecksByCourse);
router.get('/unit/:unitId', getDecksByUnit);

router
  .route('/')
  .get(advancedResults(Deck, 'flashcards'), getDecks) // Dùng advanced results
  .post(protect, authorize('admin'), createDeck);

router
  .route('/:id')
  .get(getDeck)
  .put(protect, authorize('admin', 'user'), updateDeck) // Cho phép user tự sửa deck của mình
  .delete(protect, authorize('admin', 'user'), deleteDeck); // Cho phép user tự xóa deck của mình

router
  .route('/:id/publish')
  .patch(protect, authorize('admin', 'user'), togglePublishDeck); // Dùng PATCH

module.exports = router;