const Deck = require('../models/Deck');
const Flashcard = require('../models/Flashcard');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Lấy tất cả bộ thẻ
// @route   GET /api/v1/decks
// @access  Public
exports.getDecks = asyncHandler(async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  query = Deck.find(JSON.parse(queryStr));

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Deck.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const decks = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: decks.length,
    pagination,
    data: decks
  });
});

// @desc    Lấy một bộ thẻ
// @route   GET /api/v1/decks/:id
// @access  Public
exports.getDeck = asyncHandler(async (req, res, next) => {
  const deck = await Deck.findById(req.params.id).populate('flashcards');

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

  deck = await Deck.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

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

  // Xóa tất cả flashcard thuộc bộ thẻ này
  await Flashcard.deleteMany({ deck: req.params.id });

  await deck.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Thay đổi trạng thái xuất bản của bộ thẻ
// @route   PUT /api/v1/decks/:id/publish
// @access  Private
exports.togglePublishDeck = asyncHandler(async (req, res, next) => {
  let deck = await Deck.findById(req.params.id);

  if (!deck) {
    return next(
      new ErrorResponse(`Không tìm thấy bộ thẻ với id ${req.params.id}`, 404)
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
  const decks = await Deck.find({ course: req.params.courseId });

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
  const decks = await Deck.find({ unit: req.params.unitId });

  res.status(200).json({
    success: true,
    count: decks.length,
    data: decks
  });
});