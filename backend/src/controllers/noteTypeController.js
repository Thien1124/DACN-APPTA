const Flashcard = require('../models/Flashcard');
const Deck = require('../models/Deck');

// ==================== TASK 19: NOTE TYPE SYSTEM ====================

// @desc    Create flashcard with specific note type
// @route   POST /api/flashcards/note-type
// @access  Private (Admin)
exports.createNoteTypeFlashcard = async (req, res) => {
  try {
    const { noteType, deckId, ...flashcardData } = req.body;

    // Validate deck
    const deck = await Deck.findById(deckId);
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy deck'
      });
    }

    // Validate based on note type
    let validatedData = { noteType, deck: deckId };

    switch (noteType) {
      case 'WORD':
        // Word: front = từ, back = nghĩa, example = câu ví dụ
        validatedData = {
          ...validatedData,
          front: flashcardData.word,
          back: flashcardData.meaning,
          example: flashcardData.example,
          pronunciation: flashcardData.pronunciation,
          imageUrl: flashcardData.imageUrl,
          audioUrl: flashcardData.audioUrl,
          hints: flashcardData.hints
        };
        break;

      case 'PHRASE':
        // Phrase: front = cụm từ, back = nghĩa, example = câu ví dụ
        validatedData = {
          ...validatedData,
          front: flashcardData.phrase,
          back: flashcardData.meaning,
          example: flashcardData.example,
          pronunciation: flashcardData.pronunciation,
          imageUrl: flashcardData.imageUrl,
          audioUrl: flashcardData.audioUrl,
          hints: flashcardData.hints
        };
        break;

      case 'SENTENCE':
        // Sentence: front = câu tiếng Anh, back = nghĩa tiếng Việt
        validatedData = {
          ...validatedData,
          front: flashcardData.sentence,
          back: flashcardData.translation,
          example: flashcardData.context,
          imageUrl: flashcardData.imageUrl,
          audioUrl: flashcardData.audioUrl,
          hints: flashcardData.hints
        };
        break;

      case 'CLOZE':
        // Cloze: điền khuyết
        // clozeText: "I {{c1::went}} to the store and {{c2::bought}} some milk"
        // clozeAnswers: ["went", "bought"]
        validatedData = {
          ...validatedData,
          front: flashcardData.clozeText,
          back: flashcardData.clozeAnswers.join(', '),
          clozeText: flashcardData.clozeText,
          clozeAnswers: flashcardData.clozeAnswers,
          example: flashcardData.example,
          hints: flashcardData.hints,
          imageUrl: flashcardData.imageUrl,
          audioUrl: flashcardData.audioUrl
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Loại note không hợp lệ. Chọn: WORD, PHRASE, SENTENCE, hoặc CLOZE'
        });
    }

    // Create flashcard
    const flashcard = await Flashcard.create(validatedData);

    // Update deck totalCards
    await Deck.findByIdAndUpdate(deckId, {
      $inc: { totalCards: 1 }
    });

    res.status(201).json({
      success: true,
      message: `Tạo thẻ ${noteType} thành công`,
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

// @desc    Create bulk flashcards with note types
// @route   POST /api/flashcards/note-type/bulk
// @access  Private (Admin)
exports.createBulkNoteTypeFlashcards = async (req, res) => {
  try {
    const { deckId, flashcards } = req.body;

    // Validate deck
    const deck = await Deck.findById(deckId);
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy deck'
      });
    }

    const processedFlashcards = [];

    for (const card of flashcards) {
      let validatedData = { noteType: card.noteType, deck: deckId };

      switch (card.noteType) {
        case 'WORD':
          validatedData = {
            ...validatedData,
            front: card.word,
            back: card.meaning,
            example: card.example,
            pronunciation: card.pronunciation,
            imageUrl: card.imageUrl,
            audioUrl: card.audioUrl,
            hints: card.hints
          };
          break;

        case 'PHRASE':
          validatedData = {
            ...validatedData,
            front: card.phrase,
            back: card.meaning,
            example: card.example,
            pronunciation: card.pronunciation,
            imageUrl: card.imageUrl,
            audioUrl: card.audioUrl,
            hints: card.hints
          };
          break;

        case 'SENTENCE':
          validatedData = {
            ...validatedData,
            front: card.sentence,
            back: card.translation,
            example: card.context,
            imageUrl: card.imageUrl,
            audioUrl: card.audioUrl,
            hints: card.hints
          };
          break;

        case 'CLOZE':
          validatedData = {
            ...validatedData,
            front: card.clozeText,
            back: card.clozeAnswers.join(', '),
            clozeText: card.clozeText,
            clozeAnswers: card.clozeAnswers,
            example: card.example,
            hints: card.hints,
            imageUrl: card.imageUrl,
            audioUrl: card.audioUrl
          };
          break;

        default:
          continue; // Skip invalid note types
      }

      processedFlashcards.push(validatedData);
    }

    // Create flashcards
    const createdFlashcards = await Flashcard.insertMany(processedFlashcards);

    // Update deck totalCards
    await Deck.findByIdAndUpdate(deckId, {
      $inc: { totalCards: createdFlashcards.length }
    });

    res.status(201).json({
      success: true,
      message: `Tạo ${createdFlashcards.length} thẻ thành công`,
      count: createdFlashcards.length,
      data: createdFlashcards
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể tạo flashcard',
      error: error.message
    });
  }
};

