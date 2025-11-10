const VocabularyBank = require('../models/VocabularyBank');
const Flashcard = require('../models/Flashcard');

/**
 * @desc    Get all vocabulary in user's bank
 * @route   GET /api/vocabulary-bank
 * @access  Private
 */
exports.getMyVocabulary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { filter } = req.query; // all, starred, learned

    let query = { user: userId };
    
    if (filter === 'starred') {
      query.isStarred = true;
    } else if (filter === 'learned') {
      query.isLearned = true;
    }

    const vocabularies = await VocabularyBank.find(query)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: vocabularies.length,
      data: vocabularies
    });

  } catch (error) {
    console.error('❌ Get my vocabulary error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách từ vựng',
      error: error.message
    });
  }
};

/**
 * @desc    Add vocabulary manually to bank
 * @route   POST /api/vocabulary-bank
 * @access  Private
 */
exports.addVocabulary = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      word,
      pronunciation,
      meaning,
      partOfSpeech,
      example,
      synonyms,
      antonyms,
      imageUrl,
      audioUrl,
      tags,
      difficulty,
      cefrLevel,
      notes
    } = req.body;

    // Check if already exists
    const existing = await VocabularyBank.findOne({
      user: userId,
      word: word.toLowerCase()
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Từ vựng này đã có trong sổ tay của bạn'
      });
    }

    // Create new vocabulary
    const vocabulary = await VocabularyBank.create({
      user: userId,
      word,
      pronunciation,
      meaning,
      partOfSpeech,
      example,
      synonyms,
      antonyms,
      imageUrl,
      audioUrl,
      tags,
      difficulty,
      cefrLevel,
      notes,
      source: 'manual'
    });

    res.status(201).json({
      success: true,
      message: 'Đã thêm từ vựng vào sổ tay',
      data: vocabulary
    });

  } catch (error) {
    console.error('❌ Add vocabulary error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể thêm từ vựng',
      error: error.message
    });
  }
};

/**
 * @desc    Save flashcard to vocabulary bank
 * @route   POST /api/vocabulary-bank/save-flashcard/:flashcardId
 * @access  Private
 */
exports.saveFlashcardToBank = async (req, res) => {
  try {
    const { flashcardId } = req.params;
    const userId = req.user.id;

    // Get flashcard details
    const flashcard = await Flashcard.findById(flashcardId);
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy flashcard'
      });
    }

    // Check if already exists
    const existing = await VocabularyBank.findOne({
      user: userId,
      word: flashcard.front.toLowerCase()
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Từ vựng này đã có trong sổ tay của bạn'
      });
    }

    // Create vocabulary entry from flashcard
    const vocabulary = await VocabularyBank.create({
      user: userId,
      word: flashcard.front,
      pronunciation: flashcard.pronunciation || '',
      meaning: flashcard.back,
      partOfSpeech: flashcard.partOfSpeech || 'other',
      example: flashcard.example || flashcard.meanings?.[0]?.example || '',
      synonyms: flashcard.synonyms?.map(s => s.word || s) || [],
      antonyms: flashcard.antonyms?.map(a => a.word || a) || [],
      imageUrl: flashcard.imageUrl || '',
      audioUrl: flashcard.audioUrl || '',
      tags: flashcard.tags || [],
      difficulty: flashcard.difficulty || 'intermediate',
      cefrLevel: flashcard.cefrLevel || null,
      source: 'flashcard',
      sourceId: flashcardId,
      sourceModel: 'Flashcard'
    });

    res.status(201).json({
      success: true,
      message: '✅ Đã lưu từ vựng vào sổ tay',
      data: vocabulary
    });

  } catch (error) {
    console.error('❌ Save flashcard to bank error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lưu từ vựng vào sổ tay',
      error: error.message
    });
  }
};

/**
 * @desc    Check if flashcard is saved in bank
 * @route   GET /api/vocabulary-bank/check/:flashcardId
 * @access  Private
 */
