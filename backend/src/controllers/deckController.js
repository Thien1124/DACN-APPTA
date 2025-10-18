const Deck = require('../models/Deck');
const Flashcard = require('../models/Flashcard');

// Lấy tất cả deck
exports.getAllDecks = async (req, res) => {
  try {
    const decks = await Deck.find()
      .populate('course', 'title')
      .populate('unit', 'title');
    
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
      .populate('flashcards');
    
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
      .populate('unit', 'title');
    
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
      .populate('unit', 'title');
    
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
    const deck = await Deck.create(req.body);
    
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

// Cập nhật deck
exports.updateDeck = async (req, res) => {
  try {
    const deck = await Deck.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
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
    res.status(400).json({
      success: false,
      message: 'Không thể cập nhật deck',
      error: error.message
    });
  }
};

// Xóa deck
exports.deleteDeck = async (req, res) => {
  try {
    const deck = await Deck.findById(req.params.id);
    
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy deck với ID này'
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