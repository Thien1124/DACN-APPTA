const mongoose = require('mongoose');
const Deck = require('../models/Deck');
const Flashcard = require('../models/Flashcard');
const DeckReview = require('../models/DeckReview');

// @desc    Get deck preview (public info + sample cards)
// @route   GET /api/decks/:id/preview
// @access  Public
exports.getDeckPreview = async (req, res) => {
  try {
    const { id } = req.params;
    const { sampleSize = 5 } = req.query;

    // 1. Get deck info
    const deck = await Deck.findById(id)
      .populate('createdBy', 'fullName avatar')
      .populate('course', 'title')
      .populate('unit', 'title');

    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bộ thẻ'
      });
    }

    // Check if deck is public
    if (!deck.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Bộ thẻ này không công khai'
      });
    }

    // 2. Get sample flashcards (random)
    const totalCards = await Flashcard.countDocuments({ deck: id });
    const sampleCards = await Flashcard.find({ deck: id })
      .limit(parseInt(sampleSize))
      .select('front back example imageUrl audioUrl');

    // 3. Get rating summary
    const reviews = await DeckReview.find({ deck: id });
    const ratingDistribution = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };
    
    reviews.forEach(review => {
      ratingDistribution[review.rating]++;
    });

    // 4. Get recent reviews (top 3)
    const recentReviews = await DeckReview.find({ deck: id })
      .populate('user', 'fullName avatar')
      .sort({ createdAt: -1 })
      .limit(3)
      .select('rating comment aspects helpfulCount createdAt');

    res.json({
      success: true,
      data: {
        deck: {
          _id: deck._id,
          title: deck.title,
          description: deck.description,
          category: deck.category,
          level: deck.level,
          difficulty: deck.difficulty,
          tags: deck.tags,
          totalCards: deck.totalCards,
          studyCount: deck.studyCount,
          viewCount: deck.viewCount,
          rating: deck.rating,
          ratingCount: deck.ratingCount,
          createdBy: deck.createdBy,
          course: deck.course,
          unit: deck.unit,
          imageUrl: deck.imageUrl,
          createdAt: deck.createdAt
        },
        sampleCards,
        totalCards,
        ratingDistribution,
        recentReviews
      }
    });

  } catch (error) {
    console.error('[ERROR] Get deck preview:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xem trước bộ thẻ',
      error: error.message
    });
  }
};

// @desc    Get all reviews for a deck
// @route   GET /api/decks/:id/reviews
// @access  Public
exports.getDeckReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      sort = 'newest', 
      rating,
      page = 1, 
      limit = 10 
    } = req.query;

    // Build query
    const query = { deck: id };
    
    if (rating) {
      query.rating = parseInt(rating);
    }

    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'helpful':
        sortOption = { helpfulCount: -1, createdAt: -1 };
        break;
      case 'rating-high':
        sortOption = { rating: -1, createdAt: -1 };
        break;
      case 'rating-low':
        sortOption = { rating: 1, createdAt: -1 };
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await DeckReview.find(query)
      .populate('user', 'fullName avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DeckReview.countDocuments(query);

    // Get rating summary
    const ratingStats = await DeckReview.aggregate([
      { $match: { deck: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      }
    ]);

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratingStats.forEach(stat => {
      ratingDistribution[stat._id] = stat.count;
    });

    res.json({
      success: true,
      count: reviews.length,
      data: {
        reviews,
        ratingDistribution,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('[ERROR] Get deck reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy đánh giá',
      error: error.message
    });
  }
};

// @desc    Create/Update review for a deck
// @route   POST /api/decks/:id/reviews
// @access  Private
exports.createOrUpdateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, aspects } = req.body;
    const userId = req.user.id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating phải từ 1-5'
      });
    }

    // Check if deck exists
    const deck = await Deck.findById(id);
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bộ thẻ'
      });
    }

    // Check if user already reviewed
    let review = await DeckReview.findOne({ deck: id, user: userId });

    if (review) {
      // Update existing review
      review.rating = rating;
      review.comment = comment || review.comment;
      review.aspects = aspects || review.aspects;
      review.updatedAt = Date.now();
      await review.save();

      return res.json({
        success: true,
        message: 'Đã cập nhật đánh giá',
        data: review
      });
    } else {
      // Create new review
      review = await DeckReview.create({
        deck: id,
        user: userId,
        rating,
        comment,
        aspects
      });

      return res.status(201).json({
        success: true,
        message: 'Đã thêm đánh giá',
        data: review
      });
    }

  } catch (error) {
    console.error('[ERROR] Create/Update review:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo đánh giá',
      error: error.message
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/decks/:id/reviews
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await DeckReview.findOne({ deck: id, user: userId });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá của bạn'
      });
    }

    // Save deckId before deleting for rating update
    const deckId = review.deck;
    
    // Use deleteOne() instead of remove()
    await review.deleteOne();

    res.json({
      success: true,
      message: 'Đã xóa đánh giá'
    });

  } catch (error) {
    console.error('[ERROR] Delete review:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa đánh giá',
      error: error.message
    });
  }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:reviewId/helpful
// @access  Private
exports.markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await DeckReview.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }

    // Check if user already marked as helpful
    const alreadyMarked = review.helpfulUsers.includes(userId);

    if (alreadyMarked) {
      // Remove helpful mark
      review.helpfulUsers = review.helpfulUsers.filter(
        id => id.toString() !== userId
      );
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    } else {
      // Add helpful mark
      review.helpfulUsers.push(userId);
      review.helpfulCount += 1;
    }

    await review.save();

    res.json({
      success: true,
      message: alreadyMarked ? 'Đã bỏ hữu ích' : 'Đã đánh dấu hữu ích',
      data: {
        helpfulCount: review.helpfulCount,
        isMarked: !alreadyMarked
      }
    });

  } catch (error) {
    console.error('[ERROR] Mark review helpful:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đánh dấu hữu ích',
      error: error.message
    });
  }
};

// @desc    Report review
// @route   POST /api/reviews/:reviewId/report
// @access  Private
exports.reportReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;

    const review = await DeckReview.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }

    review.isReported = true;
    review.reportCount += 1;
    await review.save();

    // TODO: Send notification to admin
    // TODO: Log report reason

    res.json({
      success: true,
      message: 'Đã báo cáo đánh giá. Admin sẽ xem xét.',
      data: {
        reportCount: review.reportCount
      }
    });

  } catch (error) {
    console.error('[ERROR] Report review:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi báo cáo đánh giá',
      error: error.message
    });
  }
};

// @desc    Get user's review for a deck
// @route   GET /api/decks/:id/reviews/my
// @access  Private
exports.getMyReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await DeckReview.findOne({ deck: id, user: userId })
      .populate('user', 'fullName avatar');

    if (!review) {
      return res.json({
        success: true,
        data: null
      });
    }

    res.json({
      success: true,
      data: review
    });

  } catch (error) {
    console.error('[ERROR] Get my review:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy đánh giá của bạn',
      error: error.message
    });
  }
};
