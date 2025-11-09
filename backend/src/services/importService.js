const csv = require('csv-parser');
const { Readable } = require('stream');
const Flashcard = require('../models/Flashcard');
const Deck = require('../models/Deck');

/**
 * Parse CSV data from buffer
 * @param {Buffer} fileBuffer - CSV file buffer
 * @param {String} delimiter - Delimiter (default: ',')
 * @returns {Promise<Array>} Parsed rows
 */
const parseCSV = (fileBuffer, delimiter = ',') => {
  return new Promise((resolve, reject) => {
    const results = [];
    const errors = [];
    let rowNumber = 0;

    const stream = Readable.from(fileBuffer.toString());
    
    stream
      .pipe(csv({ separator: delimiter, skipEmptyLines: true }))
      .on('data', (data) => {
        rowNumber++;
        try {
          results.push({ ...data, _rowNumber: rowNumber });
        } catch (error) {
          errors.push({ row: rowNumber, error: error.message });
        }
      })
      .on('end', () => {
        if (errors.length > 0) {
          console.warn(`CSV parsing completed with ${errors.length} errors:`, errors);
        }
        resolve({ data: results, errors, totalRows: rowNumber });
      })
      .on('error', (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      });
  });
};

/**
 * Parse TSV data from buffer
 * @param {Buffer} fileBuffer - TSV file buffer
 * @returns {Promise<Array>} Parsed rows
 */
const parseTSV = (fileBuffer) => {
  return parseCSV(fileBuffer, '\t');
};

/**
 * Column mapping configurations
 * Supports flexible column names (English/Vietnamese/custom)
 */
const COLUMN_MAPPINGS = {
  front: ['front', 'question', 'word', 'term', 'từ vựng', 'câu hỏi', 'mặt trước'],
  back: ['back', 'answer', 'definition', 'nghĩa', 'câu trả lời', 'mặt sau', 'định nghĩa'],
  pronunciation: ['pronunciation', 'ipa', 'phiên âm', 'phonetic'],
  partOfSpeech: ['partofspeech', 'pos', 'part_of_speech', 'từ loại', 'loại từ'],
  level: ['level', 'difficulty', 'cefr', 'trình độ', 'độ khó'],
  example: ['example', 'sentence', 'ví dụ', 'câu ví dụ'],
  image: ['image', 'imageurl', 'image_url', 'hình ảnh', 'ảnh'],
  audio: ['audio', 'audiourl', 'audio_url', 'âm thanh'],
  tags: ['tags', 'tag', 'nhãn', 'thẻ'],
  notes: ['notes', 'note', 'hint', 'ghi chú', 'mẹo'],
};

/**
 * Map CSV column to flashcard field
 * Case-insensitive matching with multiple aliases
 */
const mapColumnToField = (columnName) => {
  const normalized = columnName.toLowerCase().trim().replace(/\s+/g, '');
  
  for (const [field, aliases] of Object.entries(COLUMN_MAPPINGS)) {
    if (aliases.some(alias => normalized.includes(alias.replace(/\s+/g, '')))) {
      return field;
    }
  }
  
  return null; // Unknown column
};

/**
 * Detect column mapping from CSV headers
 * @param {Array} headers - CSV column headers
 * @returns {Object} Column mapping { csvColumn: flashcardField }
 */
const detectColumnMapping = (headers) => {
  const mapping = {};
  const unmappedColumns = [];

  headers.forEach(header => {
    const field = mapColumnToField(header);
    if (field) {
      mapping[header] = field;
    } else {
      unmappedColumns.push(header);
    }
  });

  return { mapping, unmappedColumns };
};

/**
 * Transform CSV row to flashcard data using column mapping
 * @param {Object} row - CSV row data
 * @param {Object} columnMapping - Column to field mapping
 * @returns {Object} Flashcard data
 */
const transformRowToFlashcard = (row, columnMapping) => {
  const flashcardData = {};

  Object.entries(row).forEach(([column, value]) => {
    const field = columnMapping[column];
    if (field && value) {
      const trimmedValue = value.toString().trim();
      
      if (field === 'tags') {
        // Split tags by comma or semicolon
        flashcardData[field] = trimmedValue
          .split(/[,;]/)
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);
      } else {
        flashcardData[field] = trimmedValue;
      }
    }
  });

  return flashcardData;
};

/**
 * Validate import data
 * @param {Array} data - Parsed CSV data
 * @param {Object} columnMapping - Column mapping
 * @returns {Object} Validation result
 */
