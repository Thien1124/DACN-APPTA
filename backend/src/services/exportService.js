const Flashcard = require('../models/Flashcard');
const Deck = require('../models/Deck');
const StudyProgress = require('../models/StudyProgress');
const { stringify } = require('csv-stringify/sync');

/**
 * Export deck flashcards to CSV format
 * @param {String} deckId - Deck ID
 * @param {Object} options - Export options
 * @returns {Promise<String>} CSV string
 */
const exportDeckToCSV = async (deckId, options = {}) => {
  const {
    includeStats = false,
    includeMetadata = true,
    tags = null, // Filter by tags
    status = null, // Filter by status (active/suspended/buried)
  } = options;

  // Build query
  const query = { deck: deckId };
  if (tags) {
    query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
  }
  if (status) {
    query.status = status;
  }

  // Fetch flashcards
  const flashcards = await Flashcard.find(query)
    .sort({ createdAt: 1 })
    .lean();

   (`[Export CSV] Found ${flashcards.length} flashcards for deck ${deckId}`);
   (`[Export CSV] Query:`, JSON.stringify(query));

  if (flashcards.length === 0) {
    throw new Error(`Không có thẻ nào để export (tìm thấy 0 thẻ với filter: tags=${tags}, status=${status})`);
  }

  // Define columns
  const columns = [
    'front',
    'back',
    'pronunciation',
    'partOfSpeech',
    'level',
    'example',
    'image',
    'audio',
    'tags',
    'notes',
  ];

  if (includeMetadata) {
    columns.push('status', 'isLeech', 'failCount', 'createdAt');
  }

  if (includeStats) {
    columns.push('reviewCount', 'correctCount', 'ease', 'interval', 'nextReview');
  }

  // Transform data
  const data = await Promise.all(flashcards.map(async (card) => {
    const row = {
      front: card.front || '',
      back: card.back || '',
      pronunciation: card.pronunciation || '',
      partOfSpeech: card.partOfSpeech || '',
      level: card.level || '',
      example: card.example || '',
      image: card.imageUrl || '',
      audio: card.audioUrl || '',
      tags: (card.tags || []).join(', '),
      notes: card.notes || '',
    };

    if (includeMetadata) {
      row.status = card.status || 'active';
      row.isLeech = card.isLeech ? 'Yes' : 'No';
      row.failCount = card.failCount || 0;
      row.createdAt = card.createdAt ? new Date(card.createdAt).toISOString() : '';
    }

    if (includeStats) {
      const progress = await StudyProgress.findOne({
        user: card.createdBy,
        flashcard: card._id,
      }).lean();

      row.reviewCount = progress?.reviewCount || 0;
      row.correctCount = progress?.correctCount || 0;
      row.ease = progress?.ease || 2.5;
      row.interval = progress?.interval || 0;
      row.nextReview = progress?.nextReview ? new Date(progress.nextReview).toISOString() : '';
    }

    return row;
  }));

  // Convert to CSV
  const csv = stringify(data, {
    header: true,
    columns,
    quoted: true,
    quoted_empty: true,
  });

  return csv;
};

/**
 * Export deck flashcards to TSV format
 * @param {String} deckId - Deck ID
 * @param {Object} options - Export options
 * @returns {Promise<String>} TSV string
 */
const exportDeckToTSV = async (deckId, options = {}) => {
  const csv = await exportDeckToCSV(deckId, options);
  // Convert CSV to TSV by replacing commas with tabs
  // Note: This is simplified; proper implementation should use csv-stringify with delimiter option
  const { stringify } = require('csv-stringify/sync');
  
  // Re-fetch and convert with tab delimiter
  const { includeStats = false, includeMetadata = true, tags = null, status = null } = options;
  const query = { deck: deckId };
  if (tags) query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
  if (status) query.status = status;

  const flashcards = await Flashcard.find(query).sort({ createdAt: 1 }).lean();

  const columns = [
    'front', 'back', 'pronunciation', 'partOfSpeech', 'level', 
    'example', 'image', 'audio', 'tags', 'notes',
  ];
  if (includeMetadata) columns.push('status', 'isLeech', 'failCount', 'createdAt');
  if (includeStats) columns.push('reviewCount', 'correctCount', 'ease', 'interval', 'nextReview');

  const data = await Promise.all(flashcards.map(async (card) => {
    const row = {
      front: card.front || '',
      back: card.back || '',
      pronunciation: card.pronunciation || '',
      partOfSpeech: card.partOfSpeech || '',
      level: card.level || '',
      example: card.example || '',
      image: card.imageUrl || '',
      audio: card.audioUrl || '',
      tags: (card.tags || []).join(', '),
      notes: card.notes || '',
    };

    if (includeMetadata) {
      row.status = card.status || 'active';
      row.isLeech = card.isLeech ? 'Yes' : 'No';
      row.failCount = card.failCount || 0;
      row.createdAt = card.createdAt ? new Date(card.createdAt).toISOString() : '';
    }

    if (includeStats) {
      const progress = await StudyProgress.findOne({
        user: card.createdBy,
        flashcard: card._id,
      }).lean();

      row.reviewCount = progress?.reviewCount || 0;
      row.correctCount = progress?.correctCount || 0;
      row.ease = progress?.ease || 2.5;
      row.interval = progress?.interval || 0;
      row.nextReview = progress?.nextReview ? new Date(progress.nextReview).toISOString() : '';
    }

    return row;
  }));

  const tsv = stringify(data, {
    header: true,
    columns,
    delimiter: '\t',
    quoted: false,
  });

  return tsv;
};

