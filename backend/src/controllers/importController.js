const {
  parseCSV,
  parseTSV,
  detectColumnMapping,
  validateImportData,
  checkDuplicates,
  batchImportFlashcards,
} = require('../services/importService');
const {
  importFromGoogleSheets,
  getSpreadsheetMetadata,
  validateGoogleSheetsUrl,
} = require('../services/googleSheetsService');

/**
 * @route   POST /api/import/csv/preview
 * @desc    Preview CSV import (first 10 rows + column mapping)
 * @access  Private
 */
exports.previewCSVImport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng upload file CSV',
      });
    }

    // Parse CSV
    const { data, errors, totalRows } = await parseCSV(req.file.buffer);

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'File CSV rỗng hoặc không hợp lệ',
        errors,
      });
    }

    // Detect column mapping
    const headers = Object.keys(data[0]).filter(k => k !== '_rowNumber');
    const { mapping, unmappedColumns } = detectColumnMapping(headers);

    // Preview first 10 rows
    const preview = data.slice(0, 10);

    res.json({
      success: true,
      totalRows,
      previewRows: preview.length,
      headers,
      columnMapping: mapping,
      unmappedColumns,
      preview,
      warnings: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Preview CSV error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xử lý file CSV',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/import/tsv/preview
 * @desc    Preview TSV import
 * @access  Private
 */
exports.previewTSVImport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng upload file TSV',
      });
    }

    const { data, errors, totalRows } = await parseTSV(req.file.buffer);

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'File TSV rỗng hoặc không hợp lệ',
        errors,
      });
    }

    const headers = Object.keys(data[0]).filter(k => k !== '_rowNumber');
    const { mapping, unmappedColumns } = detectColumnMapping(headers);
    const preview = data.slice(0, 10);

    res.json({
      success: true,
      totalRows,
      previewRows: preview.length,
      headers,
      columnMapping: mapping,
      unmappedColumns,
      preview,
      warnings: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Preview TSV error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xử lý file TSV',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/import/csv/:deckId
 * @desc    Import flashcards from CSV
 * @access  Private
 */
exports.importFromCSV = async (req, res) => {
  try {
    const { deckId } = req.params;
    const { onDuplicate = 'skip', columnMapping } = req.body; // Custom column mapping optional

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng upload file CSV',
      });
    }

    // Step 1: Parse CSV
    const { data, errors } = await parseCSV(req.file.buffer);

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'File CSV rỗng',
        errors,
      });
    }

    // Step 2: Detect or use provided column mapping
    const headers = Object.keys(data[0]).filter(k => k !== '_rowNumber');
    const mapping = columnMapping || detectColumnMapping(headers).mapping;

    // Step 3: Validate data
    const validation = validateImportData(data, mapping);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: validation.errors,
        warnings: validation.warnings,
        stats: validation.stats,
      });
    }

    // Step 4: Check for duplicates
    const duplicateCheck = await checkDuplicates(deckId, validation.validRows);

    // Step 5: Import flashcards
    const importResult = await batchImportFlashcards(
      deckId,
      validation.validRows,
      {
        onDuplicate,
        userId: req.user._id,
      }
    );

    res.json({
      success: true,
      message: 'Import thành công',
      stats: importResult.stats,
      duplicates: duplicateCheck.stats,
      warnings: validation.warnings,
    });
  } catch (error) {
    console.error('Import CSV error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi import CSV',
    });
  }
};

/**
 * @route   POST /api/import/tsv/:deckId
 * @desc    Import flashcards from TSV
 * @access  Private
 */