const validateImportData = (data, columnMapping) => {
  const errors = [];
  const warnings = [];
  const validRows = [];

  // Check if required fields are mapped
  const mappedFields = Object.values(columnMapping);
  if (!mappedFields.includes('front')) {
    errors.push({
      type: 'MISSING_REQUIRED_COLUMN',
      message: 'Thiếu cột bắt buộc: front/question/word (mặt trước thẻ)',
    });
  }
  if (!mappedFields.includes('back')) {
    errors.push({
      type: 'MISSING_REQUIRED_COLUMN',
      message: 'Thiếu cột bắt buộc: back/answer/definition (mặt sau thẻ)',
    });
  }

  // Validate each row
  data.forEach((row, index) => {
    const rowErrors = [];
    const flashcardData = transformRowToFlashcard(row, columnMapping);

    // Required fields
    if (!flashcardData.front || flashcardData.front.length === 0) {
      rowErrors.push(`Dòng ${index + 2}: Thiếu nội dung mặt trước (front)`);
    }
    if (!flashcardData.back || flashcardData.back.length === 0) {
      rowErrors.push(`Dòng ${index + 2}: Thiếu nội dung mặt sau (back)`);
    }

    // Field length validation
    if (flashcardData.front && flashcardData.front.length > 500) {
      rowErrors.push(`Dòng ${index + 2}: Mặt trước quá dài (max 500 ký tự)`);
    }
    if (flashcardData.back && flashcardData.back.length > 2000) {
      rowErrors.push(`Dòng ${index + 2}: Mặt sau quá dài (max 2000 ký tự)`);
    }

    // URL validation
    if (flashcardData.image && !isValidURL(flashcardData.image)) {
      warnings.push(`Dòng ${index + 2}: URL hình ảnh không hợp lệ`);
    }
    if (flashcardData.audio && !isValidURL(flashcardData.audio)) {
      warnings.push(`Dòng ${index + 2}: URL audio không hợp lệ`);
    }

    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
    } else {
      validRows.push({ ...flashcardData, _originalRow: row, _rowNumber: index + 2 });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    validRows,
    stats: {
      total: data.length,
      valid: validRows.length,
      invalid: data.length - validRows.length,
    },
  };
};

/**
 * Check for duplicate flashcards in deck
 * @param {String} deckId - Deck ID
 * @param {Array} importData - Import flashcard data
 * @returns {Promise<Object>} Duplicate analysis
 */
const checkDuplicates = async (deckId, importData) => {
  const existingCards = await Flashcard.find({ deck: deckId }).select('front back');
  
  const duplicates = [];
  const newCards = [];

  importData.forEach((card, index) => {
    const isDuplicate = existingCards.some(existing => 
      existing.front.toLowerCase() === card.front.toLowerCase() &&
      existing.back.toLowerCase() === card.back.toLowerCase()
    );

    if (isDuplicate) {
      duplicates.push({ ...card, _index: index });
    } else {
      newCards.push({ ...card, _index: index });
    }
  });

  return {
    duplicates,
    newCards,
    stats: {
      total: importData.length,
      duplicates: duplicates.length,
      new: newCards.length,
    },
  };
};

/**
 * Batch import flashcards to deck
 * @param {String} deckId - Deck ID
 * @param {Array} flashcardData - Validated flashcard data
 * @param {Object} options - Import options
 * @returns {Promise<Object>} Import result
 */
const batchImportFlashcards = async (deckId, flashcardData, options = {}) => {
  const {
    onDuplicate = 'skip', // 'skip' | 'update' | 'create'
    userId,
  } = options;

  // Verify deck exists and user owns it
  const deck = await Deck.findById(deckId);
  if (!deck) {
    throw new Error('Deck không tồn tại');
  }
  if (deck.createdBy.toString() !== userId.toString()) {
    throw new Error('Bạn không có quyền import vào deck này');
  }

  const results = {
    created: [],
    updated: [],
    skipped: [],
    failed: [],
  };

  for (const cardData of flashcardData) {
    try {
      // Check for duplicates
      const existing = await Flashcard.findOne({
        deck: deckId,
        front: cardData.front,
      });

      if (existing) {
        if (onDuplicate === 'skip') {
          results.skipped.push({
            front: cardData.front,
            reason: 'Thẻ đã tồn tại',
          });
          continue;
        } else if (onDuplicate === 'update') {
          Object.assign(existing, cardData);
          existing.updatedAt = new Date();
          await existing.save();
          results.updated.push(existing);
          continue;
        }
        // If 'create', fall through to create new card
      }

      // Create new flashcard
      const newCard = new Flashcard({
        ...cardData,
        deck: deckId,
        createdBy: userId,
        status: 'active', // Default status
      });
      await newCard.save();
      results.created.push(newCard);

    } catch (error) {
      results.failed.push({
        front: cardData.front,
        error: error.message,
      });
    }
  }

  // Update deck card count
  deck.cardCount = await Flashcard.countDocuments({ deck: deckId, status: 'active' });
  await deck.save();

  return {
    success: true,
    stats: {
      created: results.created.length,
      updated: results.updated.length,
      skipped: results.skipped.length,
      failed: results.failed.length,
      total: flashcardData.length,
    },
    results,
  };
};

/**
 * Helper: Validate URL format
 */
const isValidURL = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

module.exports = {
  parseCSV,
  parseTSV,
  detectColumnMapping,
  transformRowToFlashcard,
  validateImportData,
  checkDuplicates,
  batchImportFlashcards,
  COLUMN_MAPPINGS,
};
