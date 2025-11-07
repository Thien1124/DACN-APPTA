const Flashcard = require('../models/Flashcard');
const Deck = require('../models/Deck');

// Lấy tất cả flashcard
exports.getAllFlashcards = async (req, res) => {
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

// Lấy flashcard theo ID
exports.getFlashcardById = async (req, res) => {
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
exports.getFlashcardsByDeck = async (req, res) => {
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
exports.createFlashcard = async (req, res) => {
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
exports.createBulkFlashcards = async (req, res) => {
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
exports.updateFlashcard = async (req, res) => {
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
exports.deleteFlashcard = async (req, res) => {
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