exports.importFromTSV = async (req, res) => {
  try {
    const { deckId } = req.params;
    const { onDuplicate = 'skip', columnMapping } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng upload file TSV',
      });
    }

    const { data, errors } = await parseTSV(req.file.buffer);

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'File TSV rỗng',
        errors,
      });
    }

    const headers = Object.keys(data[0]).filter(k => k !== '_rowNumber');
    const mapping = columnMapping || detectColumnMapping(headers).mapping;

    const validation = validateImportData(data, mapping);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: validation.errors,
        warnings: validation.warnings,
        stats: validation.stats,
      });
    }

    const duplicateCheck = await checkDuplicates(deckId, validation.validRows);

    const importResult = await batchImportFlashcards(
      deckId,
      validation.validRows,
      {
        onDuplicate,
        userId: req.user._id,
      }
    );

    res.json({
      success: true,
      message: 'Import thành công',
      stats: importResult.stats,
      duplicates: duplicateCheck.stats,
      warnings: validation.warnings,
    });
  } catch (error) {
    console.error('Import TSV error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi import TSV',
    });
  }
};

/**
 * @route   POST /api/import/google-sheets/preview
 * @desc    Preview Google Sheets import
 * @access  Private
 */
exports.previewGoogleSheetsImport = async (req, res) => {
  try {
    const { spreadsheetUrl, range = 'Sheet1' } = req.body;

    if (!spreadsheetUrl) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp Google Sheets URL',
      });
    }

    // Validate URL
    const urlValidation = validateGoogleSheetsUrl(spreadsheetUrl);
    if (!urlValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'URL Google Sheets không hợp lệ',
        error: urlValidation.error,
      });
    }

    // Import from Google Sheets
    const result = await importFromGoogleSheets(spreadsheetUrl, range);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Không thể đọc Google Sheets',
        error: result.error,
      });
    }

    // Preview first 10 rows
    const preview = result.flashcards.slice(0, 10);

    res.json({
      success: true,
      totalRows: result.stats.totalRows,
      validCards: result.stats.validCards,
      invalidCards: result.stats.invalidCards,
      columnMapping: result.columnMapping,
      unmappedColumns: result.unmappedColumns,
      preview,
    });
  } catch (error) {
    console.error('Preview Google Sheets error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đọc Google Sheets',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/import/google-sheets/:deckId
 * @desc    Import flashcards from Google Sheets
 * @access  Private
 */
exports.importFromGoogleSheetsController = async (req, res) => {
  try {
    const { deckId } = req.params;
    const { spreadsheetUrl, range = 'Sheet1', onDuplicate = 'skip' } = req.body;

    if (!spreadsheetUrl) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp Google Sheets URL',
      });
    }

    // Import from Google Sheets
    const result = await importFromGoogleSheets(spreadsheetUrl, range);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Không thể đọc Google Sheets',
        error: result.error,
      });
    }

    // Check for duplicates
    const duplicateCheck = await checkDuplicates(deckId, result.flashcards);

    // Import flashcards
    const importResult = await batchImportFlashcards(
      deckId,
      result.flashcards,
      {
        onDuplicate,
        userId: req.user._id,
      }
    );

    res.json({
      success: true,
      message: 'Import từ Google Sheets thành công',
      stats: importResult.stats,
      duplicates: duplicateCheck.stats,
      unmappedColumns: result.unmappedColumns,
    });
  } catch (error) {
    console.error('Import Google Sheets error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi import từ Google Sheets',
    });
  }
};

/**
 * @route   GET /api/import/google-sheets/metadata
 * @desc    Get Google Sheets metadata (sheet names, etc.)
 * @access  Private
 */
exports.getGoogleSheetsMetadata = async (req, res) => {
  try {
    const { spreadsheetUrl } = req.query;

    if (!spreadsheetUrl) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp Google Sheets URL',
      });
    }

    const metadata = await getSpreadsheetMetadata(spreadsheetUrl);

    res.json({
      success: true,
      metadata,
    });
  } catch (error) {
    console.error('Get metadata error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy metadata của Google Sheets',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/import/validate
 * @desc    Validate import data before actual import
 * @access  Private
 */
exports.validateImport = async (req, res) => {
  try {
    const { data, columnMapping } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
      });
    }

    const validation = validateImportData(data, columnMapping);

    res.json({
      success: validation.isValid,
      validation,
    });
  } catch (error) {
    console.error('Validate import error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi validate dữ liệu',
      error: error.message,
    });
  }
};
