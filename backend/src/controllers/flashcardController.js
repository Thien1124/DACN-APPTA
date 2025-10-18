const Flashcard = require('../models/Flashcard');
const Deck = require('../models/Deck');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Lấy tất cả flashcard
// @route   GET /api/v1/flashcards
// @route   GET /api/v1/decks/:deckId/flashcards
// @access  Public
exports.getFlashcards = asyncHandler(async (req, res, next) => {
  let query;

  if (req.params.deckId) {
    query = Flashcard.find({ deck: req.params.deckId });
  } else {
    query = Flashcard.find().populate({
      path: 'deck',
      select: 'title description'
    });
  }

  const flashcards = await query;

  res.status(200).json({
    success: true,
    count: flashcards.length,
    data: flashcards
  });
});

// @desc    Lấy một flashcard
// @route   GET /api/v1/flashcards/:id
// @access  Public
exports.getFlashcard = asyncHandler(async (req, res, next) => {
  const flashcard = await Flashcard.findById(req.params.id).populate({
    path: 'deck',
    select: 'title description'
  });

  if (!flashcard) {
    return next(
      new ErrorResponse(`Không tìm thấy flashcard với id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: flashcard
  });
});

// @desc    Tạo flashcard mới
// @route   POST /api/v1/decks/:deckId/flashcards
// @access  Private
exports.createFlashcard = asyncHandler(async (req, res, next) => {
  req.body.deck = req.params.deckId;

  const deck = await Deck.findById(req.params.deckId);

  if (!deck) {
    return next(
      new ErrorResponse(`Không tìm thấy bộ thẻ với id ${req.params.deckId}`, 404)
    );
  }

  const flashcard = await Flashcard.create(req.body);

  res.status(201).json({
    success: true,
    data: flashcard
  });
});

// @desc    Tạo nhiều flashcard cùng lúc
// @route   POST /api/v1/decks/:deckId/flashcards/bulk
// @access  Private
exports.createFlashcardsBulk = asyncHandler(async (req, res, next) => {
  const { flashcards } = req.body;
  
  if (!flashcards || !Array.isArray(flashcards) || flashcards.length === 0) {
    return next(new ErrorResponse('Vui lòng cung cấp mảng flashcard hợp lệ', 400));
  }

  const deck = await Deck.findById(req.params.deckId);

  if (!deck) {
    return next(
      new ErrorResponse(`Không tìm thấy bộ thẻ với id ${req.params.deckId}`, 404)
    );
  }

  // Thêm deckId vào mỗi flashcard
  const flashcardsWithDeck = flashcards.map(flashcard => ({
    ...flashcard,
    deck: req.params.deckId
  }));

  const createdFlashcards = await Flashcard.insertMany(flashcardsWithDeck);

  res.status(201).json({
    success: true,
    count: createdFlashcards.length,
    data: createdFlashcards
  });
});

// @desc    Cập nhật flashcard
// @route   PUT /api/v1/flashcards/:id
// @access  Private
exports.updateFlashcard = asyncHandler(async (req, res, next) => {
  let flashcard = await Flashcard.findById(req.params.id);

  if (!flashcard) {
    return next(
      new ErrorResponse(`Không tìm thấy flashcard với id ${req.params.id}`, 404)
    );
  }

  flashcard = await Flashcard.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: flashcard
  });
});

// @desc    Xóa flashcard
// @route   DELETE /api/v1/flashcards/:id
// @access  Private
exports.deleteFlashcard = asyncHandler(async (req, res, next) => {
  const flashcard = await Flashcard.findById(req.params.id);

  if (!flashcard) {
    return next(
      new ErrorResponse(`Không tìm thấy flashcard với id ${req.params.id}`, 404)
    );
  }

  await flashcard.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});