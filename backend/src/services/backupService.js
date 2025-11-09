const fs = require('fs').promises;
const path = require('path');
const Flashcard = require('../models/Flashcard');
const Deck = require('../models/Deck');
const StudyProgress = require('../models/StudyProgress');

// Backup directory
const BACKUP_DIR = path.join(__dirname, '../../uploads/backups');

/**
 * Ensure backup directory exists
 */
const ensureBackupDir = async () => {
  try {
    await fs.access(BACKUP_DIR);
  } catch {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
  }
};

/**
 * Create full backup of a deck (JSON format with all metadata)
 * @param {String} deckId - Deck ID
 * @param {String} userId - User ID (for ownership check)
 * @returns {Promise<Object>} Backup info
 */
const backupDeck = async (deckId, userId) => {
  await ensureBackupDir();

  // Fetch deck
  const deck = await Deck.findById(deckId).lean();
  if (!deck) {
    throw new Error('Deck không tồn tại');
  }
  if (deck.createdBy.toString() !== userId.toString()) {
    throw new Error('Bạn không có quyền backup deck này');
  }

  // Fetch all flashcards
  const flashcards = await Flashcard.find({ deck: deckId }).lean();

  // Fetch study progress for this user
  const progressData = await StudyProgress.find({
    user: userId,
    flashcard: { $in: flashcards.map(f => f._id) },
  }).lean();

  // Create backup object
  const backup = {
    version: '1.0',
    createdAt: new Date().toISOString(),
    deck: {
      name: deck.name,
      description: deck.description,
      language: deck.language,
      difficulty: deck.difficulty,
      isPublic: deck.isPublic,
      category: deck.category,
    },
    flashcards: flashcards.map(card => ({
      front: card.front,
      back: card.back,
      pronunciation: card.pronunciation,
      partOfSpeech: card.partOfSpeech,
      level: card.level,
      example: card.example,
      imageUrl: card.imageUrl,
      audioUrl: card.audioUrl,
      tags: card.tags,
      notes: card.notes,
      status: card.status,
      isLeech: card.isLeech,
      failCount: card.failCount,
      consecutiveFails: card.consecutiveFails,
      leechThreshold: card.leechThreshold,
      createdAt: card.createdAt,
    })),
    progress: progressData.map(p => ({
      flashcardFront: flashcards.find(f => f._id.toString() === p.flashcard.toString())?.front,
      reviewCount: p.reviewCount,
      correctCount: p.correctCount,
      ease: p.ease,
      interval: p.interval,
      repetitions: p.repetitions,
      nextReview: p.nextReview,
      lastReviewedAt: p.lastReviewedAt,
    })),
    stats: {
      totalCards: flashcards.length,
      activeCards: flashcards.filter(c => c.status === 'active').length,
      totalReviews: progressData.reduce((sum, p) => sum + (p.reviewCount || 0), 0),
    },
  };

  // Generate filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const deckName = deck.name || deck.title || 'deck';
  const sanitizedName = deckName.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
  const filename = `backup_${sanitizedName}_${timestamp}.json`;
  const filepath = path.join(BACKUP_DIR, filename);

  // Write to file
  await fs.writeFile(filepath, JSON.stringify(backup, null, 2), 'utf8');

  return {
    success: true,
    filename,
    filepath,
    size: (await fs.stat(filepath)).size,
    cardCount: flashcards.length,
    createdAt: backup.createdAt,
  };
};

/**
 * Restore deck from backup file
 * @param {String} filename - Backup filename
 * @param {String} userId - User ID
 * @param {Object} options - Restore options
 * @returns {Promise<Object>} Restore result
 */
const restoreDeck = async (filename, userId, options = {}) => {
  const {
    overwriteExisting = false,
    restoreProgress = true,
    newDeckName = null,
  } = options;

  const filepath = path.join(BACKUP_DIR, filename);

  // Read backup file
  let backup;
  try {
    const fileContent = await fs.readFile(filepath, 'utf8');
    backup = JSON.parse(fileContent);
  } catch (error) {
    throw new Error(`Không thể đọc file backup: ${error.message}`);
  }

  // Validate backup format
  if (!backup.version || !backup.deck || !backup.flashcards) {
    throw new Error('File backup không hợp lệ');
  }

  // Check if deck with same name exists
  const existingDeck = await Deck.findOne({
    name: newDeckName || backup.deck.name,
    createdBy: userId,
  });

  let deck;

  if (existingDeck && !overwriteExisting) {
    throw new Error('Deck đã tồn tại. Sử dụng tùy chọn overwrite hoặc đổi tên deck.');
  }

  if (existingDeck && overwriteExisting) {
    // Delete existing flashcards
    await Flashcard.deleteMany({ deck: existingDeck._id });
    await StudyProgress.deleteMany({
      user: userId,
      flashcard: { $in: await Flashcard.find({ deck: existingDeck._id }).distinct('_id') },
    });
    
    deck = existingDeck;
    deck.updatedAt = new Date();
  } else {
    // Create new deck
    deck = new Deck({
      ...backup.deck,
      name: newDeckName || backup.deck.name,
      createdBy: userId,
    });
    await deck.save();
  }

  // Restore flashcards
  const restoredCards = [];
  for (const cardData of backup.flashcards) {
    const newCard = new Flashcard({
      ...cardData,
      deck: deck._id,
      createdBy: userId,
      _id: undefined, // Generate new ID
    });
    await newCard.save();
    restoredCards.push(newCard);
  }

  // Restore study progress
  let restoredProgress = 0;
  if (restoreProgress && backup.progress) {
    for (const progressData of backup.progress) {
      // Match by flashcard front text
      const matchedCard = restoredCards.find(c => c.front === progressData.flashcardFront);
      if (matchedCard) {
        const progress = new StudyProgress({
          user: userId,
          flashcard: matchedCard._id,
          deck: deck._id,
          reviewCount: progressData.reviewCount || 0,
          correctCount: progressData.correctCount || 0,
          ease: progressData.ease || 2.5,
          interval: progressData.interval || 0,
          repetitions: progressData.repetitions || 0,
          nextReview: progressData.nextReview,
          lastReviewedAt: progressData.lastReviewedAt,
        });
        await progress.save();
        restoredProgress++;
      }
    }
  }

  // Update deck card count
  deck.cardCount = restoredCards.length;
  await deck.save();

  return {
    success: true,
    deck: {
      id: deck._id,
      name: deck.name,
      cardCount: deck.cardCount,
    },
    stats: {
      cardsRestored: restoredCards.length,
      progressRestored: restoredProgress,
    },
  };
};

