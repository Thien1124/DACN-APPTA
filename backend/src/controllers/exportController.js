const {
  exportDeckToCSV,
  exportDeckToTSV,
  getDeckExportStats,
  exportToAnkiFormat,
  exportDeckStatistics,
} = require('../services/exportService');
const {
  backupDeck,
  restoreDeck,
  listBackups,
  deleteBackup,
  getBackupDetails,
  getBackupFilePath,
} = require('../services/backupService');
const Deck = require('../models/Deck');

/**
 * @route   GET /api/export/csv/:deckId
 * @desc    Export deck to CSV format
 * @access  Private
 */
exports.exportDeckCSV = async (req, res) => {
  try {
    const { deckId } = req.params;
    const {
      includeStats = false,
      includeMetadata = true,
      tags,
      status,
    } = req.query;

    // Verify deck ownership
    const deck = await Deck.findById(deckId);
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck không tồn tại',
      });
    }
    if (deck.createdBy.toString() !== req.user._id.toString() && !deck.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền export deck này',
      });
    }

    // Generate CSV
     ('[Export CSV Controller] Generating CSV with options:', {
      includeStats: includeStats === 'true',
      includeMetadata: includeMetadata === 'true',
      tags: tags ? tags.split(',') : null,
      status,
      deckId,
    });

    const csv = await exportDeckToCSV(deckId, {
      includeStats: includeStats === 'true',
      includeMetadata: includeMetadata === 'true',
      tags: tags ? tags.split(',') : null,
      status: status || null, // Ensure null if not provided
    });

    // Send as downloadable file
    const deckName = deck.name || deck.title || 'deck';
    const filename = `${deckName.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi export CSV',
    });
  }
};

/**
 * @route   GET /api/export/tsv/:deckId
 * @desc    Export deck to TSV format
 * @access  Private
 */
exports.exportDeckTSV = async (req, res) => {
  try {
    const { deckId } = req.params;
    const {
      includeStats = false,
      includeMetadata = true,
      tags,
      status,
    } = req.query;

    const deck = await Deck.findById(deckId);
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck không tồn tại',
      });
    }
    if (deck.createdBy.toString() !== req.user._id.toString() && !deck.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền export deck này',
      });
    }

    const tsv = await exportDeckToTSV(deckId, {
      includeStats: includeStats === 'true',
      includeMetadata: includeMetadata === 'true',
      tags: tags ? tags.split(',') : null,
      status,
    });

    const deckName = deck.name || deck.title || 'deck';
    const filename = `${deckName.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.tsv`;
    res.setHeader('Content-Type', 'text/tab-separated-values; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(tsv);
  } catch (error) {
    console.error('Export TSV error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi export TSV',
    });
  }
};

/**
 * @route   GET /api/export/anki/:deckId
 * @desc    Export deck to Anki-compatible format
 * @access  Private
 */
exports.exportToAnki = async (req, res) => {
  try {
    const { deckId } = req.params;

    const deck = await Deck.findById(deckId);
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck không tồn tại',
      });
    }
    if (deck.createdBy.toString() !== req.user._id.toString() && !deck.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền export deck này',
      });
    }

    const ankiCSV = await exportToAnkiFormat(deckId);

    const deckName = deck.name || deck.title || 'deck';
    const filename = `${deckName.replace(/[^a-z0-9]/gi, '_')}_anki_${Date.now()}.txt`;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(ankiCSV);
  } catch (error) {
    console.error('Export Anki error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi export Anki format',
    });
  }
};

/**
 * @route   GET /api/export/stats/:deckId
 * @desc    Get deck export statistics
 * @access  Private
 */
exports.getExportStats = async (req, res) => {
  try {
    const { deckId } = req.params;

    const deck = await Deck.findById(deckId);
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck không tồn tại',
      });
    }

    const stats = await getDeckExportStats(deckId);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Get export stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy thống kê',
    });
  }
};

/**
 * @route   POST /api/export/backup/:deckId
 * @desc    Create full backup of deck
 * @access  Private
 */
exports.backupDeck = async (req, res) => {
  try {
    const { deckId } = req.params;

    const backupInfo = await backupDeck(deckId, req.user._id.toString());

    res.json({
      success: true,
      message: 'Backup thành công',
      backup: backupInfo,
    });
  } catch (error) {
    console.error('Backup deck error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi backup deck',
    });
  }
};

/**
 * @route   POST /api/export/restore
 * @desc    Restore deck from backup
 * @access  Private
 */
exports.restoreDeck = async (req, res) => {
  try {
    const { filename, overwriteExisting = false, restoreProgress = true, newDeckName } = req.body;

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp tên file backup',
      });
    }

    const restoreResult = await restoreDeck(filename, req.user._id.toString(), {
      overwriteExisting,
      restoreProgress,
      newDeckName,
    });

    res.json({
      success: true,
      message: 'Restore thành công',
      result: restoreResult,
    });
  } catch (error) {
    console.error('Restore deck error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi restore deck',
    });
  }
};

/**
 * @route   GET /api/export/backups
 * @desc    List all backups
 * @access  Private
 */
exports.listBackups = async (req, res) => {
  try {
    const backups = await listBackups(req.user._id.toString());

    res.json({
      success: true,
      count: backups.length,
      backups,
    });
  } catch (error) {
    console.error('List backups error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách backup',
    });
  }
};

/**
 * @route   GET /api/export/backup/:filename
 * @desc    Get backup details
 * @access  Private
 */
exports.getBackupDetails = async (req, res) => {
  try {
    const { filename } = req.params;

    const details = await getBackupDetails(filename);

    res.json({
      success: true,
      backup: details,
    });
  } catch (error) {
    console.error('Get backup details error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy chi tiết backup',
    });
  }
};

/**
 * @route   GET /api/export/backup/download/:filename
 * @desc    Download backup file
 * @access  Private
 */
exports.downloadBackup = async (req, res) => {
  try {
    const { filename } = req.params;

    const filepath = getBackupFilePath(filename);

    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('Download backup error:', err);
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy file backup',
        });
      }
    });
  } catch (error) {
    console.error('Download backup error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi tải backup',
    });
  }
};

/**
 * @route   DELETE /api/export/backup/:filename
 * @desc    Delete backup file
 * @access  Private
 */
exports.deleteBackup = async (req, res) => {
  try {
    const { filename } = req.params;

    const result = await deleteBackup(filename);

    res.json(result);
  } catch (error) {
    console.error('Delete backup error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xóa backup',
    });
  }
};

/**
 * @route   GET /api/export/statistics/:deckId
 * @desc    Export detailed deck statistics as JSON
 * @access  Private
 */
exports.exportStatistics = async (req, res) => {
  try {
    const { deckId } = req.params;

    const deck = await Deck.findById(deckId);
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck không tồn tại',
      });
    }

    const stats = await exportDeckStatistics(deckId, req.user._id.toString());

    // Option 1: Return as JSON
    if (req.query.format === 'json') {
      return res.json({
        success: true,
        statistics: stats,
      });
    }

    // Option 2: Download as JSON file
    const deckName = deck.name || deck.title || 'deck';
    const filename = `${deckName.replace(/[^a-z0-9]/gi, '_')}_stats_${Date.now()}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(JSON.stringify(stats, null, 2));
  } catch (error) {
    console.error('Export statistics error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi export thống kê',
    });
  }
};
