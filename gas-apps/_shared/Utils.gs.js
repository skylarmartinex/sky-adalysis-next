// ============================================================
// SHARED UTILITIES — Used by all Adalysis GAS Mini-Apps
// Copy this file into each mini-app's Apps Script project
// ============================================================

/**
 * Config — set these per-app or via PropertiesService
 */
var CONFIG = {
    DATA_LAKE_ID: '',  // Set via setDataLakeId() or PropertiesService
};

// ---- Setup ----

function setDataLakeId(id) {
    PropertiesService.getScriptProperties().setProperty('DATA_LAKE_ID', id);
    SpreadsheetApp.getUi().alert('Data Lake ID saved: ' + id);
}

function getDataLakeId() {
    return PropertiesService.getScriptProperties().getProperty('DATA_LAKE_ID') || CONFIG.DATA_LAKE_ID;
}

// ---- Data Fetching ----

/**
 * Read a tab from the Data Lake sheet. Returns 2D array (header row + data).
 * @param {string} tabName - e.g. "Campaigns", "SearchTerms", "Keywords"
 * @returns {Array[]} 2D array of values
 */
function getDataLakeTab(tabName) {
    var id = getDataLakeId();
    if (!id) throw new Error('Data Lake ID not set. Run Setup > Set Data Lake Sheet ID.');
    var ss = SpreadsheetApp.openById(id);
    var sheet = ss.getSheetByName(tabName);
    if (!sheet) throw new Error('Tab "' + tabName + '" not found in Data Lake.');
    return sheet.getDataRange().getValues();
}

/**
 * Parse a 2D array (header + rows) into array of objects.
 * @param {Array[]} data - from getDataLakeTab()
 * @returns {Object[]}
 */
function parseTable(data) {
    if (data.length < 2) return [];
    var headers = data[0].map(function (h) { return String(h).trim(); });
    var result = [];
    for (var i = 1; i < data.length; i++) {
        var row = data[i];
        // Skip empty rows
        if (!row[0] && !row[1]) continue;
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
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
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

/**
 * Calculate percentage delta between current and previous values.
 */
function pctDelta(cur, prev) {
    if (prev === 0) return 0;
    return ((cur - prev) / prev) * 100;
}

/**
 * Format a delta with arrow and percentage.
 * @param {number} delta - percentage change
 * @param {boolean} invertColor - true for metrics where up=bad (CPA, CPC)
 */
function fmtDelta(delta, invertColor) {
    if (delta === 0) return { text: '—', color: '#94a3b8' };
    var arrow = delta > 0 ? '↑' : '↓';
    var text = arrow + Math.abs(delta).toFixed(1) + '%';
    var isPositive = delta > 0;
    if (invertColor) isPositive = !isPositive;
    var color = isPositive ? '#22c55e' : '#ef4444';
    return { text: text, color: color };
}

/**
 * Get today and N days ago as date strings (YYYY-MM-DD).
 */
function getDateRange(days) {
    var now = new Date();
    var start = new Date(now);
    start.setDate(start.getDate() - days);
    return {
        start: Utilities.formatDate(start, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
        end: Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
    };
}

// ---- Sheet Helpers ----

/**
 * Get or create a sheet tab by name.
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
