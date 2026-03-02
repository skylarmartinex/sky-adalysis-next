// ============================================================
// MINI-APP 3: KEYWORD ANALYZER
// Also paste Utils.gs from _shared/
// ============================================================
// Column names from Google Ads script:
// Keyword, CampaignName, CampaignId, AdGroupName, AdGroupId,
// MatchType, Status, QualityScore, ExpectedCtr, AdRelevance,
// LandingPageExperience, Cost, Impressions, Clicks, Conversions,
// ConversionValue, CPC, CTR, CVR, CPA, ROAS

function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu('⚡ Adalysis')
        .addItem('🔄 Refresh Keywords', 'refreshKeywords')
        .addItem('📊 Analyze Quality Scores', 'analyzeQualityScores')
        .addItem('🎯 Find Exact Match Harvest', 'findExactMatchCandidates')
        .addItem('⏸️ Flag Underperformers', 'flagUnderperformers')
        .addToUi();
}

function refreshKeywords() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    try {
        var data = getSheetData('KEYWORDS');
        var sheet = getOrCreateSheet(ss, 'Keywords');
        writeTable(sheet, data);
        formatHeaderRow(sheet);
        applyQSFormatting_(sheet);
        autoResize(sheet);
        SpreadsheetApp.getUi().alert('✓ Keywords refreshed — ' + (data.length - 1) + ' rows.');
    } catch (e) {
        SpreadsheetApp.getUi().alert('Error: ' + e.message);
    }
}

function analyzeQualityScores() {
    var rows = getKeywords_();
    if (!rows.length) { SpreadsheetApp.getUi().alert('No data. Refresh first.'); return; }

    var totalQS = 0, countQS = 0;
    var buckets = { excellent: 0, good: 0, fair: 0, poor: 0, noScore: 0 };
    var lowQS = [];

    rows.forEach(function (r) {
        var qs = parseNum(r['QualityScore']);
        if (qs > 0) {
            totalQS += qs; countQS++;
            if (qs >= 7) buckets.excellent++;
            else if (qs >= 5) buckets.good++;
            else if (qs >= 3) buckets.fair++;
            else buckets.poor++;

            if (qs < 5) {
                lowQS.push([
                    r['Keyword'], r['CampaignName'], r['AdGroupName'],
                    r['MatchType'], qs, parseNum(r['Cost']), parseNum(r['Clicks']),
                    r['ExpectedCtr'] || '', r['AdRelevance'] || '', r['LandingPageExperience'] || ''
                ]);
            }
        } else {
            buckets.noScore++;
        }
    });

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getOrCreateSheet(ss, 'Low QS Keywords');
    var output = [['Keyword', 'Campaign', 'Ad Group', 'Match Type', 'QS', 'Cost', 'Clicks', 'Expected CTR', 'Ad Relevance', 'Landing Page']];
    lowQS.sort(function (a, b) { return a[4] - b[4]; });
    lowQS.forEach(function (r) { output.push(r); });
    writeTable(sheet, output);
    formatHeaderRow(sheet);
    autoResize(sheet);

    SpreadsheetApp.getUi().alert(
        '📊 Quality Score Analysis\n\n' +
        'Average QS: ' + (countQS > 0 ? (totalQS / countQS).toFixed(1) : 'N/A') + '/10 (' + countQS + ' scored)\n\n' +
        '✅ Excellent (7-10): ' + buckets.excellent + '\n' +
        '🟢 Good (5-6): ' + buckets.good + '\n' +
        '🟡 Fair (3-4): ' + buckets.fair + '\n' +
        '🔴 Poor (1-2): ' + buckets.poor + '\n' +
        '⚪ No score: ' + buckets.noScore + '\n\n' +
        lowQS.length + ' keywords with QS < 5 → "Low QS Keywords" tab.'
    );
}

