const express = require('express');
const router = express.Router();
const deckController = require('../controllers/deckController');
const deckPreviewController = require('../controllers/deckPreviewController');
const deckManagementController = require('../controllers/deckManagementController');
const { protect, authorize } = require('../middleware/authMiddleware');

// ==================== PUBLIC ROUTES (Task 15) ====================
// Các routes này KHÔNG cần đăng nhập - để user browse decks

// Browse & Filter decks (giống Duolingo)
router.get('/browse', deckController.browseDecks);

// ==================== TASK 16: TÌM KIẾM ====================
// Advanced search với từ khóa và tags
router.get('/search', deckController.searchDecks);

// Search suggestions (autocomplete)
router.get('/search/suggestions', deckController.getSearchSuggestions);

// Get all tags with counts
router.get('/tags', deckController.getAllTags);

// Get all categories with counts
router.get('/categories', deckController.getCategories);

// Get featured decks
router.get('/featured', deckController.getFeaturedDecks);

// Get popular decks
router.get('/popular', deckController.getPopularDecks);

// ==================== TASK 17: XEM TRƯỚC & ĐÁNH GIÁ ====================
// Deck preview với sample cards (Public)
router.get('/:id/preview', deckPreviewController.getDeckPreview);

// Get all reviews for a deck (Public)
router.get('/:id/reviews', deckPreviewController.getDeckReviews);

// Get my review for a deck (Private)
router.get('/:id/reviews/my', protect, deckPreviewController.getMyReview);

// Create/Update review (Private)
router.post('/:id/reviews', protect, deckPreviewController.createOrUpdateReview);

// Delete my review (Private)
router.delete('/:id/reviews', protect, deckPreviewController.deleteReview);

// Increment view count (public - khi user xem deck)
router.post('/:id/view', deckController.incrementViewCount);

// Increment study count (yêu cầu đăng nhập)
router.post('/:id/study', protect, deckController.incrementStudyCount);

// ==================== TASK 18: DECK MANAGEMENT ====================
// Clone/Copy deck (Private)
router.post('/:id/clone', protect, deckManagementController.cloneDeck);

// Merge multiple decks (Private)
router.post('/merge', protect, deckManagementController.mergeDecks);

// Split deck (Private)
router.post('/:id/split', protect, deckManagementController.splitDeck);

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
  .get(protect, deckController.getDeckByIdForUser)  // ✅ Dùng getDeckByIdForUser thay vì getDeckById
  .put(protect, authorize('admin'), deckController.updateDeck)
  .delete(protect, authorize('admin'), deckController.deleteDeck);

router.patch('/:id/publish', protect, authorize('admin'), deckController.togglePublishDeck);

// Routes để lấy deck theo khóa học và unit (admin)
router.get('/course/:courseId', protect, authorize('admin'), deckController.getDecksByCourse);
router.get('/unit/:unitId', protect, authorize('admin'), deckController.getDecksByUnit);

// ✅ Đảm bảo route có protect middleware
router.get('/:id/flashcards', protect, deckController.getDeckWithFlashcards);

module.exports = router;