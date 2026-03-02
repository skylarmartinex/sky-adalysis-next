// ============================================================
// MINI-APP 4: WEEKLY REPORT GENERATOR
// Paste into Apps Script editor of a new Google Sheet
// Also paste Utils.gs from _shared/
// ============================================================

function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu('⚡ Adalysis')
        .addItem('📝 Generate Weekly Report', 'generateWeeklyReport')
        .addItem('📧 Email Report as PDF', 'emailReport')
        .addSeparator()
        .addSubMenu(
            SpreadsheetApp.getUi().createMenu('⚙️ Setup')
                .addItem('Set Report Email', 'promptReportEmail')
        )
        .addToUi();
}

function promptReportEmail() {
    var ui = SpreadsheetApp.getUi();
    var response = ui.prompt('Report Email', 'Enter the email to send reports to:', ui.ButtonSet.OK_CANCEL);
    if (response.getSelectedButton() === ui.Button.OK) {
        PropertiesService.getScriptProperties().setProperty('REPORT_EMAIL', response.getResponseText().trim());
        ui.alert('Email saved.');
    }
}

function findCol_(headers, possibleNames) {
    for (var i = 0; i < possibleNames.length; i++) {
        var idx = headers.indexOf(possibleNames[i]);
        if (idx >= 0) return idx;
    }
    return -1;
}

// ---- Report Generation ----

function generateWeeklyReport() {
    var ui = SpreadsheetApp.getUi();

    try {
        // Read directly from your automated Campaigns sheet
        var data = getSheetData('CAMPAIGNS');
        var campaigns = parseTable(data).map(function (r) {
            var cost = parseNum(r['Cost']);
            var conv = parseNum(r['Conversions'] || r['Conv.'] || r['Conv']);
            var revenue = parseNum(r['Conv. value'] || r['Revenue'] || r['Conversion value']);
            return {
                name: r['Campaign'] || r['Campaign name'] || '',
                cost: cost,
                conv: conv,
                revenue: revenue,
                cpa: conv > 0 ? cost / conv : 0,
                roas: cost > 0 ? revenue / cost : 0,
                isLostBudget: parsePct(r['Search Lost IS (budget)'] || r['Search lost IS (budget)'] || 0),
            };
        });

        if (!campaigns.length) {
            ui.alert('No campaign data found in your Campaigns sheet.');
            return;
        }

        campaigns.sort(function (a, b) { return b.cost - a.cost; });

        var topCamps = campaigns.slice(0, 5);
        var alertCamps = campaigns.filter(function (c) { return c.cpa > 120 || c.isLostBudget > 15; });
        var wins = generateWins_(campaigns);
        var challenges = generateChallenges_(campaigns);
        var nextSteps = generateNextSteps_(alertCamps);

        // Totals
        var total = { cost: 0, conv: 0, rev: 0 };
        campaigns.forEach(function (c) { total.cost += c.cost; total.conv += c.conv; total.rev += c.revenue; });
        var totalCPA = total.conv > 0 ? total.cost / total.conv : 0;
        var totalROAS = total.cost > 0 ? total.rev / total.cost : 0;

        // Create Google Doc
        var now = new Date();
        var weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
        var dateRange = Utilities.formatDate(weekAgo, Session.getScriptTimeZone(), 'MMM dd') +
            ' – ' + Utilities.formatDate(now, Session.getScriptTimeZone(), 'MMM dd, yyyy');

        var doc = DocumentApp.create('Weekly PPC Report — ' + dateRange);
        var body = doc.getBody();
        body.setAttributes({ 'FONT_FAMILY': 'Arial', 'FONT_SIZE': 10 });

        // Title
        body.appendParagraph('Weekly PPC Performance Report')
            .setHeading(DocumentApp.ParagraphHeading.HEADING1)
            .setAttributes({ 'FONT_SIZE': 18, 'BOLD': true });
        body.appendParagraph(dateRange)
            .setAttributes({ 'FONT_SIZE': 12, 'FOREGROUND_COLOR': '#64748b', 'ITALIC': true });

        // Summary
        body.appendParagraph('').appendHorizontalRule();
        body.appendParagraph('Performance Summary').setHeading(DocumentApp.ParagraphHeading.HEADING2);

        var kpiTable = body.appendTable();
        var hdr = kpiTable.appendTableRow();
        ['Metric', 'Value'].forEach(function (h) {
            hdr.appendTableCell(h).setAttributes({ 'BOLD': true, 'BACKGROUND_COLOR': '#1e293b', 'FOREGROUND_COLOR': '#e2e8f0' });
        });
        [
            ['Total Cost', fmtUsdFull(total.cost)],
            ['Total Conversions', String(Math.round(total.conv))],
            ['Avg CPA', '$' + totalCPA.toFixed(0)],
            ['ROAS', totalROAS.toFixed(2) + 'x'],
            ['Active Campaigns', String(campaigns.length)],
        ].forEach(function (row) {
            var r = kpiTable.appendTableRow();
            r.appendTableCell(row[0]);
            r.appendTableCell(row[1]);
        });

        // Top Campaigns
        body.appendParagraph('').appendHorizontalRule();
        body.appendParagraph('Top Campaigns by Spend').setHeading(DocumentApp.ParagraphHeading.HEADING2);
        var campTable = body.appendTable();
        var campHdr = campTable.appendTableRow();
        ['Campaign', 'Cost', 'Conv', 'CPA', 'ROAS'].forEach(function (h) {
            campHdr.appendTableCell(h).setAttributes({ 'BOLD': true, 'BACKGROUND_COLOR': '#1e293b', 'FOREGROUND_COLOR': '#e2e8f0' });
        });
        topCamps.forEach(function (c) {
            var r = campTable.appendTableRow();
            r.appendTableCell(c.name);
            r.appendTableCell(fmtUsdFull(c.cost));
            r.appendTableCell(String(Math.round(c.conv)));
            r.appendTableCell('$' + c.cpa.toFixed(0));
            r.appendTableCell(c.roas.toFixed(2) + 'x');
        });

        // Alerts
        if (alertCamps.length > 0) {
            body.appendParagraph('').appendHorizontalRule();
            body.appendParagraph('⚠️ Campaigns Needing Attention').setHeading(DocumentApp.ParagraphHeading.HEADING2);
            alertCamps.forEach(function (c) {
                var issues = [];
                if (c.cpa > 120) issues.push('CPA $' + c.cpa.toFixed(0));
                if (c.isLostBudget > 15) issues.push('IS Lost Budget: ' + c.isLostBudget.toFixed(0) + '%');
                body.appendParagraph('• ' + c.name + ' — ' + issues.join(', '))
                    .setAttributes({ 'FOREGROUND_COLOR': '#dc2626' });
            });
        }

        // Wins + Challenges + Next Steps
        body.appendParagraph('').appendHorizontalRule();
        body.appendParagraph('✅ Wins').setHeading(DocumentApp.ParagraphHeading.HEADING2);
        wins.forEach(function (w) { body.appendParagraph('• ' + w).setAttributes({ 'FOREGROUND_COLOR': '#16a34a' }); });

        body.appendParagraph('').appendHorizontalRule();
        body.appendParagraph('⚠️ Challenges').setHeading(DocumentApp.ParagraphHeading.HEADING2);
        challenges.forEach(function (ch) { body.appendParagraph('• ' + ch).setAttributes({ 'FOREGROUND_COLOR': '#dc2626' }); });

        body.appendParagraph('').appendHorizontalRule();
        body.appendParagraph('📋 Next Steps').setHeading(DocumentApp.ParagraphHeading.HEADING2);
        nextSteps.forEach(function (ns, i) { body.appendParagraph((i + 1) + '. ' + ns); });

        doc.saveAndClose();
        PropertiesService.getScriptProperties().setProperty('LAST_REPORT_URL', doc.getUrl());

        ui.alert('✓ Weekly Report Generated!\n\nOpen: ' + doc.getUrl());
    } catch (e) {
        ui.alert('Error: ' + e.message);
    }
}

