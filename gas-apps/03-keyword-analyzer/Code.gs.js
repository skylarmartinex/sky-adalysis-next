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
        .addSeparator()
        .addSubMenu(
            SpreadsheetApp.getUi().createMenu('⚙️ Setup')
                .addItem('Set Data Lake Sheet ID', 'promptDataLakeId')
        )
        .addToUi();
}

function promptDataLakeId() {
    var ui = SpreadsheetApp.getUi();
    var response = ui.prompt('Data Lake Sheet ID',
        'Enter the Google Sheet ID of your Ads Data Lake:', ui.ButtonSet.OK_CANCEL);
    if (response.getSelectedButton() === ui.Button.OK) {
        setDataLakeId(response.getResponseText().trim());
    }
}

// ---- Data Refresh ----

function refreshKeywords() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    try {
        var data = getDataLakeTab('Keywords');
        var sheet = getOrCreateSheet(ss, 'Keywords');
        writeTable(sheet, data);
        formatHeaderRow(sheet);
        applyKeywordFormatting(sheet);
        autoResize(sheet);
        SpreadsheetApp.getUi().alert('✓ Keywords refreshed — ' + (data.length - 1) + ' rows.');
    } catch (e) {
        SpreadsheetApp.getUi().alert('Error: ' + e.message);
    }
}

// ---- Quality Score Analysis ----

function analyzeQualityScores() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Keywords');
    if (!sheet || sheet.getLastRow() < 2) {
        SpreadsheetApp.getUi().alert('No keyword data. Refresh first.');
        return;
    }

    var data = sheet.getDataRange().getValues();
    var rows = parseTable(data);

    var totalQS = 0, countQS = 0;
    var buckets = { excellent: 0, good: 0, fair: 0, poor: 0, noScore: 0 };
    var lowQSKeywords = [];

    rows.forEach(function (r) {
        var qs = parseNum(r['Quality Score']);
        if (qs > 0) {
            totalQS += qs;
            countQS++;
            if (qs >= 7) buckets.excellent++;
            else if (qs >= 5) buckets.good++;
            else if (qs >= 3) buckets.fair++;
            else buckets.poor++;

            if (qs < 5) {
                lowQSKeywords.push([
                    r['Keyword'], r['Campaign'], r['Ad group'],
                    r['Match type'], qs, parseNum(r['Cost']), parseNum(r['Clicks'])
                ]);
            }
        } else {
            buckets.noScore++;
        }
    });

    // Write Low QS tab
    var lowSheet = getOrCreateSheet(ss, 'Low QS Keywords');
    var output = [['Keyword', 'Campaign', 'Ad Group', 'Match Type', 'QS', 'Cost', 'Clicks']];
    lowQSKeywords.sort(function (a, b) { return a[4] - b[4]; }); // sort by QS asc
    lowQSKeywords.forEach(function (row) { output.push(row); });
    writeTable(lowSheet, output);
    formatHeaderRow(lowSheet);
    autoResize(lowSheet);

    var avgQS = countQS > 0 ? (totalQS / countQS).toFixed(1) : 'N/A';

    SpreadsheetApp.getUi().alert(
        '📊 Quality Score Analysis\n\n' +
        'Average QS: ' + avgQS + '/10\n' +
        'Total keywords scored: ' + countQS + '\n\n' +
        'Distribution:\n' +
        '  ✅ Excellent (7-10): ' + buckets.excellent + '\n' +
        '  🟢 Good (5-6): ' + buckets.good + '\n' +
        '  🟡 Fair (3-4): ' + buckets.fair + '\n' +
        '  🔴 Poor (1-2): ' + buckets.poor + '\n' +
        '  ⚪ No score: ' + buckets.noScore + '\n\n' +
        lowQSKeywords.length + ' keywords with QS < 5 listed in "Low QS Keywords" tab.'
    );
}

// ---- Exact Match Harvest ----