exports.checkFlashcardSaved = async (req, res) => {
  try {
    const { flashcardId } = req.params;
    const userId = req.user.id;

    const flashcard = await Flashcard.findById(flashcardId);
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy flashcard'
      });
    }

    const existing = await VocabularyBank.findOne({
      user: userId,
      word: flashcard.front.toLowerCase()
    });

    res.status(200).json({
      success: true,
      isSaved: !!existing,
      data: existing
    });

  } catch (error) {
    console.error('❌ Check flashcard saved error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể kiểm tra trạng thái',
      error: error.message
    });
  }
};

/**
 * @desc    Toggle star vocabulary
 * @route   PUT /api/vocabulary-bank/:id/star
 * @access  Private
 */
exports.toggleStar = async (req, res) => {
  try {
    const vocabId = req.params.id;
    const userId = req.user.id;

    const vocabulary = await VocabularyBank.findOne({
      _id: vocabId,
      user: userId
    });

    if (!vocabulary) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy từ vựng'
      });
    }

    vocabulary.isStarred = !vocabulary.isStarred;
    await vocabulary.save();

    res.status(200).json({
      success: true,
      message: vocabulary.isStarred ? 'Đã đánh dấu sao' : 'Đã bỏ đánh dấu sao',
      data: vocabulary
    });

  } catch (error) {
    console.error('❌ Toggle star error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật trạng thái',
      error: error.message
    });
  }
};

/**
 * @desc    Toggle learned vocabulary
 * @route   PUT /api/vocabulary-bank/:id/learned
 * @access  Private
 */
exports.toggleLearned = async (req, res) => {
  try {
    const vocabId = req.params.id;
    const userId = req.user.id;

    const vocabulary = await VocabularyBank.findOne({
      _id: vocabId,
      user: userId
    });

    if (!vocabulary) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy từ vựng'
      });
    }

    vocabulary.isLearned = !vocabulary.isLearned;
    if (vocabulary.isLearned) {
      vocabulary.mastery = Math.min(vocabulary.mastery + 20, 100);
    }
    await vocabulary.save();

    res.status(200).json({
      success: true,
      message: vocabulary.isLearned ? 'Đã đánh dấu đã học' : 'Đã bỏ đánh dấu đã học',
      data: vocabulary
    });

  } catch (error) {
    console.error('❌ Toggle learned error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật trạng thái',
      error: error.message
    });
  }
};

/**
 * @desc    Update vocabulary
 * @route   PUT /api/vocabulary-bank/:id
 * @access  Private
 */
exports.updateVocabulary = async (req, res) => {
  try {
    const vocabId = req.params.id;
    const userId = req.user.id;

    const vocabulary = await VocabularyBank.findOneAndUpdate(
      { _id: vocabId, user: userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!vocabulary) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy từ vựng'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Đã cập nhật từ vựng',
      data: vocabulary
    });

  } catch (error) {
    console.error('❌ Update vocabulary error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật từ vựng',
      error: error.message
    });
  }
};

/**
 * @desc    Delete vocabulary
 * @route   DELETE /api/vocabulary-bank/:id
 * @access  Private
 */
exports.deleteVocabulary = async (req, res) => {
  try {
    const vocabId = req.params.id;
    const userId = req.user.id;

    const vocabulary = await VocabularyBank.findOneAndDelete({
      _id: vocabId,
      user: userId
    });

    if (!vocabulary) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy từ vựng'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Đã xóa từ vựng khỏi sổ tay'
    });

  } catch (error) {
    console.error('❌ Delete vocabulary error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể xóa từ vựng',
      error: error.message
    });
  }
};

/**
 * @desc    Get vocabulary statistics
 * @route   GET /api/vocabulary-bank/stats
 * @access  Private
 */
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const total = await VocabularyBank.countDocuments({ user: userId });
    const learned = await VocabularyBank.countDocuments({ user: userId, isLearned: true });
    const starred = await VocabularyBank.countDocuments({ user: userId, isStarred: true });

    res.status(200).json({
      success: true,
      data: {
        total,
        learned,
        starred,
        learning: total - learned
      }
    });

  } catch (error) {
    console.error('❌ Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thống kê',
      error: error.message
    });
  }
};