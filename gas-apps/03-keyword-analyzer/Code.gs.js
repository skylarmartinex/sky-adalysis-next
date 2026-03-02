// ============================================================
// MINI-APP 3: KEYWORD ANALYZER
// Paste into Apps Script editor of a new Google Sheet
// Also paste Utils.gs from _shared/
// ============================================================

function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu('⚡ Adalysis')
        .addItem('🔄 Refresh Keywords', 'refreshKeywords')
        .addItem('📊 Analyze Quality Scores', 'analyzeQualityScores')
        .addItem('🎯 Find Exact Match Harvest', 'findExactMatchCandidates')
        .addItem('⏸️ Flag Underperformers', 'flagUnderperformers')
        .addToUi();
}

// ---- Column Finder ----

function findCol_(headers, possibleNames) {
    for (var i = 0; i < possibleNames.length; i++) {
        var idx = headers.indexOf(possibleNames[i]);
        if (idx >= 0) return idx;
    }
    return -1;
}

// ---- Data Refresh ----

function refreshKeywords() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    try {
        var data = getSheetData('KEYWORDS');
        var sheet = getOrCreateSheet(ss, 'Keywords');
        writeTable(sheet, data);
        formatHeaderRow(sheet);
        applyKeywordFormatting_(sheet);
        autoResize(sheet);
        SpreadsheetApp.getUi().alert('✓ Keywords refreshed — ' + (data.length - 1) + ' rows.');
    } catch (e) {
        SpreadsheetApp.getUi().alert('Error: ' + e.message);
    }
}

// ---- Quality Score Analysis ----

function analyzeQualityScores() {
    var rows = getKeywordRows_();
    if (!rows.length) { SpreadsheetApp.getUi().alert('No keyword data. Refresh first.'); return; }

    var totalQS = 0, countQS = 0;
    var buckets = { excellent: 0, good: 0, fair: 0, poor: 0, noScore: 0 };
    var lowQSKeywords = [];

    rows.forEach(function (r) {
        var qs = parseNum(r['Quality Score'] || r['Quality score'] || r['QS']);
        if (qs > 0) {
            totalQS += qs; countQS++;
            if (qs >= 7) buckets.excellent++;
            else if (qs >= 5) buckets.good++;
            else if (qs >= 3) buckets.fair++;
            else buckets.poor++;

            if (qs < 5) {
                lowQSKeywords.push([
                    r['Keyword'], r['Campaign'] || r['Campaign name'],
                    r['Ad group'] || r['Ad Group'], r['Match type'] || r['Match Type'],
                    qs, parseNum(r['Cost']), parseNum(r['Clicks'])
                ]);
            }
        } else {
            buckets.noScore++;
        }
    });

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var lowSheet = getOrCreateSheet(ss, 'Low QS Keywords');
    var output = [['Keyword', 'Campaign', 'Ad Group', 'Match Type', 'QS', 'Cost', 'Clicks']];
    lowQSKeywords.sort(function (a, b) { return a[4] - b[4]; });
    lowQSKeywords.forEach(function (row) { output.push(row); });
    writeTable(lowSheet, output);
    formatHeaderRow(lowSheet);
    autoResize(lowSheet);

    var avgQS = countQS > 0 ? (totalQS / countQS).toFixed(1) : 'N/A';

    SpreadsheetApp.getUi().alert(
        '📊 Quality Score Analysis\n\n' +
        'Average QS: ' + avgQS + '/10 (' + countQS + ' keywords scored)\n\n' +
        '✅ Excellent (7-10): ' + buckets.excellent + '\n' +
        '🟢 Good (5-6): ' + buckets.good + '\n' +
        '🟡 Fair (3-4): ' + buckets.fair + '\n' +
        '🔴 Poor (1-2): ' + buckets.poor + '\n' +
        '⚪ No score: ' + buckets.noScore + '\n\n' +
        lowQSKeywords.length + ' keywords with QS < 5 → "Low QS Keywords" tab.'
    );
}

// ---- Exact Match Harvest ----

