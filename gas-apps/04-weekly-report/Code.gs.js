// ============================================================
// MINI-APP 4: WEEKLY REPORT GENERATOR
// Also paste Utils.gs from _shared/
// ============================================================
// Reads from CAMPAIGNS sheet. Column names:
// CampaignName, Cost, Conversions, ConversionValue, CPA, ROAS,
// SearchLostISBudget

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
    var r = ui.prompt('Report Email', 'Enter email to send reports to:', ui.ButtonSet.OK_CANCEL);
    if (r.getSelectedButton() === ui.Button.OK) {
        PropertiesService.getScriptProperties().setProperty('REPORT_EMAIL', r.getResponseText().trim());
        ui.alert('Email saved.');
    }
}

function generateWeeklyReport() {
    var ui = SpreadsheetApp.getUi();

    try {
        var data = getSheetData('CAMPAIGNS');
        var campaigns = parseTable(data).map(function (r) {
            var cost = parseNum(r['Cost']);
            var conv = parseNum(r['Conversions']);
            var revenue = parseNum(r['ConversionValue']);
            return {
                name: r['CampaignName'] || '',
                cost: cost, conv: conv, revenue: revenue,
                cpa: parseNum(r['CPA']),
                roas: parseNum(r['ROAS']),
                isLostBudget: parsePct(r['SearchLostISBudget']),
            };
        });

        if (!campaigns.length) { ui.alert('No campaign data found.'); return; }

        campaigns.sort(function (a, b) { return b.cost - a.cost; });
        var topCamps = campaigns.slice(0, 5);
        var alertCamps = campaigns.filter(function (c) { return c.cpa > 120 || c.isLostBudget > 15; });

        var total = { cost: 0, conv: 0, rev: 0 };
        campaigns.forEach(function (c) { total.cost += c.cost; total.conv += c.conv; total.rev += c.revenue; });
        var totalCPA = total.conv > 0 ? total.cost / total.conv : 0;
        var totalROAS = total.cost > 0 ? total.rev / total.cost : 0;

        var now = new Date();
        var weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
        var dateRange = Utilities.formatDate(weekAgo, Session.getScriptTimeZone(), 'MMM dd') +
            ' – ' + Utilities.formatDate(now, Session.getScriptTimeZone(), 'MMM dd, yyyy');

        var doc = DocumentApp.create('Weekly PPC Report — ' + dateRange);
        var body = doc.getBody();
        body.setAttributes({ 'FONT_FAMILY': 'Arial', 'FONT_SIZE': 10 });

        body.appendParagraph('Weekly PPC Performance Report')
            .setHeading(DocumentApp.ParagraphHeading.HEADING1)
            .setAttributes({ 'FONT_SIZE': 18, 'BOLD': true });
        body.appendParagraph(dateRange)
            .setAttributes({ 'FONT_SIZE': 12, 'FOREGROUND_COLOR': '#64748b', 'ITALIC': true });

        // KPI Table
        body.appendParagraph('').appendHorizontalRule();
        body.appendParagraph('Performance Summary').setHeading(DocumentApp.ParagraphHeading.HEADING2);
        var kpiTable = body.appendTable();
        var hdr = kpiTable.appendTableRow();
        ['Metric', 'Value'].forEach(function (h) {
            hdr.appendTableCell(h).setAttributes({ 'BOLD': true, 'BACKGROUND_COLOR': '#1e293b', 'FOREGROUND_COLOR': '#e2e8f0' });
        });
        [
            ['Total Cost', fmtUsdFull(total.cost)],
            ['Conversions', String(Math.round(total.conv))],
            ['Avg CPA', '$' + totalCPA.toFixed(0)],
            ['ROAS', totalROAS.toFixed(2) + 'x'],
            ['Campaigns', String(campaigns.length)],
        ].forEach(function (row) { var r = kpiTable.appendTableRow(); r.appendTableCell(row[0]); r.appendTableCell(row[1]); });

        // Top Campaigns
        body.appendParagraph('').appendHorizontalRule();
        body.appendParagraph('Top Campaigns by Spend').setHeading(DocumentApp.ParagraphHeading.HEADING2);
        var ct = body.appendTable();
        var ch = ct.appendTableRow();
        ['Campaign', 'Cost', 'Conv', 'CPA', 'ROAS'].forEach(function (h) {
            ch.appendTableCell(h).setAttributes({ 'BOLD': true, 'BACKGROUND_COLOR': '#1e293b', 'FOREGROUND_COLOR': '#e2e8f0' });
        });
        topCamps.forEach(function (c) {
            var r = ct.appendTableRow();
            r.appendTableCell(c.name); r.appendTableCell(fmtUsdFull(c.cost));
            r.appendTableCell(String(Math.round(c.conv)));
            r.appendTableCell('$' + c.cpa.toFixed(0)); r.appendTableCell(c.roas.toFixed(2) + 'x');
        });

        // Alerts
        if (alertCamps.length > 0) {
            body.appendParagraph('').appendHorizontalRule();
            body.appendParagraph('⚠️ Campaigns Needing Attention').setHeading(DocumentApp.ParagraphHeading.HEADING2);
            alertCamps.forEach(function (c) {
                var issues = [];
                if (c.cpa > 120) issues.push('CPA $' + c.cpa.toFixed(0));
                if (c.isLostBudget > 15) issues.push('IS Lost Budget: ' + c.isLostBudget.toFixed(0) + '%');
                body.appendParagraph('• ' + c.name + ' — ' + issues.join(', ')).setAttributes({ 'FOREGROUND_COLOR': '#dc2626' });
            });
        }

        // Next Steps
        body.appendParagraph('').appendHorizontalRule();
        body.appendParagraph('📋 Next Steps').setHeading(DocumentApp.ParagraphHeading.HEADING2);
        var steps = [];
        alertCamps.forEach(function (c) {
            if (c.cpa > 150) steps.push('Review bid strategy for ' + c.name);
            if (c.isLostBudget > 15) steps.push('Increase budget for ' + c.name);
        });
        steps.push('Run search term audit and add negatives');
        steps.push('Review Quality Score on underperforming keywords');
        steps.slice(0, 7).forEach(function (s, i) { body.appendParagraph((i + 1) + '. ' + s); });

        doc.saveAndClose();
        PropertiesService.getScriptProperties().setProperty('LAST_REPORT_URL', doc.getUrl());
        ui.alert('✓ Report Generated!\n\n' + doc.getUrl());
    } catch (e) {
        ui.alert('Error: ' + e.message);
    }
}

function emailReport() {
    var email = PropertiesService.getScriptProperties().getProperty('REPORT_EMAIL');
    var docUrl = PropertiesService.getScriptProperties().getProperty('LAST_REPORT_URL');
    if (!email) { SpreadsheetApp.getUi().alert('Set email first: Setup > Set Report Email'); return; }
    if (!docUrl) { SpreadsheetApp.getUi().alert('Generate a report first.'); return; }
    var docId = docUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (!docId) { SpreadsheetApp.getUi().alert('Could not parse doc ID.'); return; }
    var doc = DocumentApp.openById(docId[1]);
    var pdf = doc.getAs('application/pdf');
    GmailApp.sendEmail(email,
        'Weekly PPC Report — ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MMM dd, yyyy'),
        'Attached: Weekly PPC Report\n\n' + docUrl, { attachments: [pdf] });
    SpreadsheetApp.getUi().alert('✓ Report emailed to ' + email);
}
