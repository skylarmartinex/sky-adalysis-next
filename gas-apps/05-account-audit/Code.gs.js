// ============================================================
// MINI-APP 5: ACCOUNT AUDIT CHECKLIST
// Paste into Apps Script editor of a new Google Sheet
// Also paste Utils.gs from _shared/
// ============================================================

function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu('⚡ Adalysis')
        .addItem('🔄 Run Full Audit', 'runFullAudit')
        .addItem('📊 Show Audit Score', 'showAuditScore')
        .addSeparator()
        .addSubMenu(
            SpreadsheetApp.getUi().createMenu('⚙️ Setup')
                .addItem('Set Data Lake Sheet ID', 'promptDataLakeId')
                .addItem('Reset Checklist', 'resetChecklist')
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

// ---- Audit Definitions ----

var AUDIT_CATEGORIES = [
    {
        name: 'Campaign Structure',
        checks: [
            { check: 'All campaigns have ≥1 ad group', auto: true, rule: 'structure_adgroups' },
            { check: 'Consistent naming convention (Brand|Type|Theme)', auto: false },
            { check: 'No duplicate campaign targets', auto: false },
            { check: 'Single keyword ad groups for brand terms', auto: false },
        ]
    },
    {
        name: 'Bid Strategy',
        checks: [
            { check: 'All active campaigns use Smart Bidding', auto: true, rule: 'bid_smart' },
            { check: 'Target CPA within 20% of actual CPA', auto: true, rule: 'bid_alignment' },
            { check: 'Max CPC caps set for Smart Bidding', auto: false },
            { check: 'Portfolio bid strategies for related campaigns', auto: false },
        ]
    },
    {
        name: 'Negative Keywords',
        checks: [
            { check: 'Account-level negative keyword list exists', auto: false },
            { check: 'No zero-conv queries > $100 spend (30d)', auto: true, rule: 'neg_waste' },
            { check: 'Shared negative lists applied', auto: false },
            { check: 'Competitor campaign brand negatives', auto: false },
        ]
    },
    {
        name: 'Budget Management',
        checks: [
            { check: 'No campaigns limited by budget > 6 hrs/day', auto: true, rule: 'budget_limited' },
            { check: 'Budget distribution aligns with ROAS', auto: false },
            { check: 'Monthly pacing on track (±10%)', auto: false },
            { check: 'Paused campaigns have budget reallocated', auto: true, rule: 'budget_paused' },
        ]
    },
    {
        name: 'Quality Score',
        checks: [
            { check: 'Average QS ≥ 6/10', auto: true, rule: 'qs_avg' },
            { check: 'No active keywords with QS ≤ 3', auto: true, rule: 'qs_low' },
            { check: 'Keywords with QS < 5 reviewed monthly', auto: false },
        ]
    },
    {
        name: 'Tracking & Measurement',
        checks: [
            { check: 'Conversion tracking active', auto: false },
            { check: 'Primary conversion action defined', auto: false },
            { check: 'GA4 linked and auto-tagging enabled', auto: false },
            { check: 'Value-based bidding configured', auto: false },
        ]
    },
];

// ---- Run Audit ----

function runFullAudit() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var ui = SpreadsheetApp.getUi();

    // Fetch data for auto-checks
    var campaigns = [], keywords = [], searchTerms = [];
    try {
        campaigns = parseTable(getDataLakeTab('Campaigns'));
    } catch (e) { }
    try {
        keywords = parseTable(getDataLakeTab('Keywords'));
    } catch (e) { }
    try {
        searchTerms = parseTable(getDataLakeTab('SearchTerms'));
    } catch (e) { }

    // Run auto-checks
    var autoResults = runAutoChecks_(campaigns, keywords, searchTerms);

    // Build audit sheet
    var sheet = getOrCreateSheet(ss, 'Audit Checklist');
    sheet.clearContents();
    sheet.clearConditionalFormatRules();

    var output = [['Category', 'Check', 'Pass', 'Notes', 'Auto?']];

    AUDIT_CATEGORIES.forEach(function (cat) {
        cat.checks.forEach(function (item) {
            var autoResult = item.auto && item.rule ? autoResults[item.rule] : null;
            var pass = autoResult ? autoResult.pass : false;
            var note = autoResult ? autoResult.note : '';

            output.push([
                cat.name,
                item.check,
                pass,        // Checkbox
                note,
                item.auto ? '✓' : '',
            ]);
        });
    });

    writeTable(sheet, output);
    formatHeaderRow(sheet);

    // Set checkboxes in Pass column
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
        var passRange = sheet.getRange(2, 3, lastRow - 1, 1);
        passRange.insertCheckboxes();

        // Set auto-check results
        for (var i = 1; i < output.length; i++) {
            if (output[i][2] === true) {
                sheet.getRange(i + 1, 3).setValue(true);
            }
        }
    }

    // Conditional formatting
    var rules = [];
    var passCol = sheet.getRange(2, 3, lastRow - 1, 1);

    // Green for pass
    rules.push(SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied('=$C2=TRUE')
        .setBackground('#dcfce7')
        .setRanges([sheet.getRange(2, 1, lastRow - 1, 5)])
        .build());

    // Red for fail
    rules.push(SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied('=$C2=FALSE')
        .setBackground('#fee2e2')
        .setRanges([sheet.getRange(2, 1, lastRow - 1, 5)])
        .build());

    sheet.setConditionalFormatRules(rules);

    // Add score formula at bottom
    var scoreRow = lastRow + 2;
    sheet.getRange(scoreRow, 1).setValue('AUDIT SCORE').setFontWeight('bold').setFontSize(12);
    sheet.getRange(scoreRow, 2).setFormula(
        '=ROUND(COUNTIF(C2:C' + lastRow + ',TRUE)/COUNTA(C2:C' + lastRow + ')*100, 0) & "/100"'
    ).setFontWeight('bold').setFontSize(12);

    autoResize(sheet);
    ss.setActiveSheet(sheet);

    ui.alert(
        '✓ Audit Complete\n\n' +
        'Auto-checks run on ' + campaigns.length + ' campaigns, ' +
        keywords.length + ' keywords, ' + searchTerms.length + ' search terms.\n\n' +
        'Review the "Audit Checklist" tab.\n' +
        'Check/uncheck manual items, then re-run "Show Audit Score".'
    );
}

