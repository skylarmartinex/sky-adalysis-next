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
        .addItem('Reset Checklist', 'resetChecklist')
        .addToUi();
}

function findCol_(headers, possibleNames) {
    for (var i = 0; i < possibleNames.length; i++) {
        var idx = headers.indexOf(possibleNames[i]);
        if (idx >= 0) return idx;
    }
    return -1;
}

// ---- Audit Definitions ----

var AUDIT_CATEGORIES = [
    {
        name: 'Campaign Structure',
        checks: [
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
        ]
    },
    {
        name: 'Negative Keywords',
        checks: [
            { check: 'Account-level negative keyword list exists', auto: false },
            { check: 'No zero-conv queries > $100 spend', auto: true, rule: 'neg_waste' },
            { check: 'Shared negative lists applied', auto: false },
        ]
    },
    {
        name: 'Budget Management',
        checks: [
            { check: 'No campaigns limited by budget > 15% IS lost', auto: true, rule: 'budget_limited' },
            { check: 'Budget distribution aligns with ROAS', auto: false },
            { check: 'Monthly pacing on track (±10%)', auto: false },
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
        ]
    },
];

// ---- Run Audit ----

function runFullAudit() {
    var ui = SpreadsheetApp.getUi();
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // Fetch data from your automated sheets
    var campaigns = [], keywords = [], searchTerms = [];
    try { campaigns = parseTable(getSheetData('CAMPAIGNS')); } catch (e) { }
    try { keywords = parseTable(getSheetData('KEYWORDS')); } catch (e) { }
    try { searchTerms = parseTable(getSheetData('SEARCH_TERMS')); } catch (e) { }

    var autoResults = runAutoChecks_(campaigns, keywords, searchTerms);

    // Build checklist
    var sheet = getOrCreateSheet(ss, 'Audit Checklist');
    sheet.clearContents();
    sheet.clearConditionalFormatRules();

    var output = [['Category', 'Check', 'Pass', 'Notes', 'Auto?']];

    AUDIT_CATEGORIES.forEach(function (cat) {
        cat.checks.forEach(function (item) {
            var auto = item.auto && item.rule ? autoResults[item.rule] : null;
            output.push([
                cat.name,
                item.check,
                auto ? auto.pass : false,
                auto ? auto.note : '',
                item.auto ? '✓' : '',
            ]);
        });
    });

    writeTable(sheet, output);
    formatHeaderRow(sheet);

    // Checkboxes
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
        sheet.getRange(2, 3, lastRow - 1, 1).insertCheckboxes();
        for (var i = 1; i < output.length; i++) {
            if (output[i][2] === true) sheet.getRange(i + 1, 3).setValue(true);
        }
    }

    // Conditional formatting
    var rules = [];
    rules.push(SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied('=$C2=TRUE').setBackground('#dcfce7')
        .setRanges([sheet.getRange(2, 1, lastRow - 1, 5)]).build());
    rules.push(SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied('=$C2=FALSE').setBackground('#fee2e2')
        .setRanges([sheet.getRange(2, 1, lastRow - 1, 5)]).build());
    sheet.setConditionalFormatRules(rules);

    // Score
    var scoreRow = lastRow + 2;
    sheet.getRange(scoreRow, 1).setValue('AUDIT SCORE').setFontWeight('bold').setFontSize(12);
    sheet.getRange(scoreRow, 2).setFormula(
        '=ROUND(COUNTIF(C2:C' + lastRow + ',TRUE)/COUNTA(C2:C' + lastRow + ')*100,0)&"/100"'
    ).setFontWeight('bold').setFontSize(12);

    autoResize(sheet);
    ss.setActiveSheet(sheet);

    ui.alert(
        '✓ Audit Complete\n\n' +
        'Scanned: ' + campaigns.length + ' campaigns, ' +
        keywords.length + ' keywords, ' + searchTerms.length + ' search terms.\n\n' +
        'Review "Audit Checklist" — check/uncheck manual items.'
    );
}

// ---- Auto-Check Rules ----