function findExactMatchCandidates() {
    var rows = getKeywordRows_();
    if (!rows.length) { SpreadsheetApp.getUi().alert('No keyword data. Refresh first.'); return; }

    var candidates = [];
    rows.forEach(function (r) {
        var matchType = String(r['Match type'] || r['Match Type'] || '').toLowerCase();
        var conv = parseNum(r['Conversions'] || r['Conv.'] || r['Conv']);
        var cost = parseNum(r['Cost']);
        var cpa = conv > 0 ? cost / conv : 0;

        if (matchType !== 'exact' && conv >= 5 && cpa < 150) {
            candidates.push([
                r['Keyword'], r['Campaign'] || r['Campaign name'],
                r['Ad group'] || r['Ad Group'], r['Match type'] || r['Match Type'],
                conv, fmtUsdFull(cost), '$' + cpa.toFixed(0), 'Add as Exact Match'
            ]);
        }
    });

    candidates.sort(function (a, b) { return b[4] - a[4]; });

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getOrCreateSheet(ss, 'Exact Match Harvest');
    var output = [['Keyword', 'Campaign', 'Ad Group', 'Current Match', 'Conv', 'Cost', 'CPA', 'Action']];
    candidates.forEach(function (row) { output.push(row); });
    writeTable(sheet, output);
    formatHeaderRow(sheet);
    autoResize(sheet);
    ss.setActiveSheet(sheet);

    SpreadsheetApp.getUi().alert('🎯 Found ' + candidates.length + ' exact match harvest candidates.');
}

// ---- Underperformer Flagging ----

function flagUnderperformers() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Keywords');
    if (!sheet || sheet.getLastRow() < 2) {
        SpreadsheetApp.getUi().alert('No data. Refresh first.');
        return;
    }

    var data = sheet.getDataRange().getValues();
    var headers = data[0].map(function (h) { return String(h).trim(); });

    var costIdx = findCol_(headers, ['Cost']);
    var convIdx = findCol_(headers, ['Conversions', 'Conv.', 'Conv']);
    var clicksIdx = findCol_(headers, ['Clicks']);
    var statusIdx = findCol_(headers, ['Status', 'Keyword status']);

    var actionIdx = headers.indexOf('Action');
    if (actionIdx < 0) { actionIdx = headers.length; sheet.getRange(1, actionIdx + 1).setValue('Action'); }

    var pauseCount = 0, watchCount = 0;

    for (var i = 1; i < data.length; i++) {
        var cost = parseNum(data[i][costIdx]);
        var conv = parseNum(data[i][convIdx]);
        var clicks = parseNum(data[i][clicksIdx]);
        var status = statusIdx >= 0 ? String(data[i][statusIdx]) : 'active';
        var action = '';

        if (status.toLowerCase().indexOf('active') < 0 && status.toLowerCase().indexOf('enabled') < 0) continue;

        if (conv === 0 && clicks >= 100) { action = '🔴 PAUSE — 100+ clicks, 0 conv'; pauseCount++; }
        else if (conv === 0 && cost > 100) { action = '🟠 PAUSE — $100+ spend, 0 conv'; pauseCount++; }
        else if (conv > 0 && cost / conv > 200) { action = '🟡 WATCH — CPA > $200'; watchCount++; }

        sheet.getRange(i + 1, actionIdx + 1).setValue(action);
    }

    autoResize(sheet);
    SpreadsheetApp.getUi().alert('⏸️ Recommend PAUSE: ' + pauseCount + ' | Watch list: ' + watchCount);
}

// ---- Helpers ----

function getKeywordRows_() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Keywords');
    var data;
    if (sheet && sheet.getLastRow() >= 2) {
        data = sheet.getDataRange().getValues();
    } else {
        data = getSheetData('KEYWORDS');
    }
    return parseTable(data);
}

function applyKeywordFormatting_(sheet) {
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return;
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(function (h) { return String(h).trim(); });
    var qsCol = findCol_(headers, ['Quality Score', 'Quality score', 'QS']);
    if (qsCol < 0) return;
    qsCol++; // 1-indexed

    var qsRange = sheet.getRange(2, qsCol, lastRow - 1, 1);
    var rules = sheet.getConditionalFormatRules();
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenNumberGreaterThanOrEqualTo(7).setBackground('#bbf7d0').setFontColor('#166534').setRanges([qsRange]).build());
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenNumberBetween(4, 6).setBackground('#fef9c3').setFontColor('#854d0e').setRanges([qsRange]).build());
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenNumberLessThanOrEqualTo(3).setBackground('#fecaca').setFontColor('#991b1b').setRanges([qsRange]).build());
    sheet.setConditionalFormatRules(rules);
}