function findExactMatchCandidates() {
    var rows = getKeywords_();
    if (!rows.length) { SpreadsheetApp.getUi().alert('No data. Refresh first.'); return; }

    var candidates = [];
    rows.forEach(function (r) {
        var matchType = String(r['MatchType'] || '').toUpperCase();
        var conv = parseNum(r['Conversions']);
        var cost = parseNum(r['Cost']);
        var cpa = conv > 0 ? cost / conv : 0;

        if (matchType !== 'EXACT' && conv >= 5 && cpa < 150) {
            candidates.push([
                r['Keyword'], r['CampaignName'], r['AdGroupName'],
                r['MatchType'], conv, fmtUsdFull(cost), '$' + cpa.toFixed(0), 'Add as Exact'
            ]);
        }
    });

    candidates.sort(function (a, b) { return b[4] - a[4]; });

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getOrCreateSheet(ss, 'Exact Match Harvest');
    var output = [['Keyword', 'Campaign', 'Ad Group', 'Current Match', 'Conv', 'Cost', 'CPA', 'Action']];
    candidates.forEach(function (r) { output.push(r); });
    writeTable(sheet, output);
    formatHeaderRow(sheet);
    autoResize(sheet);
    ss.setActiveSheet(sheet);

    SpreadsheetApp.getUi().alert('🎯 Found ' + candidates.length + ' exact match harvest candidates.');
}

function flagUnderperformers() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Keywords');
    if (!sheet || sheet.getLastRow() < 2) { SpreadsheetApp.getUi().alert('No data. Refresh first.'); return; }

    var data = sheet.getDataRange().getValues();
    var headers = data[0].map(function (h) { return String(h).trim(); });

    var costIdx = findCol(headers, ['Cost']);
    var convIdx = findCol(headers, ['Conversions']);
    var clicksIdx = findCol(headers, ['Clicks']);
    var statusIdx = findCol(headers, ['Status']);

    var actionIdx = headers.indexOf('Action');
    if (actionIdx < 0) { actionIdx = headers.length; sheet.getRange(1, actionIdx + 1).setValue('Action'); }

    var pauseCount = 0, watchCount = 0;
    for (var i = 1; i < data.length; i++) {
        var cost = parseNum(data[i][costIdx]);
        var conv = parseNum(data[i][convIdx]);
        var clicks = parseNum(data[i][clicksIdx]);
        var status = statusIdx >= 0 ? String(data[i][statusIdx]).toUpperCase() : 'ENABLED';
        var action = '';

        if (status !== 'ENABLED') continue;

        if (conv === 0 && clicks >= 100) { action = '🔴 PAUSE — 100+ clicks, 0 conv'; pauseCount++; }
        else if (conv === 0 && cost > 100) { action = '🟠 PAUSE — $100+ spend, 0 conv'; pauseCount++; }
        else if (conv > 0 && cost / conv > 200) { action = '🟡 WATCH — CPA > $200'; watchCount++; }

        sheet.getRange(i + 1, actionIdx + 1).setValue(action);
    }

    autoResize(sheet);
    SpreadsheetApp.getUi().alert('⏸️ Recommend PAUSE: ' + pauseCount + ' | Watch: ' + watchCount);
}

// ---- Helpers ----

function getKeywords_() {
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

function applyQSFormatting_(sheet) {
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return;
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(function (h) { return String(h).trim(); });
    var qsCol = findCol(headers, ['QualityScore']) + 1;
    if (qsCol < 1) return;

    var qsRange = sheet.getRange(2, qsCol, lastRow - 1, 1);
    var rules = sheet.getConditionalFormatRules();
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenNumberGreaterThanOrEqualTo(7).setBackground('#bbf7d0').setFontColor('#166534').setRanges([qsRange]).build());
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenNumberBetween(4, 6).setBackground('#fef9c3').setFontColor('#854d0e').setRanges([qsRange]).build());
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenNumberLessThanOrEqualTo(3).setBackground('#fecaca').setFontColor('#991b1b').setRanges([qsRange]).build());
    sheet.setConditionalFormatRules(rules);
}
