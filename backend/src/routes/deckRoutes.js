const express = require('express');
const router = express.Router();
const deckController = require('../controllers/deckController');
const { protect, authorize } = require('../middleware/authMiddleware');

// ==================== PUBLIC ROUTES (Task 15) ====================
// Các routes này KHÔNG cần đăng nhập - để user browse decks

// Browse & Filter decks (giống Duolingo)
router.get('/browse', deckController.browseDecks);

// Get all categories with counts
router.get('/categories', deckController.getCategories);

// Get featured decks
router.get('/featured', deckController.getFeaturedDecks);

// Get popular decks
router.get('/popular', deckController.getPopularDecks);

// Increment view count (public - khi user xem deck)
router.post('/:id/view', deckController.incrementViewCount);

// Increment study count (yêu cầu đăng nhập)
router.post('/:id/study', protect, deckController.incrementStudyCount);

router.post('/', protect, deckController.createDeck);

router.get('/my-decks', protect, deckController.getMyDecks);  // Cần thêm controller này
router.put('/:id', protect, deckController.updateDeck);       // Cần kiểm tra ownership
router.delete('/:id', protect, deckController.deleteDeck);     // Cần kiểm tra ownership

// ==================== ADMIN ROUTES ====================
// Routes này yêu cầu đăng nhập và quyền admin

router
  .route('/')
  .get(protect, authorize('admin'), deckController.getAllDecks)
  .post(protect, authorize('admin'), deckController.createDeck);

router
  .route('/:id')
  .get(protect, authorize('admin'), deckController.getDeckById)
  .put(protect, authorize('admin'), deckController.updateDeck)
  .delete(protect, authorize('admin'), deckController.deleteDeck);

router.patch('/:id/publish', protect, authorize('admin'), deckController.togglePublishDeck);

// Routes để lấy deck theo khóa học và unit (admin)
router.get('/course/:courseId', protect, authorize('admin'), deckController.getDecksByCourse);
router.get('/unit/:unitId', protect, authorize('admin'), deckController.getDecksByUnit);

module.exports = router;