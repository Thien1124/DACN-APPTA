const mongoose = require('mongoose');
const Deck = require('../models/Deck');
const Flashcard = require('../models/Flashcard');

// ==================== TASK 18: DECK MANAGEMENT ====================

// @desc    Clone/Copy deck (sao chép deck)
// @route   POST /api/decks/:id/clone
// @access  Private
exports.cloneDeck = async (req, res) => {
  try {
    const { id } = req.params;
    const { newTitle, isPublic = false } = req.body;
    const userId = req.user.id;

    // 1. Find original deck
    const originalDeck = await Deck.findById(id);
    if (!originalDeck) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bộ thẻ gốc'
      });
    }

    // Check if user can clone (must be public or owned by user)
    if (!originalDeck.isPublic && originalDeck.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền sao chép bộ thẻ này'
      });
    }

    // 2. Create new deck (clone)
    const newDeck = await Deck.create({
      title: newTitle || `${originalDeck.title} (Copy)`,
      description: originalDeck.description + ' (Sao chép)',
      category: originalDeck.category,
      subcategory: originalDeck.subcategory,
      level: originalDeck.level,
      difficulty: originalDeck.difficulty,
      tags: [...originalDeck.tags],
      isPublic: isPublic,
      isFeatured: false,
      imageUrl: originalDeck.imageUrl,
      createdBy: userId,
      totalCards: 0
    });

    // 3. Copy all flashcards
    const originalFlashcards = await Flashcard.find({ deck: id });
    
    if (originalFlashcards.length > 0) {
      const newFlashcards = originalFlashcards.map(card => ({
        front: card.front,
        back: card.back,
        example: card.example,
        imageUrl: card.imageUrl,
        audioUrl: card.audioUrl,
        deck: newDeck._id
      }));

      await Flashcard.insertMany(newFlashcards);
      
      // Update totalCards
      newDeck.totalCards = newFlashcards.length;
      await newDeck.save();
    }

    // 4. Populate and return
    const populatedDeck = await Deck.findById(newDeck._id)
      .populate('createdBy', 'fullName avatar');

    res.status(201).json({
      success: true,
      message: `Đã sao chép bộ thẻ thành công (${originalFlashcards.length} thẻ)`,
      data: populatedDeck
    });

  } catch (error) {
    console.error('[ERROR] Clone deck:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi sao chép bộ thẻ',
      error: error.message
    });
  }
};

// @desc    Merge multiple decks (hợp nhất decks)
// @route   POST /api/decks/merge
// @access  Private
exports.mergeDecks = async (req, res) => {
  try {
    const { deckIds, newTitle, newDescription, category, level, difficulty, isPublic = false } = req.body;
    const userId = req.user.id;

    // Validation
    if (!deckIds || deckIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Cần ít nhất 2 bộ thẻ để hợp nhất'
      });
    }

    // 1. Find all decks
    const decks = await Deck.find({ _id: { $in: deckIds } });
    
    if (decks.length !== deckIds.length) {
      return res.status(404).json({
        success: false,
        message: 'Một hoặc nhiều bộ thẻ không tồn tại'
      });
    }

    // Check ownership
    const canMerge = decks.every(deck => 
      deck.isPublic || deck.createdBy.toString() === userId
    );

    if (!canMerge) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền hợp nhất một hoặc nhiều bộ thẻ này'
      });
    }

    // 2. Collect all tags
    const allTags = [...new Set(decks.flatMap(deck => deck.tags))];

    // 3. Create merged deck
    const mergedDeck = await Deck.create({
      title: newTitle || `Merged Deck (${decks.length} decks)`,
      description: newDescription || `Hợp nhất từ: ${decks.map(d => d.title).join(', ')}`,
      category: category || decks[0].category,
      level: level || decks[0].level,
      difficulty: difficulty || decks[0].difficulty,
      tags: allTags,
      isPublic: isPublic,
      isFeatured: false,
      createdBy: userId,
      totalCards: 0
    });

    // 4. Copy all flashcards from all decks
    let totalFlashcards = 0;
    
    for (const deck of decks) {
      const flashcards = await Flashcard.find({ deck: deck._id });
      
      if (flashcards.length > 0) {
        const newFlashcards = flashcards.map(card => ({
          front: card.front,
          back: card.back,
          example: card.example,
          imageUrl: card.imageUrl,
          audioUrl: card.audioUrl,
          deck: mergedDeck._id
        }));

        await Flashcard.insertMany(newFlashcards);
        totalFlashcards += flashcards.length;
      }
    }

    // Update totalCards
    mergedDeck.totalCards = totalFlashcards;
    await mergedDeck.save();

    const populatedDeck = await Deck.findById(mergedDeck._id)
      .populate('createdBy', 'fullName avatar');

    res.status(201).json({
      success: true,
      message: `Đã hợp nhất ${decks.length} bộ thẻ thành công (${totalFlashcards} thẻ)`,
      data: {
        mergedDeck: populatedDeck,
        sourceDecks: decks.map(d => ({ id: d._id, title: d.title })),
        totalFlashcards
      }
    });

  } catch (error) {
    console.error('[ERROR] Merge decks:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi hợp nhất bộ thẻ',
      error: error.message
    });
  }
};