// ---- Email ----

function emailReport() {
    var email = PropertiesService.getScriptProperties().getProperty('REPORT_EMAIL');
    var docUrl = PropertiesService.getScriptProperties().getProperty('LAST_REPORT_URL');
    if (!email) { SpreadsheetApp.getUi().alert('Set report email first: Setup > Set Report Email'); return; }
    if (!docUrl) { SpreadsheetApp.getUi().alert('Generate a report first.'); return; }

    var docId = docUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (!docId) { SpreadsheetApp.getUi().alert('Could not parse doc ID.'); return; }

    var doc = DocumentApp.openById(docId[1]);
    var pdf = doc.getAs('application/pdf');
    var subject = 'Weekly PPC Report — ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MMM dd, yyyy');
    GmailApp.sendEmail(email, subject, 'Attached: Weekly PPC Report\n\n' + docUrl, { attachments: [pdf] });
    SpreadsheetApp.getUi().alert('✓ Report emailed to ' + email);
}

// ---- Helpers ----

function generateWins_(campaigns) {
    var wins = [];
    campaigns.forEach(function (c) {
        if (c.roas > 6) wins.push(c.name + ' achieving strong ' + c.roas.toFixed(1) + 'x ROAS');
        if (c.cpa < 30 && c.conv > 100) wins.push(c.name + ' efficient CPA at $' + c.cpa.toFixed(0));
    });
    return wins.length ? wins.slice(0, 5) : ['Account performance stable this period'];
}

function generateChallenges_(campaigns) {
    var ch = [];
    campaigns.forEach(function (c) {
        if (c.cpa > 150) ch.push(c.name + ' CPA at $' + c.cpa.toFixed(0) + ' — above target');
        if (c.isLostBudget > 15) ch.push(c.name + ' losing ' + c.isLostBudget.toFixed(0) + '% IS to budget');
    });
    return ch.length ? ch.slice(0, 5) : ['No critical challenges identified'];
}

function generateNextSteps_(alertCamps) {
    var steps = [];
    alertCamps.forEach(function (c) {
        if (c.cpa > 150) steps.push('Review bid strategy for ' + c.name);
        if (c.isLostBudget > 15) steps.push('Increase budget for ' + c.name);
    });
    steps.push('Run search term audit and add negatives');
    steps.push('Review Quality Score on underperforming keywords');
    return steps.slice(0, 7);
}
