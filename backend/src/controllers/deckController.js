const Deck = require('../models/Deck');
const Flashcard = require('../models/Flashcard');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Lấy tất cả bộ thẻ (sử dụng advancedResults middleware)
// @route   GET /api/v1/decks
// @access  Public
exports.getDecks = asyncHandler(async (req, res, next) => {
  // Logic này đã được chuyển vào advancedResults middleware
  res.status(200).json(res.advancedResults);
});

// @desc    Lấy một bộ thẻ
// @route   GET /api/v1/decks/:id
// @access  Public
exports.getDeck = asyncHandler(async (req, res, next) => {
  // **Hợp nhất:** Lấy populate chi tiết từ nhánh main
  const deck = await Deck.findById(req.params.id)
    .populate('course', 'title')
    .populate('unit', 'title')
    .populate('flashcards')
    .populate('createdBy', 'name email avatar');

  if (!deck) {
    return next(
      new ErrorResponse(`Không tìm thấy bộ thẻ với id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: deck
  });
});

// @desc    Tạo bộ thẻ mới
// @route   POST /api/v1/decks
// @access  Private
exports.createDeck = asyncHandler(async (req, res, next) => {
  // **Hợp nhất:** Thêm createdBy từ user đang đăng nhập
  req.body.createdBy = req.user.id;

  const deck = await Deck.create(req.body);

  res.status(201).json({
    success: true,
    data: deck
  });
});

// @desc    Cập nhật bộ thẻ
// @route   PUT /api/v1/decks/:id
// @access  Private
exports.updateDeck = asyncHandler(async (req, res, next) => {
  let deck = await Deck.findById(req.params.id);

  if (!deck) {
    return next(
      new ErrorResponse(`Không tìm thấy bộ thẻ với id ${req.params.id}`, 404)
    );
  }

  // **Hợp nhất:** Kiểm tra quyền sở hữu
  if (deck.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Bạn không có quyền chỉnh sửa bộ thẻ này', 403)
    );
  }

  deck = await Deck.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('course', 'title')
    .populate('unit', 'title')
    .populate('createdBy', 'name email avatar');

  res.status(200).json({
    success: true,
    data: deck
  });
});

// @desc    Xóa bộ thẻ
// @route   DELETE /api/v1/decks/:id
// @access  Private
exports.deleteDeck = asyncHandler(async (req, res, next) => {
  const deck = await Deck.findById(req.params.id);

  if (!deck) {
    return next(
      new ErrorResponse(`Không tìm thấy bộ thẻ với id ${req.params.id}`, 404)
    );
  }

  // **Hợp nhất:** Kiểm tra quyền sở hữu
  if (deck.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Bạn không có quyền xóa bộ thẻ này', 403)
    );
  }

  // Xóa tất cả flashcard thuộc bộ thẻ này (cả hai nhánh đều có)
  await Flashcard.deleteMany({ deck: req.params.id });
  await deck.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
    message: 'Bộ thẻ và các flashcard liên quan đã được xóa'
  });
});

// @desc    Thay đổi trạng thái xuất bản của bộ thẻ
// @route   PATCH /api/v1/decks/:id/publish
// @access  Private
exports.togglePublishDeck = asyncHandler(async (req, res, next) => {
  let deck = await Deck.findById(req.params.id);

  if (!deck) {
    return next(
      new ErrorResponse(`Không tìm thấy bộ thẻ với id ${req.params.id}`, 404)
    );
  }

  // **Bảo mật:** Chỉ chủ sở hữu hoặc admin mới được publish
  if (deck.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Bạn không có quyền thay đổi trạng thái bộ thẻ này', 403)
    );
  }

  deck.isPublished = !deck.isPublished;
  await deck.save();

  res.status(200).json({
    success: true,
    data: deck
  });
});

// @desc    Lấy bộ thẻ theo khóa học
// @route   GET /api/v1/courses/:courseId/decks
// @access  Public
exports.getDecksByCourse = asyncHandler(async (req, res, next) => {
  const decks = await Deck.find({ course: req.params.courseId })
    .populate('course', 'title')
    .populate('unit', 'title')
    .populate('createdBy', 'name avatar');

  res.status(200).json({
    success: true,
    count: decks.length,
    data: decks
  });
});

// @desc    Lấy bộ thẻ theo unit
// @route   GET /api/v1/units/:unitId/decks
// @access  Public
exports.getDecksByUnit = asyncHandler(async (req, res, next) => {
  const decks = await Deck.find({ unit: req.params.unitId })
    .populate('course', 'title')
    .populate('unit', 'title')
    .populate('createdBy', 'name avatar');

  res.status(200).json({
    success: true,
    count: decks.length,
    data: decks
  });
});

// @desc    Lấy các bộ thẻ của tôi
// @route   GET /api/v1/decks/my-decks
// @access  Private
exports.getMyDecks = asyncHandler(async (req, res, next) => {
  const decks = await Deck.find({ createdBy: req.user.id })
    .populate('course', 'title')
    .populate('unit', 'title')
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    count: decks.length,
    data: decks
  });
});

// ==================== TASK 15 - BROWSE / COMMUNITY ====================

// @desc    Browse & Filter Decks
// @route   GET /api/v1/decks/browse
// @access  Public
exports.browseDecks = asyncHandler(async (req, res, next) => {
  const {
    category, level, difficulty, tags, isFeatured,
    search, sort = 'newest', page = 1, limit = 20
  } = req.query;

  const query = { isPublic: true };
  if (category) query.category = category.toUpperCase();
  if (level) query.level = level.toUpperCase();
  if (difficulty) query.difficulty = difficulty.toUpperCase();
  if (tags) query.tags = { $in: tags.split(',').map(tag => tag.trim()) };
  if (isFeatured === 'true') query.isFeatured = true;

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  let sortOption = {};
  switch (sort) {
    case 'popular': sortOption = { studyCount: -1, viewCount: -1 }; break;
    case 'rating': sortOption = { rating: -1, ratingCount: -1 }; break;
    case 'newest': sortOption = { createdAt: -1 }; break;
    case 'oldest': sortOption = { createdAt: 1 }; break;
    default: sortOption = { createdAt: -1 };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [decks, total] = await Promise.all([
    Deck.find(query)
      .populate('createdBy', 'name email avatar')
      .populate('course', 'title')
      .populate('unit', 'title')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit)),
    Deck.countDocuments(query)
  ]);

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
      }
    }
  });
});

// @desc    Get categories with counts
// @route   GET /api/v1/decks/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Deck.aggregate([
    { $match: { isPublic: true } },
    { $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalCards: { $sum: '$totalCards' }
    }},
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
});

// @desc    Get featured decks
// @route   GET /api/v1/decks/featured
// @access  Public
exports.getFeaturedDecks = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const decks = await Deck.find({ isPublic: true, isFeatured: true })
    .populate('createdBy', 'name avatar')
    .populate('course', 'title')
    .populate('unit', 'title')
    .sort({ studyCount: -1, rating: -1 })
    .limit(limit);

  res.json({ success: true, count: decks.length, data: decks });
});

// @desc    Get popular decks
// @route   GET /api/v1/decks/popular
// @access  Public
exports.getPopularDecks = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const category = req.query.category;
  const query = { isPublic: true };
  if (category) query.category = category.toUpperCase();

  const decks = await Deck.find(query)
    .populate('createdBy', 'name avatar')
    .populate('course', 'title')
    .populate('unit', 'title')
    .sort({ studyCount: -1, viewCount: -1 })
    .limit(limit);

  res.json({ success: true, count: decks.length, data: decks });
});

// @desc    Increment view count
// @route   POST /api/v1/decks/:id/view
// @access  Public
exports.incrementViewCount = asyncHandler(async (req, res, next) => {
  const deck = await Deck.findByIdAndUpdate(
    req.params.id,
    { $inc: { viewCount: 1 } },
    { new: true }
  );
  if (!deck) {
    return next(new ErrorResponse('Không tìm thấy bộ thẻ', 404));
  }
  res.json({ success: true, data: { viewCount: deck.viewCount } });
});

// @desc    Increment study count
// @route   POST /api/v1/decks/:id/study
// @access  Private
exports.incrementStudyCount = asyncHandler(async (req, res, next) => {
  const deck = await Deck.findByIdAndUpdate(
    req.params.id,
    { $inc: { studyCount: 1 } },
    { new: true }
  );
  if (!deck) {
    return next(new ErrorResponse('Không tìm thấy bộ thẻ', 404));
  }
  res.json({ success: true, data: { studyCount: deck.studyCount } });
});