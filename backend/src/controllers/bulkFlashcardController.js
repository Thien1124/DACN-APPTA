const Flashcard = require('../models/Flashcard');
const Deck = require('../models/Deck');

/**
 * @desc    Bulk update flashcards (edit multiple flashcards at once)
 * @route   PUT /api/flashcards/bulk-update
 * @access  Private (admin, teacher, student - own decks only)
 */
exports.bulkUpdateFlashcards = async (req, res) => {
  try {
    const { flashcardIds, updates } = req.body;

    // Validation
    if (!flashcardIds || !Array.isArray(flashcardIds) || flashcardIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách flashcard IDs'
      });
    }

    if (flashcardIds.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Chỉ được cập nhật tối đa 100 flashcards cùng lúc'
      });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp thông tin cập nhật'
      });
    }

    // Get flashcards to check permissions
    const flashcards = await Flashcard.find({ _id: { $in: flashcardIds } }).populate('deck');

    if (flashcards.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy flashcards'
      });
    }

    // Check permissions for each flashcard
    for (const flashcard of flashcards) {
      if (!flashcard.deck) {
        return res.status(404).json({
          success: false,
          message: `Deck của flashcard ${flashcard._id} không tồn tại`
        });
      }

      // Admin/Teacher can edit any flashcard
      // Student can only edit their own flashcards
      if (req.user.role === 'student' && flashcard.deck.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền chỉnh sửa flashcards này'
        });
      }
    }

    // Allowed fields to update
    const allowedFields = [
      'tags', 'difficulty', 'cefrLevel', 'partOfSpeech',
      'usageNotes', 'grammarNotes', 'hints'
    ];

    // Filter only allowed fields
    const filteredUpdates = {};
    for (const key of allowedFields) {
      if (updates.hasOwnProperty(key)) {
        filteredUpdates[key] = updates[key];
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không có trường hợp lệ để cập nhật',
        allowedFields
      });
    }

    // Bulk update
    const result = await Flashcard.updateMany(
      { _id: { $in: flashcardIds } },
      { $set: filteredUpdates },
      { runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: `Đã cập nhật ${result.modifiedCount} flashcards`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        updates: filteredUpdates
      }
    });

  } catch (error) {
    console.error('Bulk Update Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật hàng loạt flashcards',
      error: error.message
    });
  }
};

/**
 * @desc    Bulk add tags to flashcards
 * @route   PUT /api/flashcards/bulk-add-tags
 * @access  Private (admin, teacher, student - own decks only)
 */
exports.bulkAddTags = async (req, res) => {
  try {
    const { flashcardIds, tags } = req.body;

    // Validation
    if (!flashcardIds || !Array.isArray(flashcardIds) || flashcardIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách flashcard IDs'
      });
    }

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách tags'
      });
    }

    // Get flashcards to check permissions
    const flashcards = await Flashcard.find({ _id: { $in: flashcardIds } }).populate('deck');

    if (flashcards.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy flashcards'
      });
    }

    // Check permissions
    for (const flashcard of flashcards) {
      if (!flashcard.deck) {
        return res.status(404).json({
          success: false,
          message: `Deck của flashcard ${flashcard._id} không tồn tại`
        });
      }

      if (req.user.role === 'student' && flashcard.deck.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền chỉnh sửa flashcards này'
        });
      }
    }

    // Add tags (avoid duplicates)
    const result = await Flashcard.updateMany(
      { _id: { $in: flashcardIds } },
      { $addToSet: { tags: { $each: tags } } }
    );

    res.status(200).json({
      success: true,
      message: `Đã thêm tags cho ${result.modifiedCount} flashcards`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        addedTags: tags
      }
    });

  } catch (error) {
    console.error('Bulk Add Tags Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thêm tags hàng loạt',
      error: error.message
    });
  }
};

/**
 * @desc    Bulk remove tags from flashcards
 * @route   PUT /api/flashcards/bulk-remove-tags
 * @access  Private (admin, teacher, student - own decks only)
 */
