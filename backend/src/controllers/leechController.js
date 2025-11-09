const Flashcard = require('../models/Flashcard');
const Deck = require('../models/Deck');
const leechService = require('../services/leechService');

/**
 * Mark flashcard as leech manually
 * POST /api/leeches/mark/:id
 */
exports.markAsLeech = async (req, res) => {
  try {
    const flashcard = await Flashcard.findById(req.params.id).populate('deck');
    
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy flashcard'
      });
    }
    
    // Check ownership
    if (flashcard.deck.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa flashcard này'
      });
    }
    
    flashcard.isLeech = true;
    flashcard.leechDetectedAt = new Date();
    await flashcard.save();
    
    res.status(200).json({
      success: true,
      message: 'Đã đánh dấu flashcard là leech',
      data: flashcard
    });
  } catch (error) {
    console.error('Mark Leech Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đánh dấu leech',
      error: error.message
    });
  }
};

/**
 * Unmark flashcard as leech
 * POST /api/leeches/unmark/:id
 */
exports.unmarkLeech = async (req, res) => {
  try {
    const flashcard = await Flashcard.findById(req.params.id).populate('deck');
    
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy flashcard'
      });
    }
    
    // Check ownership
    if (flashcard.deck.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa flashcard này'
      });
    }
    
    flashcard.isLeech = false;
    flashcard.leechDetectedAt = null;
    flashcard.failCount = 0;
    flashcard.consecutiveFails = 0;
    await flashcard.save();
    
    res.status(200).json({
      success: true,
      message: 'Đã bỏ đánh dấu leech',
      data: flashcard
    });
  } catch (error) {
    console.error('Unmark Leech Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi bỏ đánh dấu leech',
      error: error.message
    });
  }
};

/**
 * Suspend flashcard (remove from review queue indefinitely)
 * POST /api/leeches/suspend/:id
 */
exports.suspendCard = async (req, res) => {
  try {
    const flashcard = await Flashcard.findById(req.params.id).populate('deck');
    
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy flashcard'
      });
    }
    
    // Check ownership
    if (flashcard.deck.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa flashcard này'
      });
    }
    
    flashcard.status = 'suspended';
    flashcard.suspendedAt = new Date();
    await flashcard.save();
    
    res.status(200).json({
      success: true,
      message: 'Đã tạm ẩn flashcard',
      data: flashcard
    });
  } catch (error) {
    console.error('Suspend Card Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạm ẩn flashcard',
      error: error.message
    });
  }
};

/**
 * Unsuspend flashcard
 * POST /api/leeches/unsuspend/:id
 */
exports.unsuspendCard = async (req, res) => {
  try {
    const flashcard = await Flashcard.findById(req.params.id).populate('deck');
    
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy flashcard'
      });
    }
    
    // Check ownership
    if (flashcard.deck.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa flashcard này'
      });
    }
    
    flashcard.status = 'active';
    flashcard.suspendedAt = null;
    await flashcard.save();
    
    res.status(200).json({
      success: true,
      message: 'Đã kích hoạt lại flashcard',
      data: flashcard
    });
  } catch (error) {
    console.error('Unsuspend Card Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi kích hoạt lại flashcard',
      error: error.message
    });
  }
};

/**
 * Bury flashcard (hide until next day or manually unbury)
 * POST /api/leeches/bury/:id
 */
exports.buryCard = async (req, res) => {
  try {
    const { untilDate } = req.body; // Optional: custom bury date
    
    const flashcard = await Flashcard.findById(req.params.id).populate('deck');
    
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy flashcard'
      });
    }
    
    // Check ownership
    if (flashcard.deck.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa flashcard này'
      });
    }
    
    flashcard.status = 'buried';
    
    // Set bury until date (default: next day at midnight)
    if (untilDate) {
      flashcard.buriedUntil = new Date(untilDate);
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      flashcard.buriedUntil = tomorrow;
    }
    
    await flashcard.save();
    
    res.status(200).json({
      success: true,
      message: `Đã chôn flashcard đến ${flashcard.buriedUntil.toLocaleDateString('vi-VN')}`,
      data: flashcard
    });
  } catch (error) {
    console.error('Bury Card Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi chôn flashcard',
      error: error.message
    });
  }
};

/**
 * Unbury flashcard
 * POST /api/leeches/unbury/:id
 */
exports.unburyCard = async (req, res) => {
  try {
    const flashcard = await Flashcard.findById(req.params.id).populate('deck');
    
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy flashcard'
      });
    }
    
    // Check ownership
    if (flashcard.deck.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa flashcard này'
      });
    }
    
    flashcard.status = 'active';
    flashcard.buriedUntil = null;
    await flashcard.save();
    
    res.status(200).json({
      success: true,
      message: 'Đã bỏ chôn flashcard',
      data: flashcard
    });
  } catch (error) {
    console.error('Unbury Card Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi bỏ chôn flashcard',
      error: error.message
    });
  }
};

/**
 * Get all leeched cards in a deck
 * GET /api/leeches/:deckId
 */