// @desc    Get flashcards by note type
// @route   GET /api/flashcards/note-type/:noteType
// @access  Private
exports.getFlashcardsByNoteType = async (req, res) => {
  try {
    const { noteType } = req.params;
    const { deckId } = req.query;

    const filter = { noteType: noteType.toUpperCase() };
    if (deckId) {
      filter.deck = deckId;
    }

    const flashcards = await Flashcard.find(filter).populate('deck', 'title');

    res.status(200).json({
      success: true,
      count: flashcards.length,
      noteType,
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

// @desc    Update flashcard with note type
// @route   PUT /api/flashcards/note-type/:id
// @access  Private (Admin)
exports.updateNoteTypeFlashcard = async (req, res) => {
  try {
    const { id } = req.params;
    const { noteType, ...updateData } = req.body;

    const flashcard = await Flashcard.findById(id);
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy flashcard'
      });
    }

    // If changing note type, revalidate data
    if (noteType && noteType !== flashcard.noteType) {
      let validatedData = { noteType };

      switch (noteType) {
        case 'WORD':
          validatedData = {
            ...validatedData,
            front: updateData.word,
            back: updateData.meaning,
            example: updateData.example,
            pronunciation: updateData.pronunciation,
            clozeText: null,
            clozeAnswers: []
          };
          break;

        case 'PHRASE':
          validatedData = {
            ...validatedData,
            front: updateData.phrase,
            back: updateData.meaning,
            example: updateData.example,
            pronunciation: updateData.pronunciation,
            clozeText: null,
            clozeAnswers: []
          };
          break;

        case 'SENTENCE':
          validatedData = {
            ...validatedData,
            front: updateData.sentence,
            back: updateData.translation,
            example: updateData.context,
            clozeText: null,
            clozeAnswers: []
          };
          break;

        case 'CLOZE':
          validatedData = {
            ...validatedData,
            front: updateData.clozeText,
            back: updateData.clozeAnswers.join(', '),
            clozeText: updateData.clozeText,
            clozeAnswers: updateData.clozeAnswers,
            pronunciation: null
          };
          break;

        default:
          return res.status(400).json({
            success: false,
            message: 'Loại note không hợp lệ'
          });
      }

      Object.assign(flashcard, validatedData);
    } else {
      // Just update provided fields
      Object.assign(flashcard, updateData);
    }

    await flashcard.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật flashcard thành công',
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

// @desc    Get note type statistics for a deck
// @route   GET /api/flashcards/note-type/stats/:deckId
// @access  Private
exports.getNoteTypeStats = async (req, res) => {
  try {
    const { deckId } = req.params;
    const mongoose = require('mongoose');

    const stats = await Flashcard.aggregate([
      { $match: { deck: new mongoose.Types.ObjectId(deckId) } },
      {
        $group: {
          _id: '$noteType',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          noteType: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    const total = stats.reduce((sum, item) => sum + item.count, 0);

    res.status(200).json({
      success: true,
      deckId,
      total,
      breakdown: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thống kê',
      error: error.message
    });
  }
};