exports.bulkRemoveTags = async (req, res) => {
  try {
    const { flashcardIds, tags } = req.body;

    // Validation
    if (!flashcardIds || !Array.isArray(flashcardIds) || flashcardIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách flashcard IDs'
      });
    }

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách tags cần xoá'
      });
    }

    // Get flashcards to check permissions
    const flashcards = await Flashcard.find({ _id: { $in: flashcardIds } }).populate('deck');

    if (flashcards.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy flashcards'
      });
    }

    // Check permissions
    for (const flashcard of flashcards) {
      if (!flashcard.deck) {
        return res.status(404).json({
          success: false,
          message: `Deck của flashcard ${flashcard._id} không tồn tại`
        });
      }

      if (req.user.role === 'student' && flashcard.deck.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền chỉnh sửa flashcards này'
        });
      }
    }

    // Remove tags
    const result = await Flashcard.updateMany(
      { _id: { $in: flashcardIds } },
      { $pullAll: { tags: tags } }
    );

    res.status(200).json({
      success: true,
      message: `Đã xoá tags khỏi ${result.modifiedCount} flashcards`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        removedTags: tags
      }
    });

  } catch (error) {
    console.error('Bulk Remove Tags Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xoá tags hàng loạt',
      error: error.message
    });
  }
};

/**
 * @desc    Bulk delete flashcards
 * @route   DELETE /api/flashcards/bulk-delete
 * @access  Private (admin, teacher, student - own decks only)
 */
exports.bulkDeleteFlashcards = async (req, res) => {
  try {
    const { flashcardIds } = req.body;

    // Validation
    if (!flashcardIds || !Array.isArray(flashcardIds) || flashcardIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách flashcard IDs'
      });
    }

    if (flashcardIds.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Chỉ được xoá tối đa 100 flashcards cùng lúc'
      });
    }

    // Get flashcards to check permissions
    const flashcards = await Flashcard.find({ _id: { $in: flashcardIds } }).populate('deck');

    if (flashcards.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy flashcards'
      });
    }

    // Check permissions
    for (const flashcard of flashcards) {
      if (!flashcard.deck) {
        return res.status(404).json({
          success: false,
          message: `Deck của flashcard ${flashcard._id} không tồn tại`
        });
      }

      if (req.user.role === 'student' && flashcard.deck.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xoá flashcards này'
        });
      }
    }

    // Delete flashcards
    const result = await Flashcard.deleteMany({ _id: { $in: flashcardIds } });

    res.status(200).json({
      success: true,
      message: `Đã xoá ${result.deletedCount} flashcards`,
      data: {
        deletedCount: result.deletedCount
      }
    });

  } catch (error) {
    console.error('Bulk Delete Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xoá hàng loạt flashcards',
      error: error.message
    });
  }
};

/**
 * @desc    Get flashcards by tags (filter)
 * @route   GET /api/flashcards/by-tags?tags=tag1,tag2&deckId=xxx
 * @access  Private
 */
exports.getFlashcardsByTags = async (req, res) => {
  try {
    const { tags, deckId, partOfSpeech, difficulty, cefrLevel } = req.query;

    // Build query
    const query = {};

    // Filter by deck
    if (deckId) {
      const deck = await Deck.findById(deckId);
      if (!deck) {
        return res.status(404).json({
          success: false,
          message: 'Deck không tồn tại'
        });
      }

      // Check access permission
      if (req.user.role === 'student' && deck.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập deck này'
        });
      }

      query.deck = deckId;
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim());
      query.tags = { $in: tagArray };
    }

    // Filter by part of speech
    if (partOfSpeech) {
      query.partOfSpeech = partOfSpeech;
    }

    // Filter by difficulty
    if (difficulty) {
      query.difficulty = difficulty;
    }

    // Filter by CEFR level
    if (cefrLevel) {
      query.cefrLevel = cefrLevel;
    }

    const flashcards = await Flashcard.find(query)
      .populate('deck', 'name description')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: flashcards.length,
      data: flashcards
    });

  } catch (error) {
    console.error('Get Flashcards By Tags Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy flashcards theo tags',
      error: error.message
    });
  }
};

/**
 * @desc    Get flashcards by Part of Speech
 * @route   GET /api/flashcards/by-pos?partOfSpeech=noun&deckId=xxx
 * @access  Private
 */
