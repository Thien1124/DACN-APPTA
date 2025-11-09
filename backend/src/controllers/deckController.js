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

// ==================== MỚI - TASK 15 & 16 ====================

// @desc    Advanced Search Decks với từ khóa và tags (Task 16)
// @route   GET /api/decks/search
// @access  Public
exports.searchDecks = async (req, res) => {
  try {
    const {
      keyword,      // Từ khóa tìm kiếm
      tags,         // Tags (comma-separated)
      category,
      level,
      difficulty,
      minCards,
      maxCards,
      minRating,
      sort = 'relevance',
      page = 1,
      limit = 20
    } = req.query;

    // Validate có ít nhất keyword hoặc tags
    if (!keyword && !tags) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập từ khóa hoặc tag để tìm kiếm'
      });
    }

    // Build query
    const query = { isPublic: true };
    const searchConditions = [];

    // 1. Text Search với từ khóa (full-text search)
    if (keyword) {
      const keywordRegex = { $regex: keyword.trim(), $options: 'i' };
      searchConditions.push(
        { title: keywordRegex },
        { description: keywordRegex },
        { tags: keywordRegex },
        { subcategory: keywordRegex }
      );
    }

    // 2. Tag Search (exact match hoặc partial)
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      
      // Tìm kiếm tags có chứa bất kỳ tag nào trong array
      const tagConditions = tagArray.map(tag => ({
        tags: { $regex: tag, $options: 'i' }
      }));
      
      searchConditions.push(...tagConditions);
    }

    // Apply search conditions với OR
    if (searchConditions.length > 0) {
      query.$or = searchConditions;
    }

    // 3. Additional Filters
    if (category) {
      query.category = category.toUpperCase();
    }

    if (level) {
      const levels = level.split(',').map(l => l.toUpperCase());
      query.level = { $in: levels };
    }

    if (difficulty) {
      const difficulties = difficulty.split(',').map(d => d.toUpperCase());
      query.difficulty = { $in: difficulties };
    }

    // Filter by card count
    if (minCards || maxCards) {
      query.totalCards = {};
      if (minCards) query.totalCards.$gte = parseInt(minCards);
      if (maxCards) query.totalCards.$lte = parseInt(maxCards);
    }

    // Filter by rating
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
      query.ratingCount = { $gt: 0 }; // Chỉ lấy deck đã có rating
    }

    // 4. Sort options
    let sortOption = {};
    switch (sort) {
      case 'relevance':
        // Sắp xếp theo relevance (studyCount + viewCount)
        sortOption = { studyCount: -1, viewCount: -1, rating: -1 };
        break;
      case 'popular':
        sortOption = { studyCount: -1 };
        break;
      case 'rating':
        sortOption = { rating: -1, ratingCount: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'cards':
        sortOption = { totalCards: -1 };
        break;
      default:
        sortOption = { studyCount: -1, viewCount: -1 };
    }

    // 5. Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const decks = await Deck.find(query)
      .populate('createdBy', 'fullName avatar')
      .populate('course', 'title')
      .populate('unit', 'title')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Deck.countDocuments(query);

    // 6. Highlight matching terms (optional - for frontend)
    const results = decks.map(deck => ({
      ...deck,
      matchedTags: tags ? deck.tags.filter(tag => 
        tags.split(',').some(searchTag => 
          tag.toLowerCase().includes(searchTag.trim().toLowerCase())
        )
      ) : []
    }));

    res.json({
      success: true,
      count: results.length,
      data: {
        decks: results,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        searchQuery: {
          keyword,
          tags: tags ? tags.split(',').map(t => t.trim()) : [],
          filters: {
            category,
            level,
            difficulty,
            minCards,
            maxCards,
            minRating
          },
          sort
        }
      }
    });

  } catch (error) {
    console.error('[ERROR] Search decks:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tìm kiếm bộ thẻ',
      error: error.message
    });
  }
};

// @desc    Get search suggestions (autocomplete)
// @route   GET /api/decks/search/suggestions
// @access  Public
exports.getSearchSuggestions = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: {
          titles: [],
          tags: [],
          categories: []
        }
      });
    }

    const regex = { $regex: q.trim(), $options: 'i' };
    const queryLimit = parseInt(limit);

    // 1. Tìm deck titles khớp
    const titleMatches = await Deck.find({
      isPublic: true,
      title: regex
    })
      .select('title category')
      .limit(queryLimit)
      .lean();

    // 2. Tìm tags khớp
    const tagMatches = await Deck.aggregate([
      { $match: { isPublic: true } },
      { $unwind: '$tags' },
      { $match: { tags: regex } },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: queryLimit }
    ]);

    // 3. Categories
    const categories = [
      'ACADEMIC', 'TRAVEL', 'BUSINESS', 'DAILY_LIFE',
      'TECHNOLOGY', 'HEALTH', 'ENTERTAINMENT', 'FOOD', 'GENERAL'
    ].filter(cat => cat.toLowerCase().includes(q.toLowerCase()));

    res.json({
      success: true,
      data: {
        titles: titleMatches.map(d => ({
          id: d._id,
          title: d.title,
          category: d.category
        })),
        tags: tagMatches.map(t => ({
          tag: t._id,
          count: t.count
        })),
        categories: categories.map(cat => ({
          category: cat,
          displayName: cat.replace('_', ' ')
        }))
      }
    });

  } catch (error) {
    console.error('[ERROR] Get suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy gợi ý tìm kiếm',
      error: error.message
    });
  }
};