// @desc    Split deck (tách deck theo tiêu chí)
// @route   POST /api/decks/:id/split
// @access  Private
exports.splitDeck = async (req, res) => {
  try {
    const { id } = req.params;
    const { splitBy, criteria, newTitles } = req.body;
    const userId = req.user.id;

    // splitBy: 'tag', 'difficulty', 'custom'
    // criteria: ['tag1', 'tag2'] or ['easy', 'hard'] or [[cardId1, cardId2], [cardId3]]
    // newTitles: ['Deck 1', 'Deck 2']

    // 1. Find original deck
    const originalDeck = await Deck.findById(id);
    if (!originalDeck) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bộ thẻ'
      });
    }

    // Check ownership
    if (originalDeck.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền tách bộ thẻ này'
      });
    }

    // 2. Get all flashcards
    const allFlashcards = await Flashcard.find({ deck: id });
    
    if (allFlashcards.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Bộ thẻ không có flashcard để tách'
      });
    }

    // 3. Split flashcards based on criteria
    let groups = [];

    switch (splitBy) {
      case 'size':
        // Split by number of cards per deck
        const cardsPerDeck = parseInt(criteria);
        for (let i = 0; i < allFlashcards.length; i += cardsPerDeck) {
          groups.push(allFlashcards.slice(i, i + cardsPerDeck));
        }
        break;

      case 'count':
        // Split into N equal decks
        const numberOfDecks = parseInt(criteria);
        const chunkSize = Math.ceil(allFlashcards.length / numberOfDecks);
        for (let i = 0; i < numberOfDecks; i++) {
          const start = i * chunkSize;
          const end = start + chunkSize;
          groups.push(allFlashcards.slice(start, end));
        }
        break;

      case 'custom':
        // Split by array of card IDs
        groups = criteria.map(cardIds => 
          allFlashcards.filter(card => cardIds.includes(card._id.toString()))
        );
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'splitBy không hợp lệ. Chọn: size, count, hoặc custom'
        });
    }

    // 4. Create new decks
    const newDecks = [];
    
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      
      if (group.length === 0) continue;

      const newDeck = await Deck.create({
        title: (newTitles && newTitles[i]) || `${originalDeck.title} - Part ${i + 1}`,
        description: `Tách từ: ${originalDeck.title}`,
        category: originalDeck.category,
        subcategory: originalDeck.subcategory,
        level: originalDeck.level,
        difficulty: originalDeck.difficulty,
        tags: originalDeck.tags,
        isPublic: false,
        createdBy: userId,
        totalCards: 0
      });

      // Copy flashcards to new deck
      const newFlashcards = group.map(card => ({
        front: card.front,
        back: card.back,
        example: card.example,
        imageUrl: card.imageUrl,
        audioUrl: card.audioUrl,
        deck: newDeck._id
      }));

      await Flashcard.insertMany(newFlashcards);
      
      newDeck.totalCards = newFlashcards.length;
      await newDeck.save();

      newDecks.push({
        id: newDeck._id,
        title: newDeck.title,
        totalCards: newDeck.totalCards
      });
    }

    res.status(201).json({
      success: true,
      message: `Đã tách bộ thẻ thành ${newDecks.length} bộ mới`,
      data: {
        originalDeck: {
          id: originalDeck._id,
          title: originalDeck.title,
          totalCards: originalDeck.totalCards
        },
        newDecks,
        totalCards: allFlashcards.length
      }
    });

  } catch (error) {
    console.error('[ERROR] Split deck:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tách bộ thẻ',
      error: error.message
    });
  }
};
