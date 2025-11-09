const Flashcard = require('../models/Flashcard');
const Deck = require('../models/Deck');

// ==================== TASK 20: RICH FLASHCARD DATA ====================

// @desc    Create flashcard with rich data
// @route   POST /api/flashcards/rich
// @access  Private (Admin)
exports.createRichFlashcard = async (req, res) => {
  try {
    const { deckId, ...flashcardData } = req.body;

    // Validate deck
    const deck = await Deck.findById(deckId);
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy deck'
      });
    }

    // Create flashcard with all rich data
    const flashcard = await Flashcard.create({
      ...flashcardData,
      deck: deckId
    });

    // Update deck totalCards
    await Deck.findByIdAndUpdate(deckId, {
      $inc: { totalCards: 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Tạo flashcard với dữ liệu phong phú thành công',
      data: flashcard
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể tạo flashcard',
      error: error.message
    });
  }
};

// @desc    Create vocabulary flashcard (WORD type with full data)
// @route   POST /api/flashcards/vocabulary
// @access  Private (Admin)
exports.createVocabularyCard = async (req, res) => {
  try {
    const {
      deckId,
      word,
      pronunciation,
      partOfSpeech,
      meanings,
      synonyms,
      antonyms,
      collocations,
      images,
      audios,
      usageNotes,
      grammarNotes,
      tags,
      difficulty,
      cefrLevel
    } = req.body;

    // Validate deck
    const deck = await Deck.findById(deckId);
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy deck'
      });
    }

    // Build front text
    let frontText = word;
    if (pronunciation) {
      frontText += ` [${pronunciation}]`;
    }
    if (partOfSpeech) {
      frontText += ` (${partOfSpeech})`;
    }

    // Build back text (primary meaning)
    let backText = '';
    if (meanings && meanings.length > 0) {
      backText = meanings.map((m, i) => 
        `${i + 1}. ${m.definition}${m.translation ? ` - ${m.translation}` : ''}`
      ).join('\n');
    }

    // Build example text
    let exampleText = '';
    if (meanings && meanings.length > 0) {
      exampleText = meanings
        .filter(m => m.example)
        .map((m, i) => `${i + 1}. ${m.example}`)
        .join('\n');
    }

    // Create flashcard
    const flashcard = await Flashcard.create({
      noteType: 'WORD',
      front: frontText,
      back: backText,
      example: exampleText,
      pronunciation,
      partOfSpeech,
      meanings,
      synonyms,
      antonyms,
      collocations,
      images,
      audios,
      usageNotes,
      grammarNotes,
      tags,
      difficulty,
      cefrLevel,
      deck: deckId
    });

    // Update deck totalCards
    await Deck.findByIdAndUpdate(deckId, {
      $inc: { totalCards: 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Tạo thẻ từ vựng thành công',
      data: flashcard
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể tạo thẻ từ vựng',
      error: error.message
    });
  }
};

// @desc    Add synonym to flashcard
// @route   POST /api/flashcards/:id/synonyms
// @access  Private (Admin)
exports.addSynonym = async (req, res) => {
  try {
    const { id } = req.params;
    const { word, note } = req.body;

    const flashcard = await Flashcard.findById(id);
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy flashcard'
      });
    }

    flashcard.synonyms.push({ word, note });
    await flashcard.save();

    res.status(200).json({
      success: true,
      message: 'Thêm từ đồng nghĩa thành công',
      data: flashcard
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể thêm từ đồng nghĩa',
      error: error.message
    });
  }
};

// @desc    Add antonym to flashcard
// @route   POST /api/flashcards/:id/antonyms
// @access  Private (Admin)
exports.addAntonym = async (req, res) => {
  try {
    const { id } = req.params;
    const { word, note } = req.body;

    const flashcard = await Flashcard.findById(id);
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy flashcard'
      });
    }

    flashcard.antonyms.push({ word, note });
    await flashcard.save();

    res.status(200).json({
      success: true,
      message: 'Thêm từ trái nghĩa thành công',
      data: flashcard
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể thêm từ trái nghĩa',
      error: error.message
    });
  }
};

// @desc    Add collocation to flashcard
// @route   POST /api/flashcards/:id/collocations
// @access  Private (Admin)
exports.addCollocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { phrase, meaning, example } = req.body;

    const flashcard = await Flashcard.findById(id);
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy flashcard'
      });
    }

    flashcard.collocations.push({ phrase, meaning, example });
    await flashcard.save();

    res.status(200).json({
      success: true,
      message: 'Thêm collocation thành công',
      data: flashcard
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể thêm collocation',
      error: error.message
    });
  }
};

