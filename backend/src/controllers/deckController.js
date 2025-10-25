const Deck = require('../models/Deck');
const Flashcard = require('../models/Flashcard');

// ==================== CŨ ====================

// Lấy tất cả deck
exports.getAllDecks = async (req, res) => {
  try {
    const decks = await Deck.find()
      .populate('course', 'title')
      .populate('unit', 'title')
      .populate('createdBy', 'fullName email avatar');
    
    res.status(200).json({
      success: true,
      count: decks.length,
      data: decks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách deck',
      error: error.message
    });
  }
};

// Lấy deck theo ID
exports.getDeckById = async (req, res) => {
  try {
    const deck = await Deck.findById(req.params.id)
      .populate('course', 'title')
      .populate('unit', 'title')
      .populate('flashcards')
      .populate('createdBy', 'fullName email avatar');
    
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy deck với ID này'
      });
    }
    
    res.status(200).json({
      success: true,
      data: deck
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin deck',
      error: error.message
    });
  }
};

// Lấy deck theo khóa học
exports.getDecksByCourse = async (req, res) => {
  try {
    const decks = await Deck.find({ course: req.params.courseId })
      .populate('course', 'title')
      .populate('unit', 'title')
      .populate('createdBy', 'fullName avatar');
    
    res.status(200).json({
      success: true,
      count: decks.length,
      data: decks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách deck theo khóa học',
      error: error.message
    });
  }
};

// Lấy deck theo unit
exports.getDecksByUnit = async (req, res) => {
  try {
    const decks = await Deck.find({ unit: req.params.unitId })
      .populate('course', 'title')
      .populate('unit', 'title')
      .populate('createdBy', 'fullName avatar');
    
    res.status(200).json({
      success: true,
      count: decks.length,
      data: decks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách deck theo unit',
      error: error.message
    });
  }
};

// Tạo deck mới
exports.createDeck = async (req, res) => {
  try {
    // Thêm createdBy từ user đang đăng nhập
    const deckData = {
      ...req.body,
      createdBy: req.user.id
    };

    const deck = await Deck.create(deckData);
    
    res.status(201).json({
      success: true,
      data: deck
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể tạo deck mới',
      error: error.message
    });
  }
};

// ✅ Cập nhật deck - CÓ KIỂM TRA QUYỀN
exports.updateDeck = async (req, res) => {
  try {
    let deck = await Deck.findById(req.params.id);
    
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy deck với ID này'
      });
    }

    // Kiểm tra quyền: Chỉ owner hoặc admin mới sửa được
    if (deck.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa deck này'
      });
    }
    
    deck = await Deck.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('course', 'title')
     .populate('unit', 'title')
     .populate('createdBy', 'fullName email avatar');
    
    res.status(200).json({
      success: true,
      data: deck
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể cập nhật deck',
      error: error.message
    });
  }
};

// ✅ Xóa deck - CÓ KIỂM TRA QUYỀN
exports.deleteDeck = async (req, res) => {
  try {
    const deck = await Deck.findById(req.params.id);
    
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy deck với ID này'
      });
    }

    // Kiểm tra quyền: Chỉ owner hoặc admin mới xóa được
    if (deck.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa deck này'
      });
    }
    
    // Kiểm tra xem deck có flashcard không
    const flashcardCount = await Flashcard.countDocuments({ deck: req.params.id });
    
    if (flashcardCount > 0) {
      // Xóa tất cả flashcard thuộc deck này
      await Flashcard.deleteMany({ deck: req.params.id });
    }
    
    await deck.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Deck đã được xóa thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể xóa deck',
      error: error.message
    });
  }
};

// Thay đổi trạng thái xuất bản của deck
exports.togglePublishDeck = async (req, res) => {
  try {
    const deck = await Deck.findById(req.params.id);
    
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy deck với ID này'
      });
    }
    
    deck.isPublished = !deck.isPublished;
    await deck.save();
    
    res.status(200).json({
      success: true,
      data: deck
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể thay đổi trạng thái xuất bản của deck',
      error: error.message
    });
  }
};

// ==================== MỚI - TASK 15 ====================

