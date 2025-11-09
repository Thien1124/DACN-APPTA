const { google } = require('googleapis');
const { detectColumnMapping, transformRowToFlashcard } = require('./importService');

/**
 * Google Sheets Service
 * Requires GOOGLE_SHEETS_CREDENTIALS in .env (service account JSON)
 */

/**
 * Initialize Google Sheets API client
 * @returns {Object} Sheets API client
 */
const getGoogleSheetsClient = () => {
  try {
    // Option 1: Service Account (for backend automation)
    if (process.env.GOOGLE_SHEETS_CREDENTIALS) {
      const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });
      return google.sheets({ version: 'v4', auth });
    }

    // Option 2: API Key (public sheets only)
    if (process.env.GOOGLE_SHEETS_API_KEY) {
      return google.sheets({
        version: 'v4',
        auth: process.env.GOOGLE_SHEETS_API_KEY,
      });
    }

    throw new Error('Google Sheets credentials not configured');
  } catch (error) {
    throw new Error(`Failed to initialize Google Sheets client: ${error.message}`);
  }
};

/**
 * Extract spreadsheet ID from Google Sheets URL
 * @param {String} url - Google Sheets URL
 * @returns {String} Spreadsheet ID
 */
const extractSpreadsheetId = (url) => {
  const patterns = [
    /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
    /^([a-zA-Z0-9-_]+)$/, // Plain ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  throw new Error('Invalid Google Sheets URL or ID');
};

/**
 * Fetch data from Google Sheets
 * @param {String} spreadsheetId - Spreadsheet ID or URL
 * @param {String} range - Sheet range (e.g., "Sheet1!A1:Z1000" or "Sheet1")
 * @returns {Promise<Object>} Sheet data
 */
const fetchSheetData = async (spreadsheetId, range = 'Sheet1') => {
  try {
    const sheets = getGoogleSheetsClient();
    const id = extractSpreadsheetId(spreadsheetId);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: id,
      range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error('Sheet không có dữ liệu');
    }

    return {
      headers: rows[0],
      data: rows.slice(1),
      totalRows: rows.length - 1,
    };
  } catch (error) {
    if (error.code === 404) {
      throw new Error('Không tìm thấy Google Sheet. Kiểm tra URL và quyền truy cập.');
    }
    if (error.code === 403) {
      throw new Error('Không có quyền truy cập Google Sheet. Sheet phải được chia sẻ công khai hoặc với service account.');
    }
    throw new Error(`Lỗi khi đọc Google Sheet: ${error.message}`);
  }
};

/**
 * Convert Google Sheets data to flashcard format
 * @param {Object} sheetData - Data from fetchSheetData
 * @returns {Object} Parsed flashcard data with column mapping
 */
const convertSheetToFlashcards = (sheetData) => {
  const { headers, data } = sheetData;

  // Auto-detect column mapping
  const { mapping, unmappedColumns } = detectColumnMapping(headers);

  // Transform rows to flashcards
  const flashcards = data
    .map((row, index) => {
      // Convert array row to object using headers
      const rowObject = {};
      headers.forEach((header, i) => {
        rowObject[header] = row[i] || '';
      });

      const flashcardData = transformRowToFlashcard(rowObject, mapping);
      return {
        ...flashcardData,
        _rowNumber: index + 2, // +2 because header is row 1
      };
    })
    .filter(card => card.front && card.back); // Filter out invalid rows

  return {
    flashcards,
    columnMapping: mapping,
    unmappedColumns,
    stats: {
      totalRows: data.length,
      validCards: flashcards.length,
      invalidCards: data.length - flashcards.length,
    },
  };
};

/**
 * Import flashcards from Google Sheets (full pipeline)
 * @param {String} spreadsheetUrl - Google Sheets URL or ID
 * @param {String} range - Sheet range
 * @returns {Promise<Object>} Converted flashcard data
 */
const importFromGoogleSheets = async (spreadsheetUrl, range = 'Sheet1') => {
  try {
    // Step 1: Fetch data from Google Sheets
    const sheetData = await fetchSheetData(spreadsheetUrl, range);

    // Step 2: Convert to flashcard format
    const result = convertSheetToFlashcards(sheetData);

    return {
      success: true,
      ...result,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get sheet metadata (title, sheet names)
 * @param {String} spreadsheetId - Spreadsheet ID or URL
 * @returns {Promise<Object>} Spreadsheet metadata
 */
const getSpreadsheetMetadata = async (spreadsheetId) => {
  try {
    const sheets = getGoogleSheetsClient();
    const id = extractSpreadsheetId(spreadsheetId);

    const response = await sheets.spreadsheets.get({
      spreadsheetId: id,
    });

    const { title, sheets: sheetList } = response.data.properties || response.data;

    return {
      title: title || 'Untitled',
      sheets: (sheetList || []).map(sheet => ({
        title: sheet.properties.title,
        sheetId: sheet.properties.sheetId,
        rowCount: sheet.properties.gridProperties.rowCount,
        columnCount: sheet.properties.gridProperties.columnCount,
      })),
    };
  } catch (error) {
    throw new Error(`Failed to get spreadsheet metadata: ${error.message}`);
  }
};

/**
 * Validate Google Sheets URL/ID
 * @param {String} url - URL or ID to validate
 * @returns {Object} Validation result
 */
const validateGoogleSheetsUrl = (url) => {
  try {
    const id = extractSpreadsheetId(url);
    return {
      isValid: true,
      spreadsheetId: id,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error.message,
    };
  }
};

module.exports = {
  fetchSheetData,
  convertSheetToFlashcards,
  importFromGoogleSheets,
  getSpreadsheetMetadata,
  extractSpreadsheetId,
  validateGoogleSheetsUrl,
};