function findExactMatchCandidates() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Keywords');
    if (!sheet || sheet.getLastRow() < 2) {
        SpreadsheetApp.getUi().alert('No keyword data. Refresh first.');
        return;
    }

    var data = sheet.getDataRange().getValues();
    var rows = parseTable(data);

    // Find high-converting keywords that are NOT exact match
    var candidates = [];
    rows.forEach(function (r) {
        var matchType = String(r['Match type'] || '').toLowerCase();
        var conv = parseNum(r['Conversions']);
        var cost = parseNum(r['Cost']);
        var cpa = conv > 0 ? cost / conv : 0;

        if (matchType !== 'exact' && conv >= 5 && cpa < 150) {
            candidates.push([
                r['Keyword'], r['Campaign'], r['Ad group'],
                r['Match type'], conv, fmtUsdFull(cost),
                '$' + cpa.toFixed(0), 'Add as Exact Match'
            ]);
        }
    });

    candidates.sort(function (a, b) { return b[4] - a[4]; }); // conv desc

    var harvestSheet = getOrCreateSheet(ss, 'Exact Match Harvest');
    var output = [['Keyword', 'Campaign', 'Ad Group', 'Current Match', 'Conv', 'Cost', 'CPA', 'Action']];
    candidates.forEach(function (row) { output.push(row); });
    writeTable(harvestSheet, output);
    formatHeaderRow(harvestSheet);
    autoResize(harvestSheet);

    ss.setActiveSheet(harvestSheet);

    SpreadsheetApp.getUi().alert(
        '🎯 Found ' + candidates.length + ' exact match harvest candidates\n' +
        'These keywords have 5+ conversions at CPA < $150 but aren\'t exact match.\n' +
        'See "Exact Match Harvest" tab.'
    );
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
    var headers = data[0];

    var costIdx = headers.indexOf('Cost');
    var convIdx = headers.indexOf('Conversions');
    var clicksIdx = headers.indexOf('Clicks');
    var statusIdx = headers.indexOf('Status');

    // Add "Action" column
    var actionIdx = headers.indexOf('Action');
    if (actionIdx < 0) {
        actionIdx = headers.length;
        sheet.getRange(1, actionIdx + 1).setValue('Action');
    }

    var pauseCount = 0, watchCount = 0;

    for (var i = 1; i < data.length; i++) {
        var cost = parseNum(data[i][costIdx]);
        var conv = parseNum(data[i][convIdx]);
        var clicks = parseNum(data[i][clicksIdx]);
        var status = String(data[i][statusIdx] || '');
        var action = '';

        if (status.toLowerCase() !== 'active') continue;

        if (conv === 0 && clicks >= 100) {
            action = '🔴 PAUSE — 100+ clicks, 0 conv';
            pauseCount++;
        } else if (conv === 0 && cost > 100) {
            action = '🟠 PAUSE — $100+ spend, 0 conv';
            pauseCount++;
        } else if (conv > 0 && cost / conv > 200) {
            action = '🟡 WATCH — CPA > $200';
            watchCount++;
        }

        sheet.getRange(i + 1, actionIdx + 1).setValue(action);
    }

    autoResize(sheet);

    SpreadsheetApp.getUi().alert(
        '⏸️ Underperformer Analysis\n\n' +
        '🔴 Recommend PAUSE: ' + pauseCount + ' keywords\n' +
        '🟡 Watch list: ' + watchCount + ' keywords\n\n' +
        'See "Action" column in Keywords tab.'
    );
}

// ---- Formatting ----

function applyKeywordFormatting(sheet) {
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return;

    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var qsCol = headers.indexOf('Quality Score') + 1;

    if (qsCol > 0) {
        var qsRange = sheet.getRange(2, qsCol, lastRow - 1, 1);

        var rules = sheet.getConditionalFormatRules();

        // QS >= 7 = green
        rules.push(SpreadsheetApp.newConditionalFormatRule()
            .whenNumberGreaterThanOrEqualTo(7)
            .setBackground('#bbf7d0').setFontColor('#166534')
            .setRanges([qsRange]).build());

        // QS 4-6 = yellow
        rules.push(SpreadsheetApp.newConditionalFormatRule()
            .whenNumberBetween(4, 6)
            .setBackground('#fef9c3').setFontColor('#854d0e')
            .setRanges([qsRange]).build());

        // QS <= 3 = red
        rules.push(SpreadsheetApp.newConditionalFormatRule()
            .whenNumberLessThanOrEqualTo(3)
            .setBackground('#fecaca').setFontColor('#991b1b')
            .setRanges([qsRange]).build());

        sheet.setConditionalFormatRules(rules);
    }
}