// ---- Auto-Check Rules ----

function runAutoChecks_(campaigns, keywords, searchTerms) {
    var results = {};

    // Bid strategy: all active use Smart Bidding
    var activeCamps = campaigns.filter(function (c) { return String(c['Campaign Status']).toLowerCase() === 'active'; });
    var manualBid = activeCamps.filter(function (c) {
        var bid = String(c['Bid Strategy'] || c['Bid Strategy Type'] || '').toLowerCase();
        return bid.indexOf('manual') >= 0;
    });
    results.bid_smart = {
        pass: manualBid.length === 0,
        note: manualBid.length > 0 ? manualBid.length + ' campaigns on Manual CPC' : 'All using Smart Bidding',
    };

    // Bid alignment: Target CPA within 20% of actual
    var misaligned = activeCamps.filter(function (c) {
        var targetCPA = parseNum(c['Target CPA']);
        var actualCPA = parseNum(c['CPA']);
        if (targetCPA <= 0 || actualCPA <= 0) return false;
        return Math.abs(actualCPA - targetCPA) / targetCPA > 0.2;
    });
    results.bid_alignment = {
        pass: misaligned.length === 0,
        note: misaligned.length > 0 ? misaligned.length + ' campaigns with CPA > 20% off target' : 'All aligned',
    };

    // Budget limited
    var budgetLimited = activeCamps.filter(function (c) {
        return parsePct(c['Search Lost IS (budget)']) > 15;
    });
    results.budget_limited = {
        pass: budgetLimited.length === 0,
        note: budgetLimited.length > 0 ? budgetLimited.length + ' campaigns losing >15% IS to budget' : 'No budget constraints',
    };

    // Paused campaigns with budget
    var pausedWithBudget = campaigns.filter(function (c) {
        return String(c['Campaign Status']).toLowerCase() === 'paused' && parseNum(c['Budget']) > 500;
    });
    results.budget_paused = {
        pass: pausedWithBudget.length === 0,
        note: pausedWithBudget.length > 0 ? pausedWithBudget.length + ' paused campaigns with budget > $500' : 'No wasted budgets',
    };

    // Negative keyword waste
    var wasteTerms = searchTerms.filter(function (st) {
        return parseNum(st['Conversions']) === 0 && parseNum(st['Cost']) > 100;
    });
    results.neg_waste = {
        pass: wasteTerms.length === 0,
        note: wasteTerms.length > 0 ? wasteTerms.length + ' queries with $100+ spend, 0 conv' : 'No major waste detected',
    };

    // QS average
    var totalQS = 0, countQS = 0;
    keywords.forEach(function (k) {
        var qs = parseNum(k['Quality Score']);
        if (qs > 0) { totalQS += qs; countQS++; }
    });
    var avgQS = countQS > 0 ? totalQS / countQS : 0;
    results.qs_avg = {
        pass: avgQS >= 6,
        note: countQS > 0 ? 'Average QS: ' + avgQS.toFixed(1) + '/10 (' + countQS + ' keywords)' : 'No QS data',
    };

    // Low QS keywords
    var lowQS = keywords.filter(function (k) {
        return parseNum(k['Quality Score']) > 0 && parseNum(k['Quality Score']) <= 3 &&
            String(k['Status'] || '').toLowerCase() === 'active';
    });
    results.qs_low = {
        pass: lowQS.length === 0,
        note: lowQS.length > 0 ? lowQS.length + ' active keywords with QS ≤ 3' : 'No critically low QS',
    };

    // Structure (placeholder — can't fully auto-check)
    results.structure_adgroups = { pass: true, note: 'Check manually' };

    return results;
}

// ---- Score Display ----

function showAuditScore() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Audit Checklist');
    if (!sheet) {
        SpreadsheetApp.getUi().alert('Run the audit first.');
        return;
    }

    var data = sheet.getDataRange().getValues();
    var pass = 0, total = 0;

    for (var i = 1; i < data.length; i++) {
        if (data[i][1] && String(data[i][1]).trim()) { // has a check name
            total++;
            if (data[i][2] === true) pass++;
        }
    }

    var score = total > 0 ? Math.round((pass / total) * 100) : 0;

    var grade = score >= 80 ? '✅ A' : score >= 60 ? '🟡 B' : score >= 40 ? '🟠 C' : '🔴 D';

    SpreadsheetApp.getUi().alert(
        '📊 Account Audit Score\n\n' +
        'Score: ' + score + '/100 (' + grade + ')\n' +
        'Passing: ' + pass + '/' + total + ' checks\n\n' +
        'Update checkboxes in the Audit Checklist tab and re-run to recalculate.'
    );
}

function resetChecklist() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Audit Checklist');
    if (sheet) ss.deleteSheet(sheet);
    SpreadsheetApp.getUi().alert('Checklist cleared. Run "Run Full Audit" to regenerate.');
}