// @desc    Browse & Filter Decks (giống Duolingo)
// @route   GET /api/decks/browse
// @access  Public
exports.browseDecks = async (req, res) => {
  try {
    const {
      category,
      level,
      difficulty,
      tags,
      isFeatured,
      search,
      sort = 'newest',
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = { isPublic: true };

    // Filter by category
    if (category) {
      query.category = category.toUpperCase();
    }

    // Filter by CEFR level
    if (level) {
      query.level = level.toUpperCase();
    }

    // Filter by difficulty
    if (difficulty) {
      query.difficulty = difficulty.toUpperCase();
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Filter featured
    if (isFeatured === 'true') {
      query.isFeatured = true;
    }

    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'popular':
        sortOption = { studyCount: -1, viewCount: -1 };
        break;
      case 'rating':
        sortOption = { rating: -1, ratingCount: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const decks = await Deck.find(query)
      .populate('createdBy', 'fullName email avatar')
      .populate('course', 'title')
      .populate('unit', 'title')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Deck.countDocuments(query);

    res.json({
      success: true,
      count: decks.length,
      data: {
        decks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        filters: {
          category,
          level,
          difficulty,
          tags,
          isFeatured,
          search,
          sort
        }
      }
    });
  } catch (error) {
    console.error('[ERROR] Browse decks:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi duyệt bộ thẻ',
      error: error.message
    });
  }
};

// @desc    Get categories with counts
// @route   GET /api/decks/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Deck.aggregate([
      { $match: { isPublic: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalCards: { $sum: '$totalCards' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: categories.map(cat => ({
        category: cat._id,
        deckCount: cat.count,
        totalCards: cat.totalCards
      }))
    });
  } catch (error) {
    console.error('[ERROR] Get categories:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách chủ đề',
      error: error.message
    });
  }
};

// @desc    Get featured decks
// @route   GET /api/decks/featured
// @access  Public
exports.getFeaturedDecks = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const decks = await Deck.find({ isPublic: true, isFeatured: true })
      .populate('createdBy', 'fullName avatar')
      .populate('course', 'title')
      .populate('unit', 'title')
      .sort({ studyCount: -1, rating: -1 })
      .limit(limit);

    res.json({
      success: true,
      count: decks.length,
      data: decks
    });
  } catch (error) {
    console.error('[ERROR] Get featured decks:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy bộ thẻ nổi bật',
      error: error.message
    });
  }
};

// @desc    Get popular decks
// @route   GET /api/decks/popular
// @access  Public
exports.getPopularDecks = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;

    const query = { isPublic: true };
    if (category) {
      query.category = category.toUpperCase();
    }

    const decks = await Deck.find(query)
      .populate('createdBy', 'fullName avatar')
      .populate('course', 'title')
      .populate('unit', 'title')
      .sort({ studyCount: -1, viewCount: -1 })
      .limit(limit);

    res.json({
      success: true,
      count: decks.length,
      data: decks
    });
  } catch (error) {
    console.error('[ERROR] Get popular decks:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy bộ thẻ phổ biến',
      error: error.message
    });
  }
};

// @desc    Increment view count
// @route   POST /api/decks/:id/view
// @access  Public
exports.incrementViewCount = async (req, res) => {
  try {
    const deck = await Deck.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bộ thẻ'
      });
    }

    res.json({
      success: true,
      data: { viewCount: deck.viewCount }
    });
  } catch (error) {
    console.error('[ERROR] Increment view:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật lượt xem',
      error: error.message
    });
  }
};

// @desc    Get current user's decks
// @route   GET /api/decks/my-decks
// @access  Private
exports.getMyDecks = async (req, res) => {
  try {
    const decks = await Deck.find({ createdBy: req.user.id })
      .populate('course', 'title')
      .populate('unit', 'title')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: decks.length,
      data: decks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách deck của bạn',
      error: error.message
    });
  }
};

// @desc    Increment study count
// @route   POST /api/decks/:id/study
// @access  Private
exports.incrementStudyCount = async (req, res) => {
  try {
    const deck = await Deck.findByIdAndUpdate(
      req.params.id,
      { $inc: { studyCount: 1 } },
      { new: true }
    );

    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bộ thẻ'
      });
    }

    res.json({
      success: true,
      data: { studyCount: deck.studyCount }
    });
  } catch (error) {
    console.error('[ERROR] Increment study:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật lượt học',
      error: error.message
    });
  }
};