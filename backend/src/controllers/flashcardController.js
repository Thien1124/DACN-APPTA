const Flashcard = require('../models/Flashcard');
const Deck = require('../models/Deck');
const asyncHandler = require('express-async-handler');

const getAllFlashcards = async (req, res) => {
  try {
    const flashcards = await Flashcard.find()
      .populate('deck', 'title');
    
    res.status(200).json({
      success: true,
      count: flashcards.length,
      data: flashcards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách flashcard',
      error: error.message
    });
  }
};


const getFlashcardById = async (req, res) => {
  try {
    const flashcard = await Flashcard.findById(req.params.id)
      .populate('deck', 'title');
    
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy flashcard với ID này'
      });
    }
    
    res.status(200).json({
      success: true,
      data: flashcard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin flashcard',
      error: error.message
    });
  }
};

// Lấy flashcard theo deck
const getFlashcardsByDeck = async (req, res) => {
  try {
    const flashcards = await Flashcard.find({ deck: req.params.deckId })
      .populate('deck', 'title');
    
    res.status(200).json({
      success: true,
      count: flashcards.length,
      data: flashcards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách flashcard theo deck',
      error: error.message
    });
  }
};

// Tạo flashcard mới
const createFlashcard = async (req, res) => {
  try {
    // Kiểm tra xem deck có tồn tại không
    const deck = await Deck.findById(req.body.deck);
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy deck với ID này'
      });
    }
    
    const flashcard = await Flashcard.create(req.body);
    
    res.status(201).json({
      success: true,
      data: flashcard
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể tạo flashcard mới',
      error: error.message
    });
  }
};

// Tạo nhiều flashcard cùng lúc
const createBulkFlashcards = async (req, res) => {
  try {
    const { deckId, flashcards } = req.body;
    
    // Kiểm tra xem deck có tồn tại không
    const deck = await Deck.findById(deckId);
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy deck với ID này'
      });
    }
    
    // Thêm deckId vào mỗi flashcard
    const flashcardsWithDeck = flashcards.map(flashcard => ({
      ...flashcard,
      deck: deckId
    }));
    
    // Tạo nhiều flashcard cùng lúc
    const createdFlashcards = await Flashcard.insertMany(flashcardsWithDeck);
    
     await Deck.findByIdAndUpdate(deckId, {
      $push: {
        flashcards: {
          $each: createdFlashcards.map(f => f._id)
        }
      }
    });
    
    res.status(201).json({
      success: true,
      count: createdFlashcards.length,
      data: createdFlashcards
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể tạo flashcard mới',
      error: error.message
    });
  }
};

// Cập nhật flashcard
const updateFlashcard = async (req, res) => {
  try {
    const flashcard = await Flashcard.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy flashcard với ID này'
      });
    }
    
    res.status(200).json({
      success: true,
      data: flashcard
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể cập nhật flashcard',
      error: error.message
    });
  }
};

// Xóa flashcard
const deleteFlashcard = async (req, res) => {
  try {
    const flashcard = await Flashcard.findById(req.params.id);
    
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy flashcard với ID này'
      });
    }
    
    await flashcard.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Flashcard đã được xóa thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể xóa flashcard',
      error: error.message
    });
  }
};

/**
 * Get all flashcards for current user (from all decks)
 * @route   GET /api/flashcards
 * @access  Private (Student can read)
 */
const getUserFlashcards = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Lấy tất cả flashcards từ các decks mà user có quyền truy cập
    // Giả sử user có thể truy cập flashcards từ decks public hoặc của họ
    const flashcards = await Flashcard.find()
      .populate('deck', 'name')
      .select('front back example audioUrl pronunciation ipa deck createdAt')
      .sort({ createdAt: -1 })
      .limit(1000); // Giới hạn để tránh quá nhiều data
    
    res.status(200).json({
      success: true,
      count: flashcards.length,
      flashcards: flashcards.map(card => ({
        _id: card._id,
        front: card.front,
        back: card.back,
        example: card.example,
        audioUrl: card.audioUrl,
        pronunciation: card.pronunciation,
        ipa: card.ipa,
        deck: card.deck
      }))
    });
    
  } catch (error) {
    console.error('❌ Get user flashcards error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy flashcards'
    });
  }
});

/**
 * Get random flashcards for TypeRacer game
 * @route   GET /api/flashcards/typeracer/random
 * @access  Private
 */
const getRandomFlashcardsForTypeRacer = asyncHandler(async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Lấy flashcards ngẫu nhiên có cả front (tiếng Anh) và back (tiếng Việt)
    const flashcards = await Flashcard.aggregate([
      {
        $match: {
          front: { $exists: true, $ne: '' },
          back: { $exists: true, $ne: '' }
        }
      },
      { $sample: { size: limit } },
      {
        $project: {
          _id: 1,
          front: 1,
          back: 1,
          example: 1
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      count: flashcards.length,
      flashcards: flashcards.map(card => ({
        id: card._id,
        english: card.front,
        vietnamese: card.back,
        example: card.example
      }))
    });
    
  } catch (error) {
    console.error('❌ Get random flashcards for TypeRacer error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy flashcards ngẫu nhiên'
    });
  }
});

// ✅ SỬA: module.exports export các const variables
module.exports = {
  getAllFlashcards,
  getUserFlashcards, 
  getRandomFlashcardsForTypeRacer,
  getFlashcardById,
  getFlashcardsByDeck,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  createBulkFlashcards
};