/**
 * List all backups for a user
 * @param {String} userId - User ID (optional, for filtering)
 * @returns {Promise<Array>} List of backups
 */
const listBackups = async (userId = null) => {
  await ensureBackupDir();

  const files = await fs.readdir(BACKUP_DIR);
  const backups = [];

  for (const file of files) {
    if (!file.endsWith('.json')) continue;

    const filepath = path.join(BACKUP_DIR, file);
    const stats = await fs.stat(filepath);

    // Read backup to get metadata
    try {
      const content = await fs.readFile(filepath, 'utf8');
      const backup = JSON.parse(content);

      backups.push({
        filename: file,
        deckName: backup.deck.name,
        cardCount: backup.flashcards.length,
        createdAt: backup.createdAt,
        size: stats.size,
        sizeFormatted: formatBytes(stats.size),
      });
    } catch (error) {
      console.error(`Error reading backup ${file}:`, error);
    }
  }

  // Sort by creation date (newest first)
  backups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return backups;
};

/**
 * Delete a backup file
 * @param {String} filename - Backup filename
 * @returns {Promise<Object>} Delete result
 */
const deleteBackup = async (filename) => {
  const filepath = path.join(BACKUP_DIR, filename);

  try {
    await fs.access(filepath);
    await fs.unlink(filepath);
    return {
      success: true,
      message: 'Đã xóa backup thành công',
    };
  } catch (error) {
    throw new Error('Không tìm thấy file backup');
  }
};

/**
 * Get backup file details
 * @param {String} filename - Backup filename
 * @returns {Promise<Object>} Backup details
 */
const getBackupDetails = async (filename) => {
  const filepath = path.join(BACKUP_DIR, filename);

  try {
    const content = await fs.readFile(filepath, 'utf8');
    const backup = JSON.parse(content);
    const stats = await fs.stat(filepath);

    return {
      filename,
      version: backup.version,
      deck: backup.deck,
      stats: {
        ...backup.stats,
        fileSize: stats.size,
        fileSizeFormatted: formatBytes(stats.size),
      },
      createdAt: backup.createdAt,
      hasProgress: backup.progress && backup.progress.length > 0,
    };
  } catch (error) {
    throw new Error(`Không thể đọc backup: ${error.message}`);
  }
};

/**
 * Download backup file
 * @param {String} filename - Backup filename
 * @returns {Promise<String>} File path
 */
const getBackupFilePath = (filename) => {
  return path.join(BACKUP_DIR, filename);
};

/**
 * Helper: Format bytes to human-readable size
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Auto-backup: Create scheduled backups for active decks
 * @param {String} userId - User ID
 * @param {Number} maxBackups - Maximum backups per deck (default: 5)
 * @returns {Promise<Object>} Backup results
 */
const autoBackupUserDecks = async (userId, maxBackups = 5) => {
  const decks = await Deck.find({ createdBy: userId }).limit(10); // Limit for safety
  const results = [];

  for (const deck of decks) {
    try {
      const backupInfo = await backupDeck(deck._id.toString(), userId.toString());
      results.push({
        deckId: deck._id,
        deckName: deck.name,
        success: true,
        filename: backupInfo.filename,
      });
    } catch (error) {
      results.push({
        deckId: deck._id,
        deckName: deck.name,
        success: false,
        error: error.message,
      });
    }
  }

  // Cleanup old backups (keep only last N backups per deck)
  await cleanupOldBackups(maxBackups);

  return {
    totalDecks: decks.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results,
  };
};

/**
 * Cleanup old backups (keep only most recent N per deck)
 * @param {Number} keepCount - Number of backups to keep per deck
 */
const cleanupOldBackups = async (keepCount = 5) => {
  const backups = await listBackups();
  const backupsByDeck = {};

  // Group by deck name
  backups.forEach(backup => {
    if (!backupsByDeck[backup.deckName]) {
      backupsByDeck[backup.deckName] = [];
    }
    backupsByDeck[backup.deckName].push(backup);
  });

  // Delete old backups
  for (const [deckName, deckBackups] of Object.entries(backupsByDeck)) {
    if (deckBackups.length > keepCount) {
      const toDelete = deckBackups.slice(keepCount);
      for (const backup of toDelete) {
        await deleteBackup(backup.filename);
      }
    }
  }
};

module.exports = {
  backupDeck,
  restoreDeck,
  listBackups,
  deleteBackup,
  getBackupDetails,
  getBackupFilePath,
  autoBackupUserDecks,
  cleanupOldBackups,
};