exports.getFlashcardsByPartOfSpeech = async (req, res) => {
  try {
    const { partOfSpeech, deckId } = req.query;

    if (!partOfSpeech) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp Part of Speech'
      });
    }

    // Build query
    const query = { partOfSpeech };

    // Filter by deck
    if (deckId) {
      const deck = await Deck.findById(deckId);
      if (!deck) {
        return res.status(404).json({
          success: false,
          message: 'Deck không tồn tại'
        });
      }

      // Check access permission
      if (req.user.role === 'student' && deck.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập deck này'
        });
      }

      query.deck = deckId;
    }

    const flashcards = await Flashcard.find(query)
      .populate('deck', 'name description')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: flashcards.length,
      partOfSpeech,
      data: flashcards
    });

  } catch (error) {
    console.error('Get Flashcards By POS Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy flashcards theo Part of Speech',
      error: error.message
    });
  }
};

/**
 * @desc    Get all unique tags from user's flashcards
 * @route   GET /api/flashcards/tags/all
 * @access  Private
 */
exports.getAllTags = async (req, res) => {
  try {
    // Get all decks of the user
    let deckIds = [];
    
    if (req.user.role === 'student') {
      const decks = await Deck.find({ createdBy: req.user._id });
      deckIds = decks.map(d => d._id);
    } else {
      // Admin/Teacher can see all tags
      const decks = await Deck.find();
      deckIds = decks.map(d => d._id);
    }

    // Get all unique tags
    const tags = await Flashcard.distinct('tags', { deck: { $in: deckIds } });

    res.status(200).json({
      success: true,
      count: tags.length,
      data: tags.sort()
    });

  } catch (error) {
    console.error('Get All Tags Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách tags',
      error: error.message
    });
  }
};

/**
 * @desc    Get statistics by tags, POS, difficulty
 * @route   GET /api/flashcards/statistics?deckId=xxx
 * @access  Private
 */
exports.getFlashcardStatistics = async (req, res) => {
  try {
    const { deckId } = req.query;

    // Build query
    const query = {};

    if (deckId) {
      const deck = await Deck.findById(deckId);
      if (!deck) {
        return res.status(404).json({
          success: false,
          message: 'Deck không tồn tại'
        });
      }

      // Check access permission
      if (req.user.role === 'student' && deck.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập deck này'
        });
      }

      query.deck = deckId;
    } else {
      // Get all user's decks
      if (req.user.role === 'student') {
        const decks = await Deck.find({ createdBy: req.user._id });
        query.deck = { $in: decks.map(d => d._id) };
      }
    }

    // Aggregate statistics
    const [
      byPartOfSpeech,
      byDifficulty,
      byCefrLevel,
      byNoteType,
      topTags
    ] = await Promise.all([
      // By Part of Speech
      Flashcard.aggregate([
        { $match: query },
        { $group: { _id: '$partOfSpeech', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // By Difficulty
      Flashcard.aggregate([
        { $match: query },
        { $group: { _id: '$difficulty', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // By CEFR Level
      Flashcard.aggregate([
        { $match: query },
        { $group: { _id: '$cefrLevel', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      
      // By Note Type
      Flashcard.aggregate([
        { $match: query },
        { $group: { _id: '$noteType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Top 20 Tags
      Flashcard.aggregate([
        { $match: query },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ])
    ]);

    // Total count
    const totalCount = await Flashcard.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        total: totalCount,
        byPartOfSpeech: byPartOfSpeech.map(item => ({
          partOfSpeech: item._id || 'not set',
          count: item.count
        })),
        byDifficulty: byDifficulty.map(item => ({
          difficulty: item._id || 'not set',
          count: item.count
        })),
        byCefrLevel: byCefrLevel.map(item => ({
          level: item._id || 'not set',
          count: item.count
        })),
        byNoteType: byNoteType.map(item => ({
          noteType: item._id,
          count: item.count
        })),
        topTags: topTags.map(item => ({
          tag: item._id,
          count: item.count
        }))
      }
    });

  } catch (error) {
    console.error('Get Statistics Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê flashcards',
      error: error.message
    });
  }
};
