// ============================================================
// SHARED UTILITIES — Used by all Adalysis GAS Mini-Apps
// Copy this file into each mini-app's Apps Script project
// ============================================================

// ---- Your Google Sheet IDs ----
// These are your existing automated sheets that get populated daily.
// Each mini-app only needs the sheet(s) it uses.

var SHEET_IDS = {
    CAMPAIGNS: '1ngxoTvo11Og9w71zWJdBdEikVTeokIEQgeUUQjHBWsM',
    KEYWORDS: '1vUc7bOmU-_MKctbqYQ0Zm28x_bQ_LGoKEW2mbzdTOBc',
    SEARCH_TERMS: '1YNhDFgtak0Yf00mq849GvtIA3E3h74iPHX99toIJA0w',
};

// ---- Data Fetching ----

/**
 * Read data from one of your existing automated sheets.
 * @param {'CAMPAIGNS'|'KEYWORDS'|'SEARCH_TERMS'} sheetKey - which sheet to read
 * @param {string} [tabName] - optional tab name. If omitted, reads the first tab.
 * @returns {Array[]} 2D array of values (header row + data)
 */
function getSheetData(sheetKey, tabName) {
    var id = SHEET_IDS[sheetKey];
    if (!id) throw new Error('Unknown sheet key: ' + sheetKey + '. Valid: CAMPAIGNS, KEYWORDS, SEARCH_TERMS');

    var ss = SpreadsheetApp.openById(id);
    var sheet;

    if (tabName) {
        sheet = ss.getSheetByName(tabName);
        if (!sheet) throw new Error('Tab "' + tabName + '" not found in ' + sheetKey + ' sheet.');
    } else {
        // Auto-detect: use the first sheet
        sheet = ss.getSheets()[0];
    }

    return sheet.getDataRange().getValues();
}

/**
 * Parse a 2D array (header + rows) into array of objects.
 * @param {Array[]} data - from getSheetData()
 * @returns {Object[]}
 */
function parseTable(data) {
    if (data.length < 2) return [];
    var headers = data[0].map(function (h) { return String(h).trim(); });
    var result = [];
    for (var i = 1; i < data.length; i++) {
        var row = data[i];
        if (!row[0] && !row[1]) continue; // skip empty rows
        var obj = {};
        for (var j = 0; j < headers.length; j++) {
            obj[headers[j]] = row[j];
        }
        result.push(obj);
    }
    return result;
}

// ---- Number Parsing ----

/**
 * Parse a number from a cell value (handles "$1,234", "12.5%", commas, etc.)
 */
function parseNum(val) {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    var s = String(val).replace(/[$,%]/g, '').replace(/,/g, '').trim();
    var n = parseFloat(s);
    return isNaN(n) ? 0 : n;
}

/**
 * Parse a percentage (e.g. "45.2%" → 45.2)
 */
function parsePct(val) {
    return parseNum(val);
}

// ---- Formatting ----

function fmtUsd(n) {
    if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'k';
    return '$' + n.toFixed(0);
}

function fmtUsdFull(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
}

function fmtNum(n) {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return String(Math.round(n));
}

function fmtPct(n) {
    return n.toFixed(1) + '%';
}

function fmtRoas(n) {
    return n.toFixed(2) + 'x';
}

function fmtDec2(n) {
    return n.toFixed(2);
}

// ---- Period Helpers ----

function pctDelta(cur, prev) {
    if (prev === 0) return 0;
    return ((cur - prev) / prev) * 100;
}

function fmtDelta(delta, invertColor) {
    if (delta === 0) return { text: '—', color: '#94a3b8' };
    var arrow = delta > 0 ? '↑' : '↓';
    var text = arrow + Math.abs(delta).toFixed(1) + '%';
    var isPositive = delta > 0;
    if (invertColor) isPositive = !isPositive;
    var color = isPositive ? '#22c55e' : '#ef4444';
    return { text: text, color: color };
}

// ---- Sheet Helpers ----

/**
 * Get or create a sheet tab by name in the ACTIVE spreadsheet.
 */
function getOrCreateSheet(ss, name) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
        sheet = ss.insertSheet(name);
    }
    return sheet;
}

/**
 * Clear a sheet and write a 2D array to it.
 */
function writeTable(sheet, data) {
    sheet.clearContents();
    if (data.length > 0 && data[0].length > 0) {
        sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
    }
}

/**
 * Apply header formatting to row 1 of a sheet.
 */
function formatHeaderRow(sheet) {
    var lastCol = sheet.getLastColumn();
    if (lastCol < 1) return;
    var headerRange = sheet.getRange(1, 1, 1, lastCol);
    headerRange
        .setBackground('#1e293b')
        .setFontColor('#e2e8f0')
        .setFontWeight('bold')
        .setFontSize(10);
    sheet.setFrozenRows(1);
}

/**
 * Auto-resize all columns in a sheet.
 */
function autoResize(sheet) {
    var lastCol = sheet.getLastColumn();
    for (var i = 1; i <= lastCol; i++) {
        sheet.autoResizeColumn(i);
    }
}