// @desc    Add meaning to flashcard
// @route   POST /api/flashcards/:id/meanings
// @access  Private (Admin)
exports.addMeaning = async (req, res) => {
  try {
    const { id } = req.params;
    const { definition, example, translation } = req.body;

    const flashcard = await Flashcard.findById(id);
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy flashcard'
      });
    }

    flashcard.meanings.push({ definition, example, translation });
    await flashcard.save();

    res.status(200).json({
      success: true,
      message: 'Thêm nghĩa thành công',
      data: flashcard
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể thêm nghĩa',
      error: error.message
    });
  }
};

// @desc    Add image to flashcard
// @route   POST /api/flashcards/:id/images
// @access  Private (Admin)
exports.addImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { url, caption } = req.body;

    const flashcard = await Flashcard.findById(id);
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy flashcard'
      });
    }

    flashcard.images.push({ url, caption });
    await flashcard.save();

    res.status(200).json({
      success: true,
      message: 'Thêm hình ảnh thành công',
      data: flashcard
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể thêm hình ảnh',
      error: error.message
    });
  }
};

// @desc    Add audio to flashcard
// @route   POST /api/flashcards/:id/audios
// @access  Private (Admin)
exports.addAudio = async (req, res) => {
  try {
    const { id } = req.params;
    const { url, accent, speaker } = req.body;

    const flashcard = await Flashcard.findById(id);
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy flashcard'
      });
    }

    flashcard.audios.push({ url, accent, speaker });
    await flashcard.save();

    res.status(200).json({
      success: true,
      message: 'Thêm audio thành công',
      data: flashcard
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể thêm audio',
      error: error.message
    });
  }
};

// @desc    Update rich data fields
// @route   PUT /api/flashcards/:id/rich
// @access  Private (Admin)
exports.updateRichData = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const flashcard = await Flashcard.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy flashcard'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật dữ liệu thành công',
      data: flashcard
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể cập nhật dữ liệu',
      error: error.message
    });
  }
};

// @desc    Get flashcard with full rich data
// @route   GET /api/flashcards/:id/rich
// @access  Private
exports.getRichFlashcard = async (req, res) => {
  try {
    const { id } = req.params;

    const flashcard = await Flashcard.findById(id).populate('deck', 'title category');

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy flashcard'
      });
    }

    res.status(200).json({
      success: true,
      data: flashcard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy flashcard',
      error: error.message
    });
  }
};

// @desc    Search flashcards by tags
// @route   GET /api/flashcards/search/tags
// @access  Private
exports.searchByTags = async (req, res) => {
  try {
    const { tags, deckId } = req.query;

    if (!tags) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp tags để tìm kiếm'
      });
    }

    const tagArray = tags.split(',').map(tag => tag.trim());
    
    const filter = {
      tags: { $in: tagArray }
    };

    if (deckId) {
      filter.deck = deckId;
    }

    const flashcards = await Flashcard.find(filter).populate('deck', 'title');

    res.status(200).json({
      success: true,
      count: flashcards.length,
      data: flashcards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể tìm kiếm flashcard',
      error: error.message
    });
  }
};

// @desc    Get flashcards by difficulty level
// @route   GET /api/flashcards/difficulty/:level
// @access  Private
exports.getByDifficulty = async (req, res) => {
  try {
    const { level } = req.params;
    const { deckId } = req.query;

    const filter = { difficulty: level };
    if (deckId) {
      filter.deck = deckId;
    }

    const flashcards = await Flashcard.find(filter).populate('deck', 'title');

    res.status(200).json({
      success: true,
      count: flashcards.length,
      difficulty: level,
      data: flashcards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy flashcard',
      error: error.message
    });
  }
};

// @desc    Get flashcards by CEFR level
// @route   GET /api/flashcards/cefr/:level
// @access  Private
exports.getByCEFR = async (req, res) => {
  try {
    const { level } = req.params;
    const { deckId } = req.query;

    const filter = { cefrLevel: level.toUpperCase() };
    if (deckId) {
      filter.deck = deckId;
    }

    const flashcards = await Flashcard.find(filter).populate('deck', 'title');

    res.status(200).json({
      success: true,
      count: flashcards.length,
      cefrLevel: level.toUpperCase(),
      data: flashcards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy flashcard',
      error: error.message
    });
  }
};

// @desc    Get flashcards by part of speech
// @route   GET /api/flashcards/pos/:partOfSpeech
// @access  Private
exports.getByPartOfSpeech = async (req, res) => {
  try {
    const { partOfSpeech } = req.params;
    const { deckId } = req.query;

    const filter = { partOfSpeech };
    if (deckId) {
      filter.deck = deckId;
    }

    const flashcards = await Flashcard.find(filter).populate('deck', 'title');

    res.status(200).json({
      success: true,
      count: flashcards.length,
      partOfSpeech,
      data: flashcards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy flashcard',
      error: error.message
    });
  }
};