/**
 * Get deck export statistics
 * @param {String} deckId - Deck ID
 * @returns {Promise<Object>} Export stats
 */
const getDeckExportStats = async (deckId) => {
  const deck = await Deck.findById(deckId);
  if (!deck) {
    throw new Error('Deck không tồn tại');
  }

  const totalCards = await Flashcard.countDocuments({ deck: deckId });
  const activeCards = await Flashcard.countDocuments({ deck: deckId, status: 'active' });
  const suspendedCards = await Flashcard.countDocuments({ deck: deckId, status: 'suspended' });
  const buriedCards = await Flashcard.countDocuments({ deck: deckId, status: 'buried' });
  const leechCards = await Flashcard.countDocuments({ deck: deckId, isLeech: true });

  // Get tag distribution
  const tagAggregation = await Flashcard.aggregate([
    { $match: { deck: deck._id } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  return {
    deckName: deck.name,
    totalCards,
    activeCards,
    suspendedCards,
    buriedCards,
    leechCards,
    topTags: tagAggregation.map(t => ({ tag: t._id, count: t.count })),
  };
};

/**
 * Export multiple decks to CSV (combined)
 * @param {Array} deckIds - Array of deck IDs
 * @param {Object} options - Export options
 * @returns {Promise<String>} Combined CSV
 */
const exportMultipleDecks = async (deckIds, options = {}) => {
  const allData = [];

  for (const deckId of deckIds) {
    const csv = await exportDeckToCSV(deckId, { ...options, includeMetadata: true });
    const rows = csv.split('\n').slice(1); // Skip header
    
    const deck = await Deck.findById(deckId).lean();
    rows.forEach(row => {
      if (row.trim()) {
        allData.push(`"${deck.name}",${row}`);
      }
    });
  }

  // Add header with deck column
  const header = 'Deck,front,back,pronunciation,partOfSpeech,level,example,image,audio,tags,notes,status,isLeech,failCount,createdAt';
  
  return [header, ...allData].join('\n');
};

/**
 * Create Anki-compatible export format
 * Anki uses specific column order: front, back, tags
 * @param {String} deckId - Deck ID
 * @returns {Promise<String>} Anki-compatible CSV
 */
const exportToAnkiFormat = async (deckId) => {
  const flashcards = await Flashcard.find({ deck: deckId, status: 'active' })
    .sort({ createdAt: 1 })
    .lean();

  if (flashcards.length === 0) {
    throw new Error('Không có thẻ nào để export');
  }

  const data = flashcards.map(card => ({
    front: card.front || '',
    back: card.back || '',
    tags: (card.tags || []).join(' '), // Anki uses space-separated tags
    example: card.example || '',
    pronunciation: card.pronunciation || '',
  }));

  // Anki format: no header, specific order
  const csv = stringify(data, {
    header: false,
    columns: ['front', 'back', 'tags', 'example', 'pronunciation'],
    quoted: true,
  });

  return csv;
};

/**
 * Export deck statistics as JSON
 * @param {String} deckId - Deck ID
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Detailed statistics
 */
const exportDeckStatistics = async (deckId, userId) => {
  const deck = await Deck.findById(deckId).lean();
  if (!deck) {
    throw new Error('Deck không tồn tại');
  }

  const flashcards = await Flashcard.find({ deck: deckId }).lean();
  const progressData = await StudyProgress.find({
    user: userId,
    flashcard: { $in: flashcards.map(f => f._id) },
  }).lean();

  // Calculate statistics
  const stats = {
    deck: {
      id: deck._id,
      name: deck.name,
      description: deck.description,
      totalCards: flashcards.length,
    },
    cards: {
      active: flashcards.filter(c => c.status === 'active').length,
      suspended: flashcards.filter(c => c.status === 'suspended').length,
      buried: flashcards.filter(c => c.status === 'buried').length,
      leeches: flashcards.filter(c => c.isLeech).length,
    },
    progress: {
      totalReviews: progressData.reduce((sum, p) => sum + (p.reviewCount || 0), 0),
      averageEase: progressData.length > 0
        ? progressData.reduce((sum, p) => sum + (p.ease || 2.5), 0) / progressData.length
        : 2.5,
      masteredCards: progressData.filter(p => p.interval >= 21).length, // 21+ days = mastered
      dueCards: progressData.filter(p => p.nextReview && new Date(p.nextReview) <= new Date()).length,
    },
    tags: {},
    exportedAt: new Date().toISOString(),
  };

  // Tag distribution
  flashcards.forEach(card => {
    (card.tags || []).forEach(tag => {
      stats.tags[tag] = (stats.tags[tag] || 0) + 1;
    });
  });

  return stats;
};

module.exports = {
  exportDeckToCSV,
  exportDeckToTSV,
  getDeckExportStats,
  exportMultipleDecks,
  exportToAnkiFormat,
  exportDeckStatistics,
};
