const Flashcard = require('../models/Flashcard');

/**
 * Check if a card should be marked as leech
 * @param {Object} flashcard - Flashcard document
 * @returns {Boolean} True if should be marked as leech
 */
exports.shouldMarkAsLeech = (flashcard) => {
  // Anki algorithm: Mark as leech if:
  // 1. Consecutive fails >= threshold (default 8)
  // 2. Total fails >= threshold
  const threshold = flashcard.leechThreshold || 8;
  
  return flashcard.consecutiveFails >= threshold || flashcard.failCount >= threshold;
};

/**
 * Auto-detect and mark leech cards
 * @param {String} flashcardId - Flashcard ID
 * @returns {Object} Updated flashcard
 */
exports.autoDetectLeech = async (flashcardId) => {
  const flashcard = await Flashcard.findById(flashcardId);
  
  if (!flashcard) {
    throw new Error('Không tìm thấy flashcard');
  }
  
  if (this.shouldMarkAsLeech(flashcard) && !flashcard.isLeech) {
    flashcard.isLeech = true;
    flashcard.leechDetectedAt = new Date();
    await flashcard.save();
    
    return {
      marked: true,
      flashcard
    };
  }
  
  return {
    marked: false,
    flashcard
  };
};

/**
 * Increment fail count and check for leech
 * Called when user answers incorrectly
 * @param {String} flashcardId - Flashcard ID
 * @returns {Object} Result with leech status
 */
exports.recordFailure = async (flashcardId) => {
  const flashcard = await Flashcard.findById(flashcardId);
  
  if (!flashcard) {
    throw new Error('Không tìm thấy flashcard');
  }
  
  // Increment counters
  flashcard.failCount += 1;
  flashcard.consecutiveFails += 1;
  
  // Check if should mark as leech
  const shouldMark = this.shouldMarkAsLeech(flashcard);
  
  if (shouldMark && !flashcard.isLeech) {
    flashcard.isLeech = true;
    flashcard.leechDetectedAt = new Date();
  }
  
  await flashcard.save();
  
  return {
    failCount: flashcard.failCount,
    consecutiveFails: flashcard.consecutiveFails,
    isLeech: flashcard.isLeech,
    justBecameLeech: shouldMark && flashcard.isLeech
  };
};

/**
 * Reset consecutive fails on correct answer
 * @param {String} flashcardId - Flashcard ID
 */
exports.recordSuccess = async (flashcardId) => {
  const flashcard = await Flashcard.findById(flashcardId);
  
  if (!flashcard) {
    throw new Error('Không tìm thấy flashcard');
  }
  
  // Reset consecutive fails
  flashcard.consecutiveFails = 0;
  await flashcard.save();
  
  return flashcard;
};

/**
 * Get leech statistics for a deck
 * @param {String} deckId - Deck ID
 * @returns {Object} Statistics
 */
exports.getLeechStats = async (deckId) => {
  const totalLeeches = await Flashcard.countDocuments({
    deck: deckId,
    isLeech: true
  });
  
  const activeLeeches = await Flashcard.countDocuments({
    deck: deckId,
    isLeech: true,
    status: 'active'
  });
  
  const suspendedLeeches = await Flashcard.countDocuments({
    deck: deckId,
    isLeech: true,
    status: 'suspended'
  });
  
  return {
    total: totalLeeches,
    active: activeLeeches,
    suspended: suspendedLeeches
  };
};

/**
 * Auto-bury cards until next day
 * @param {Array} flashcardIds - Array of flashcard IDs
 * @returns {Number} Number of buried cards
 */
exports.autoBuryUntilNextDay = async (flashcardIds) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const result = await Flashcard.updateMany(
    { _id: { $in: flashcardIds } },
    { 
      status: 'buried',
      buriedUntil: tomorrow
    }
  );
  
  return result.modifiedCount;
};

/**
 * Unbury cards that have passed their buriedUntil time
 * Should be run periodically (e.g., daily)
 */
exports.unburyExpiredCards = async () => {
  const now = new Date();
  
  const result = await Flashcard.updateMany(
    {
      status: 'buried',
      buriedUntil: { $lte: now }
    },
    {
      status: 'active',
      $unset: { buriedUntil: 1 }
    }
  );
  
  return result.modifiedCount;
};