function runAutoChecks_(campaigns, keywords, searchTerms) {
    var results = {};

    var active = campaigns.filter(function (c) {
        var s = String(c['Campaign Status'] || c['Campaign status'] || c['Status'] || '').toLowerCase();
        return s === 'active' || s === 'enabled';
    });

    // Manual bidding
    var manual = active.filter(function (c) {
        var bid = String(c['Bid Strategy'] || c['Bid strategy'] || c['Bid Strategy Type'] || '').toLowerCase();
        return bid.indexOf('manual') >= 0;
    });
    results.bid_smart = { pass: manual.length === 0, note: manual.length > 0 ? manual.length + ' campaigns on Manual CPC' : 'All using Smart Bidding' };

    // CPA alignment
    var misaligned = active.filter(function (c) {
        var target = parseNum(c['Target CPA'] || c['Target CPA'] || 0);
        var actual = parseNum(c['CPA'] || c['Cost / conv.'] || 0);
        return target > 0 && actual > 0 && Math.abs(actual - target) / target > 0.2;
    });
    results.bid_alignment = { pass: misaligned.length === 0, note: misaligned.length > 0 ? misaligned.length + ' campaigns CPA > 20% off target' : 'All aligned' };

    // Budget limited
    var budgetLimited = active.filter(function (c) {
        return parsePct(c['Search Lost IS (budget)'] || c['Search lost IS (budget)'] || 0) > 15;
    });
    results.budget_limited = { pass: budgetLimited.length === 0, note: budgetLimited.length > 0 ? budgetLimited.length + ' campaigns losing >15% IS to budget' : 'No budget constraints' };

    // Negative keyword waste
    var waste = searchTerms.filter(function (st) {
        return parseNum(st['Conversions'] || st['Conv.'] || st['Conv'] || 0) === 0 && parseNum(st['Cost']) > 100;
    });
    results.neg_waste = { pass: waste.length === 0, note: waste.length > 0 ? waste.length + ' queries with $100+ spend, 0 conv' : 'No major waste' };

    // QS average
    var totalQS = 0, countQS = 0;
    keywords.forEach(function (k) {
        var qs = parseNum(k['Quality Score'] || k['Quality score'] || k['QS'] || 0);
        if (qs > 0) { totalQS += qs; countQS++; }
    });
    var avgQS = countQS > 0 ? totalQS / countQS : 0;
    results.qs_avg = { pass: avgQS >= 6, note: countQS > 0 ? 'Avg QS: ' + avgQS.toFixed(1) + '/10' : 'No QS data' };

    // Low QS
    var lowQS = keywords.filter(function (k) {
        var qs = parseNum(k['Quality Score'] || k['Quality score'] || k['QS'] || 0);
        var status = String(k['Status'] || k['Keyword status'] || '').toLowerCase();
        return qs > 0 && qs <= 3 && (status === 'active' || status === 'enabled');
    });
    results.qs_low = { pass: lowQS.length === 0, note: lowQS.length > 0 ? lowQS.length + ' keywords with QS ≤ 3' : 'No critically low QS' };

    return results;
}

// ---- Score ----

function showAuditScore() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Audit Checklist');
    if (!sheet) { SpreadsheetApp.getUi().alert('Run the audit first.'); return; }

    var data = sheet.getDataRange().getValues();
    var pass = 0, total = 0;
    for (var i = 1; i < data.length; i++) {
        if (data[i][1] && String(data[i][1]).trim()) { total++; if (data[i][2] === true) pass++; }
    }
    var score = total > 0 ? Math.round((pass / total) * 100) : 0;
    var grade = score >= 80 ? '✅ A' : score >= 60 ? '🟡 B' : score >= 40 ? '🟠 C' : '🔴 D';
    SpreadsheetApp.getUi().alert('Score: ' + score + '/100 (' + grade + ')\nPassing: ' + pass + '/' + total);
}

function resetChecklist() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Audit Checklist');
    if (sheet) SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheet);
    SpreadsheetApp.getUi().alert('Checklist cleared. Run "Run Full Audit" to regenerate.');
}
