// ============================================================
// MINI-APP 2: SEARCH TERM AUDITOR
// Paste into Apps Script editor of a new Google Sheet
// Also paste Utils.gs from _shared/
// ============================================================

function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu('⚡ Adalysis')
        .addItem('🔄 Refresh Search Terms', 'refreshSearchTerms')
        .addItem('🚩 Flag Waste Terms', 'flagWasteTerms')
        .addItem('📋 Generate Negative List', 'generateNegativeList')
        .addItem('💰 Estimate Savings', 'estimateSavings')
        .addToUi();
}

// ---- Data Refresh ----

function refreshSearchTerms() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    try {
        var data = getSheetData('SEARCH_TERMS');
        var sheet = getOrCreateSheet(ss, 'Search Terms');
        writeTable(sheet, data);
        formatHeaderRow(sheet);
        autoResize(sheet);
        flagWasteTerms();
        SpreadsheetApp.getUi().alert('✓ Search terms refreshed — ' + (data.length - 1) + ' rows loaded.');
    } catch (e) {
        SpreadsheetApp.getUi().alert('Error: ' + e.message);
    }
}

// ---- Waste Flagging ----

function flagWasteTerms() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Search Terms');
    if (!sheet || sheet.getLastRow() < 2) {
        SpreadsheetApp.getUi().alert('No search term data. Click "Refresh Search Terms" first.');
        return;
    }

    var data = sheet.getDataRange().getValues();
    var headers = data[0].map(function (h) { return String(h).trim(); });

    // Find columns (handle multiple possible header names from Google Ads)
    var costIdx = findCol_(headers, ['Cost']);
    var convIdx = findCol_(headers, ['Conversions', 'Conv.', 'Conv']);

    if (costIdx < 0 || convIdx < 0) {
        SpreadsheetApp.getUi().alert('Could not find Cost or Conversions column. Headers found: ' + headers.join(', '));
        return;
    }

    // Add "Flag" column if not present
    var flagIdx = headers.indexOf('Flag');
    if (flagIdx < 0) {
        flagIdx = headers.length;
        sheet.getRange(1, flagIdx + 1).setValue('Flag');
    }

    var flagCount = 0, wasteCost = 0;

    for (var i = 1; i < data.length; i++) {
        var cost = parseNum(data[i][costIdx]);
        var conv = parseNum(data[i][convIdx]);
        var flag = '';

        if (conv === 0 && cost > 50) {
            flag = '🔴 WASTE';
            flagCount++;
            wasteCost += cost;
        } else if (conv === 0 && cost > 20) {
            flag = '🟡 WATCH';
        } else if (conv > 0 && cost / conv > 200) {
            flag = '🟠 HIGH CPA';
        }

        sheet.getRange(i + 1, flagIdx + 1).setValue(flag);
    }

    // Conditional formatting
    var lastRow = sheet.getLastRow();
    var flagRange = sheet.getRange(2, flagIdx + 1, lastRow - 1, 1);
    var rules = sheet.getConditionalFormatRules();

    rules.push(SpreadsheetApp.newConditionalFormatRule()
        .whenTextContains('WASTE').setBackground('#fecaca').setFontColor('#991b1b')
        .setRanges([flagRange]).build());
    rules.push(SpreadsheetApp.newConditionalFormatRule()
        .whenTextContains('HIGH CPA').setBackground('#fed7aa').setFontColor('#9a3412')
        .setRanges([flagRange]).build());

    sheet.setConditionalFormatRules(rules);
    autoResize(sheet);

    SpreadsheetApp.getUi().alert(
        '✓ Flagged ' + flagCount + ' waste terms\nTotal waste spend: ' + fmtUsdFull(wasteCost)
    );
}

// ---- Generate Negative List ----

function generateNegativeList() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sourceSheet = ss.getSheetByName('Search Terms');
    if (!sourceSheet || sourceSheet.getLastRow() < 2) {
        SpreadsheetApp.getUi().alert('No search term data. Refresh first.');
        return;
    }

    var data = sourceSheet.getDataRange().getValues();
    var headers = data[0].map(function (h) { return String(h).trim(); });

    var queryIdx = findCol_(headers, ['Search term', 'Search Term']);
    var costIdx = findCol_(headers, ['Cost']);
    var convIdx = findCol_(headers, ['Conversions', 'Conv.', 'Conv']);
    var campIdx = findCol_(headers, ['Campaign', 'Campaign name']);

    var negatives = [];
    for (var i = 1; i < data.length; i++) {
        var conv = parseNum(data[i][convIdx]);
        var cost = parseNum(data[i][costIdx]);

        if (conv === 0 && cost > 50) {
            negatives.push([
                queryIdx >= 0 ? data[i][queryIdx] : '',
                campIdx >= 0 ? data[i][campIdx] : '',
                'Phrase',
                fmtUsdFull(cost),
                '🔴 Zero-conv waste',
            ]);
        }
    }

    negatives.sort(function (a, b) { return parseNum(b[3]) - parseNum(a[3]); });

    var negSheet = getOrCreateSheet(ss, 'Neg Keyword Candidates');
    var output = [['Negative Keyword', 'Source Campaign', 'Match Type', 'Wasted Spend', 'Reason']];
    negatives.forEach(function (row) { output.push(row); });
    writeTable(negSheet, output);
    formatHeaderRow(negSheet);
    autoResize(negSheet);
    ss.setActiveSheet(negSheet);

    SpreadsheetApp.getUi().alert('✓ Generated ' + negatives.length + ' negative keyword candidates.');
}

// ---- Estimate Savings ----

function estimateSavings() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Search Terms');
    if (!sheet || sheet.getLastRow() < 2) {
        SpreadsheetApp.getUi().alert('No data. Refresh first.');
        return;
    }

    var data = sheet.getDataRange().getValues();
    var headers = data[0].map(function (h) { return String(h).trim(); });
    var costIdx = findCol_(headers, ['Cost']);
    var convIdx = findCol_(headers, ['Conversions', 'Conv.', 'Conv']);

    var totalWaste = 0, wasteCount = 0, highCpaWaste = 0;

    for (var i = 1; i < data.length; i++) {
        var cost = parseNum(data[i][costIdx]);
        var conv = parseNum(data[i][convIdx]);

        if (conv === 0 && cost > 50) { totalWaste += cost; wasteCount++; }
        else if (conv > 0 && cost / conv > 200) { highCpaWaste += cost; }
    }

    SpreadsheetApp.getUi().alert(
        '💰 Savings Estimate\n\n' +
        'Zero-conv terms (cost > $50): ' + wasteCount + ' terms = ' + fmtUsdFull(totalWaste) + '\n' +
        'High CPA terms (CPA > $200): ' + fmtUsdFull(highCpaWaste) + '\n\n' +
        'Total addressable waste: ' + fmtUsdFull(totalWaste + highCpaWaste)
    );
}

// ---- Column Finder ----

function findCol_(headers, possibleNames) {
    for (var i = 0; i < possibleNames.length; i++) {
        var idx = headers.indexOf(possibleNames[i]);
        if (idx >= 0) return idx;
    }
    return -1;
}