// @desc    Get all tags with counts (for tag cloud/filter)
// @route   GET /api/decks/tags
// @access  Public
exports.getAllTags = async (req, res) => {
  try {
    const { category, minCount = 1, limit = 50 } = req.query;

    const matchStage = { isPublic: true };
    if (category) {
      matchStage.category = category.toUpperCase();
    }

    const tags = await Deck.aggregate([
      { $match: matchStage },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 },
          categories: { $addToSet: '$category' }
        }
      },
      { $match: { count: { $gte: parseInt(minCount) } } },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      success: true,
      count: tags.length,
      data: tags.map(tag => ({
        tag: tag._id,
        deckCount: tag.count,
        categories: tag.categories
      }))
    });

  } catch (error) {
    console.error('[ERROR] Get all tags:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách tags',
      error: error.message
    });
  }
};

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
      data: decks  // ✅ Đã có totalCards trong Deck model
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

// ✅ NEW: Get deck by ID for regular users (check ownership or public)
// @desc    Get deck by ID for user (public or owned)
// @route   GET /api/decks/:id
// @access  Private
exports.getDeckByIdForUser = async (req, res) => {
  try {
    const deck = await Deck.findById(req.params.id)
      .populate('course', 'title')
      .populate('unit', 'title')
      .populate('createdBy', 'fullName email avatar');
    
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy deck với ID này'
      });
    }

    // ✅ Check permission (FIXED)
    const isOwner = deck.createdBy && deck.createdBy._id.toString() === req.user._id.toString();
    const isPublic = deck.isPublic === true;
    const isAdmin = req.user.role === 'admin';
    
    // ✅ NEW: Check if user has active study session for this deck
    const StudySession = require('../models/StudySession');
    const hasActiveSession = await StudySession.findOne({
      user: req.user._id,
      deck: req.params.id,
      status: 'IN_PROGRESS'
    });

    // ✅ Allow access if: public, owner, admin, or has active session
    if (!isPublic && !isOwner && !isAdmin && !hasActiveSession) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập deck này',
        debug: {
          isPublic,
          isOwner,
          isAdmin,
          hasActiveSession: !!hasActiveSession,
          deckCreatedBy: deck.createdBy?._id?.toString(),
          currentUser: req.user._id.toString()
        }
      });
    }

    res.status(200).json({
      success: true,
      data: deck
    });
  } catch (error) {
    console.error('[ERROR] Get deck by ID for user:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin deck',
      error: error.message
    });
  }
};

// ✅ NEW: Get deck with all flashcards for study/review
// @desc    Get deck with flashcards
// @route   GET /api/decks/:id/flashcards
// @access  Private
exports.getDeckWithFlashcards = async (req, res) => {
  try {
    const deck = await Deck.findById(req.params.id)
      .populate('course', 'title')
      .populate('unit', 'title')
      .populate('createdBy', 'fullName email avatar');
    
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy deck'
      });
    }

    // ✅ Check permission (FIXED)
    const isOwner = deck.createdBy && deck.createdBy._id.toString() === req.user._id.toString();
    const isPublic = deck.isPublic === true;
    const isAdmin = req.user.role === 'admin';
    
    // ✅ NEW: Check if user has active study session for this deck
    const StudySession = require('../models/StudySession');
    const hasActiveSession = await StudySession.findOne({
      user: req.user._id,
      deck: req.params.id,
      status: 'IN_PROGRESS'
    });

    // ✅ Allow access if: public, owner, admin, or has active session
    if (!isPublic && !isOwner && !isAdmin && !hasActiveSession) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập deck này',
        debug: {
          isPublic,
          isOwner,
          isAdmin,
          hasActiveSession: !!hasActiveSession,
          deckCreatedBy: deck.createdBy?._id?.toString(),
          currentUser: req.user._id.toString()
        }
      });
    }

    // ✅ Get all flashcards
    const flashcards = await Flashcard.find({ deck: req.params.id });

    res.status(200).json({
      success: true,
      data: {
        ...deck.toObject(),
        flashcards
      }
    });
  } catch (error) {
    console.error('[ERROR] Get deck with flashcards:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy flashcards',
      error: error.message
    });
  }
};