exports.getLeechedCards = async (req, res) => {
  try {
    const { deckId } = req.params;
    
    // Check deck ownership
    const deck = await Deck.findById(deckId);
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy deck'
      });
    }
    
    if (deck.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem deck này'
      });
    }
    
    const leeches = await Flashcard.find({
      deck: deckId,
      isLeech: true
    }).sort({ failCount: -1 });
    
    // Get stats
    const stats = await leechService.getLeechStats(deckId);
    
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách leech thành công',
      data: {
        leeches,
        stats,
        count: leeches.length
      }
    });
  } catch (error) {
    console.error('Get Leeched Cards Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách leech',
      error: error.message
    });
  }
};

/**
 * Get all buried cards in a deck
 * GET /api/leeches/buried/:deckId
 */
exports.getBuriedCards = async (req, res) => {
  try {
    const { deckId } = req.params;
    
    // Check deck ownership
    const deck = await Deck.findById(deckId);
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy deck'
      });
    }
    
    if (deck.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem deck này'
      });
    }
    
    const buried = await Flashcard.find({
      deck: deckId,
      status: 'buried'
    }).sort({ buriedUntil: 1 });
    
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách flashcard bị chôn thành công',
      data: {
        buried,
        count: buried.length
      }
    });
  } catch (error) {
    console.error('Get Buried Cards Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách flashcard bị chôn',
      error: error.message
    });
  }
};

/**
 * Get all suspended cards in a deck
 * GET /api/leeches/suspended/:deckId
 */
exports.getSuspendedCards = async (req, res) => {
  try {
    const { deckId } = req.params;
    
    // Check deck ownership
    const deck = await Deck.findById(deckId);
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy deck'
      });
    }
    
    if (deck.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem deck này'
      });
    }
    
    const suspended = await Flashcard.find({
      deck: deckId,
      status: 'suspended'
    }).sort({ suspendedAt: -1 });
    
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách flashcard bị tạm ẩn thành công',
      data: {
        suspended,
        count: suspended.length
      }
    });
  } catch (error) {
    console.error('Get Suspended Cards Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách flashcard bị tạm ẩn',
      error: error.message
    });
  }
};

/**
 * Bulk suspend cards
 * POST /api/leeches/bulk/suspend
 */
exports.bulkSuspend = async (req, res) => {
  try {
    const { flashcardIds } = req.body;
    
    if (!flashcardIds || !Array.isArray(flashcardIds) || flashcardIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách flashcard IDs'
      });
    }
    
    // Check ownership
    const flashcards = await Flashcard.find({ _id: { $in: flashcardIds } }).populate('deck');
    const unauthorizedCards = flashcards.filter(card => 
      card.deck.createdBy.toString() !== req.user._id.toString()
    );
    
    if (unauthorizedCards.length > 0) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa một số flashcard'
      });
    }
    
    const result = await Flashcard.updateMany(
      { _id: { $in: flashcardIds } },
      { 
        status: 'suspended',
        suspendedAt: new Date()
      }
    );
    
    res.status(200).json({
      success: true,
      message: `Đã tạm ẩn ${result.modifiedCount} flashcard`,
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Bulk Suspend Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạm ẩn hàng loạt',
      error: error.message
    });
  }
};

/**
 * Bulk bury cards
 * POST /api/leeches/bulk/bury
 */
exports.bulkBury = async (req, res) => {
  try {
    const { flashcardIds, untilDate } = req.body;
    
    if (!flashcardIds || !Array.isArray(flashcardIds) || flashcardIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách flashcard IDs'
      });
    }
    
    // Check ownership
    const flashcards = await Flashcard.find({ _id: { $in: flashcardIds } }).populate('deck');
    const unauthorizedCards = flashcards.filter(card => 
      card.deck.createdBy.toString() !== req.user._id.toString()
    );
    
    if (unauthorizedCards.length > 0) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa một số flashcard'
      });
    }
    
    // Set bury until date
    let buriedUntil;
    if (untilDate) {
      buriedUntil = new Date(untilDate);
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      buriedUntil = tomorrow;
    }
    
    const result = await Flashcard.updateMany(
      { _id: { $in: flashcardIds } },
      { 
        status: 'buried',
        buriedUntil
      }
    );
    
    res.status(200).json({
      success: true,
      message: `Đã chôn ${result.modifiedCount} flashcard đến ${buriedUntil.toLocaleDateString('vi-VN')}`,
      data: {
        modifiedCount: result.modifiedCount,
        buriedUntil
      }
    });
  } catch (error) {
    console.error('Bulk Bury Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi chôn hàng loạt',
      error: error.message
    });
  }
};

/**
 * Auto-unbury expired cards (run daily via cron)
 * POST /api/leeches/unbury-expired
 */
exports.unburyExpired = async (req, res) => {
  try {
    const count = await leechService.unburyExpiredCards();
    
    res.status(200).json({
      success: true,
      message: `Đã tự động bỏ chôn ${count} flashcard`,
      data: { count }
    });
  } catch (error) {
    console.error('Unbury Expired Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tự động bỏ chôn',
      error: error.message
    });
  }
};
