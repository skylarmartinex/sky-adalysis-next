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
        .addSeparator()
        .addSubMenu(
            SpreadsheetApp.getUi().createMenu('⚙️ Setup')
                .addItem('Set Data Lake Sheet ID', 'promptDataLakeId')
        )
        .addToUi();
}

function promptDataLakeId() {
    var ui = SpreadsheetApp.getUi();
    var response = ui.prompt(
        'Data Lake Sheet ID',
        'Enter the Google Sheet ID of your Ads Data Lake:',
        ui.ButtonSet.OK_CANCEL
    );
    if (response.getSelectedButton() === ui.Button.OK) {
        setDataLakeId(response.getResponseText().trim());
    }
}

// ---- Data Refresh ----

function refreshSearchTerms() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    try {
        var data = getDataLakeTab('SearchTerms');
        var sheet = getOrCreateSheet(ss, 'Search Terms');
        writeTable(sheet, data);
        formatHeaderRow(sheet);
        autoResize(sheet);

        // Auto-flag after loading
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
        SpreadsheetApp.getUi().alert('No search term data. Refresh first.');
        return;
    }

    var data = sheet.getDataRange().getValues();
    var headers = data[0];

    var costIdx = headers.indexOf('Cost');
    var convIdx = headers.indexOf('Conversions');
    var statusIdx = headers.indexOf('Status');

    if (costIdx < 0 || convIdx < 0) {
        SpreadsheetApp.getUi().alert('Required columns not found: Cost, Conversions');
        return;
    }

    // Add "Flag" column if not present
    var flagIdx = headers.indexOf('Flag');
    if (flagIdx < 0) {
        flagIdx = headers.length;
        sheet.getRange(1, flagIdx + 1).setValue('Flag');
    }

    var flagCount = 0;
    var wasteCost = 0;

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

    // Conditional formatting: red for waste rows
    var lastRow = sheet.getLastRow();
    var flagRange = sheet.getRange(2, flagIdx + 1, lastRow - 1, 1);

    var rule = SpreadsheetApp.newConditionalFormatRule()
        .whenTextContains('WASTE')
        .setBackground('#fecaca')
        .setFontColor('#991b1b')
        .setRanges([flagRange])
        .build();

    var rule2 = SpreadsheetApp.newConditionalFormatRule()
        .whenTextContains('HIGH CPA')
        .setBackground('#fed7aa')
        .setFontColor('#9a3412')
        .setRanges([flagRange])
        .build();

    var rules = sheet.getConditionalFormatRules();
    rules.push(rule, rule2);
    sheet.setConditionalFormatRules(rules);

    autoResize(sheet);

    SpreadsheetApp.getUi().alert(
        '✓ Flagged ' + flagCount + ' waste terms\n' +
        'Total waste spend: ' + fmtUsdFull(wasteCost)
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
    var headers = data[0];

    var queryIdx = headers.indexOf('Search term');
    var costIdx = headers.indexOf('Cost');
    var convIdx = headers.indexOf('Conversions');
    var campIdx = headers.indexOf('Campaign');
    var matchIdx = headers.indexOf('Match type');
    var flagIdx = headers.indexOf('Flag');

    // Build negative list
    var negatives = [];
    for (var i = 1; i < data.length; i++) {
        var flag = flagIdx >= 0 ? String(data[i][flagIdx]) : '';
        var conv = parseNum(data[i][convIdx]);
        var cost = parseNum(data[i][costIdx]);

        if (conv === 0 && cost > 50) {
            negatives.push([
                data[i][queryIdx],                        // Search term
                data[i][campIdx] || '',                    // Campaign
                'Phrase',                                   // Recommended match type
                fmtUsdFull(cost),                           // Wasted spend
                flag || '🔴 WASTE',                         // Reason
            ]);
        }
    }

    // Sort by cost (descending)
    negatives.sort(function (a, b) {
        return parseNum(b[3]) - parseNum(a[3]);
    });

    // Write to "Neg Keyword Candidates" tab
    var negSheet = getOrCreateSheet(ss, 'Neg Keyword Candidates');
    var output = [['Negative Keyword', 'Source Campaign', 'Match Type', 'Wasted Spend', 'Reason']];
    negatives.forEach(function (row) { output.push(row); });

    writeTable(negSheet, output);
    formatHeaderRow(negSheet);
    autoResize(negSheet);

    // Activate that tab
    ss.setActiveSheet(negSheet);

    SpreadsheetApp.getUi().alert(
        '✓ Generated ' + negatives.length + ' negative keyword candidates\n' +
        'Review the "Neg Keyword Candidates" tab.'
    );
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
    var headers = data[0];
    var costIdx = headers.indexOf('Cost');
    var convIdx = headers.indexOf('Conversions');

    var totalWaste = 0;
    var wasteCount = 0;
    var highCpaWaste = 0;

    for (var i = 1; i < data.length; i++) {
        var cost = parseNum(data[i][costIdx]);
        var conv = parseNum(data[i][convIdx]);

        if (conv === 0 && cost > 50) {
            totalWaste += cost;
            wasteCount++;
        } else if (conv > 0 && cost / conv > 200) {
            highCpaWaste += cost;
        }
    }

    SpreadsheetApp.getUi().alert(
        '💰 Savings Estimate\n\n' +
        'Zero-conversion terms (cost > $50):\n' +
        '  ' + wasteCount + ' terms = ' + fmtUsdFull(totalWaste) + ' waste\n\n' +
        'High CPA terms (CPA > $200):\n' +
        '  Additional ' + fmtUsdFull(highCpaWaste) + ' at risk\n\n' +
        'Total addressable waste: ' + fmtUsdFull(totalWaste + highCpaWaste)
    );
}
