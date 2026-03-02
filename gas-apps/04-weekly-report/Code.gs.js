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
                .addItem('Set Data Lake Sheet ID', 'promptDataLakeId')
                .addItem('Set Report Email', 'promptReportEmail')
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

function promptReportEmail() {
    var ui = SpreadsheetApp.getUi();
    var response = ui.prompt('Report Email',
        'Enter the email to send reports to:', ui.ButtonSet.OK_CANCEL);
    if (response.getSelectedButton() === ui.Button.OK) {
        PropertiesService.getScriptProperties().setProperty('REPORT_EMAIL', response.getResponseText().trim());
        ui.alert('Email saved.');
    }
}

// ---- Report Generation ----

function generateWeeklyReport() {
    var ui = SpreadsheetApp.getUi();

    try {
        var campaigns = getCampaignData_();
        var dailyMetrics = getDailyData_();

        if (campaigns.length === 0) {
            ui.alert('No campaign data. Set up Data Lake and refresh data first.');
            return;
        }

        // Calculate KPIs (last 7 days vs prior 7 days)
        var current = dailyMetrics.slice(-7);
        var previous = dailyMetrics.slice(-14, -7);

        var kpis = calcPeriodKpis_(current, previous);

        // Sort campaigns by cost
        campaigns.sort(function (a, b) { return b.cost - a.cost; });

        // Identify top performers and alert campaigns
        var topCamps = campaigns.slice(0, 5);
        var alertCamps = campaigns.filter(function (c) {
            return c.cpa > 120 || c.isLostBudget > 15;
        });

        // Generate wins and challenges
        var wins = generateWins_(campaigns, kpis);
        var challenges = generateChallenges_(campaigns, kpis);
        var nextSteps = generateNextSteps_(alertCamps);

        // Create Google Doc
        var now = new Date();
        var weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        var dateRange = Utilities.formatDate(weekAgo, Session.getScriptTimeZone(), 'MMM dd') +
            ' – ' + Utilities.formatDate(now, Session.getScriptTimeZone(), 'MMM dd, yyyy');

        var doc = DocumentApp.create('Weekly PPC Report — ' + dateRange);
        var body = doc.getBody();

        // Style: Font
        body.setAttributes({
            'FONT_FAMILY': 'Arial',
            'FONT_SIZE': 10,
        });

        // Title
        body.appendParagraph('Weekly PPC Performance Report')
            .setHeading(DocumentApp.ParagraphHeading.HEADING1)
            .setAttributes({ 'FONT_SIZE': 18, 'BOLD': true });

        body.appendParagraph(dateRange)
            .setAttributes({ 'FONT_SIZE': 12, 'FOREGROUND_COLOR': '#64748b', 'ITALIC': true });

        body.appendParagraph('Generated: ' + now.toLocaleString())
            .setAttributes({ 'FONT_SIZE': 9, 'FOREGROUND_COLOR': '#94a3b8' });

        // Summary KPIs
        body.appendParagraph('').appendHorizontalRule();
        body.appendParagraph('Performance Summary')
            .setHeading(DocumentApp.ParagraphHeading.HEADING2);

        var kpiTable = body.appendTable();
        var headerRow = kpiTable.appendTableRow();
        ['Metric', 'This Week', 'Last Week', 'Change'].forEach(function (h) {
            headerRow.appendTableCell(h).setAttributes({ 'BOLD': true, 'BACKGROUND_COLOR': '#1e293b', 'FOREGROUND_COLOR': '#e2e8f0' });
        });

        kpis.forEach(function (kpi) {
            var row = kpiTable.appendTableRow();
            row.appendTableCell(kpi.label);
            row.appendTableCell(kpi.current);
            row.appendTableCell(kpi.previous);
            var changeCell = row.appendTableCell(kpi.change);
            if (kpi.changeColor) changeCell.setAttributes({ 'FOREGROUND_COLOR': kpi.changeColor });
        });

        // Top Campaigns
        body.appendParagraph('').appendHorizontalRule();
        body.appendParagraph('Top Campaigns by Spend')
            .setHeading(DocumentApp.ParagraphHeading.HEADING2);

        var campTable = body.appendTable();
        var campHeader = campTable.appendTableRow();
        ['Campaign', 'Cost', 'Conv', 'CPA', 'ROAS'].forEach(function (h) {
            campHeader.appendTableCell(h).setAttributes({ 'BOLD': true, 'BACKGROUND_COLOR': '#1e293b', 'FOREGROUND_COLOR': '#e2e8f0' });
        });

        topCamps.forEach(function (c) {
            var row = campTable.appendTableRow();
            row.appendTableCell(c.name);
            row.appendTableCell(fmtUsdFull(c.cost));
            row.appendTableCell(String(Math.round(c.conv)));
            row.appendTableCell('$' + c.cpa.toFixed(0));
            row.appendTableCell(c.roas.toFixed(2) + 'x');
        });

        // Alerts
        if (alertCamps.length > 0) {
            body.appendParagraph('').appendHorizontalRule();
            body.appendParagraph('⚠️ Campaigns Needing Attention')
                .setHeading(DocumentApp.ParagraphHeading.HEADING2);

            alertCamps.forEach(function (c) {
                var issues = [];
                if (c.cpa > 120) issues.push('CPA $' + c.cpa.toFixed(0) + ' (above threshold)');
                if (c.isLostBudget > 15) issues.push('IS Lost Budget: ' + c.isLostBudget.toFixed(0) + '%');

                body.appendParagraph('• ' + c.name + ' — ' + issues.join(', '))
                    .setAttributes({ 'FOREGROUND_COLOR': '#dc2626' });
            });
        }

        // Wins
        body.appendParagraph('').appendHorizontalRule();
        body.appendParagraph('✅ Wins')
            .setHeading(DocumentApp.ParagraphHeading.HEADING2);
        wins.forEach(function (w) {
            body.appendParagraph('• ' + w)
                .setAttributes({ 'FOREGROUND_COLOR': '#16a34a' });
        });

        // Challenges
        body.appendParagraph('').appendHorizontalRule();
        body.appendParagraph('⚠️ Challenges')
            .setHeading(DocumentApp.ParagraphHeading.HEADING2);
        challenges.forEach(function (ch) {
            body.appendParagraph('• ' + ch)
                .setAttributes({ 'FOREGROUND_COLOR': '#dc2626' });
        });

        // Next Steps
        body.appendParagraph('').appendHorizontalRule();
        body.appendParagraph('📋 Next Steps')
            .setHeading(DocumentApp.ParagraphHeading.HEADING2);
        nextSteps.forEach(function (ns, i) {
            body.appendParagraph((i + 1) + '. ' + ns);
        });

        doc.saveAndClose();

        // Save doc URL
        var docUrl = doc.getUrl();
        PropertiesService.getScriptProperties().setProperty('LAST_REPORT_URL', docUrl);

        ui.alert(
            '✓ Weekly Report Generated!\n\n' +
            'Open report:\n' + docUrl + '\n\n' +
            'Use "Email Report as PDF" to send it.'
        );

    } catch (e) {
        ui.alert('Error generating report: ' + e.message);
    }
}

// ---- Email ----

function emailReport() {
    var email = PropertiesService.getScriptProperties().getProperty('REPORT_EMAIL');
    var docUrl = PropertiesService.getScriptProperties().getProperty('LAST_REPORT_URL');

    if (!email) {
        SpreadsheetApp.getUi().alert('Set report email first: Setup > Set Report Email');
        return;
    }

    if (!docUrl) {
        SpreadsheetApp.getUi().alert('Generate a report first: Generate Weekly Report');
        return;
    }

    // Get doc ID from URL
    var docId = docUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (!docId) {
        SpreadsheetApp.getUi().alert('Could not parse doc ID. Generate a new report.');
        return;
    }

    var doc = DocumentApp.openById(docId[1]);
    var pdf = doc.getAs('application/pdf');

    var now = new Date();
    var subject = 'Weekly PPC Report — ' + Utilities.formatDate(now, Session.getScriptTimeZone(), 'MMM dd, yyyy');

    GmailApp.sendEmail(email, subject,
        'Attached: Weekly PPC Performance Report\n\nFull report: ' + docUrl,
        { attachments: [pdf] }
    );

    SpreadsheetApp.getUi().alert('✓ Report emailed to ' + email);
}

// ---- Helper Functions ----

function getCampaignData_() {
    try {
        var data = getDataLakeTab('Campaigns');
        var rows = parseTable(data);
        return rows.map(function (r) {
            var cost = parseNum(r['Cost']);
            var conv = parseNum(r['Conversions']);
            var revenue = parseNum(r['Conv. value']);
            var clicks = parseNum(r['Clicks']);
            var impressions = parseNum(r['Impressions']);
            return {
                name: r['Campaign'] || '',
                cost: cost, conv: conv, revenue: revenue,
                cpa: conv > 0 ? cost / conv : 0,
                roas: cost > 0 ? revenue / cost : 0,
                ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
                isLostBudget: parsePct(r['Search Lost IS (budget)']),
            };
        });
    } catch (e) { return []; }
}

function getDailyData_() {
    try {
        var data = getDataLakeTab('DailyMetrics');
        return parseTable(data).map(function (r) {
            return {
                cost: parseNum(r['Cost']),
                clicks: parseNum(r['Clicks']),
                impressions: parseNum(r['Impressions']),
                conv: parseNum(r['Conversions']),
                revenue: parseNum(r['Revenue']),
            };
        });
    } catch (e) { return []; }
}

function calcPeriodKpis_(current, previous) {
    function sum(arr, k) { return arr.reduce(function (s, d) { return s + (d[k] || 0); }, 0); }

    var cc = sum(current, 'cost'), pc = sum(previous, 'cost');
    var ck = sum(current, 'clicks'), pk = sum(previous, 'clicks');
    var cv = sum(current, 'conv'), pv = sum(previous, 'conv');
    var cr = sum(current, 'revenue'), pr = sum(previous, 'revenue');

    var ccpa = cv > 0 ? cc / cv : 0, pcpa = pv > 0 ? pc / pv : 0;
    var croas = cc > 0 ? cr / cc : 0, proas = pc > 0 ? pr / pc : 0;

    function delta(a, b) { return b === 0 ? '—' : (((a - b) / b) * 100).toFixed(1) + '%'; }
    function deltaColor(a, b, invert) {
        if (b === 0) return null;
        var d = (a - b) / b;
        return (invert ? d < 0 : d > 0) ? '#16a34a' : '#dc2626';
    }

    return [
        { label: 'Cost', current: fmtUsdFull(cc), previous: fmtUsdFull(pc), change: delta(cc, pc), changeColor: deltaColor(cc, pc, true) },
        { label: 'Clicks', current: fmtNum(ck), previous: fmtNum(pk), change: delta(ck, pk), changeColor: deltaColor(ck, pk) },
        { label: 'Conversions', current: String(Math.round(cv)), previous: String(Math.round(pv)), change: delta(cv, pv), changeColor: deltaColor(cv, pv) },
        { label: 'CPA', current: '$' + ccpa.toFixed(0), previous: '$' + pcpa.toFixed(0), change: delta(ccpa, pcpa), changeColor: deltaColor(ccpa, pcpa, true) },
        { label: 'ROAS', current: croas.toFixed(2) + 'x', previous: proas.toFixed(2) + 'x', change: delta(croas, proas), changeColor: deltaColor(croas, proas) },
    ];
}

function generateWins_(campaigns, kpis) {
    var wins = [];
    campaigns.forEach(function (c) {
        if (c.roas > 6) wins.push(c.name + ' achieving strong ' + c.roas.toFixed(1) + 'x ROAS');
        if (c.cpa < 30 && c.conv > 100) wins.push(c.name + ' maintaining efficient $' + c.cpa.toFixed(0) + ' CPA');
    });
    if (wins.length === 0) wins.push('Account performance stable this period');
    return wins.slice(0, 5);
}

function generateChallenges_(campaigns, kpis) {
    var challenges = [];
    campaigns.forEach(function (c) {
        if (c.cpa > 150) challenges.push(c.name + ' CPA at $' + c.cpa.toFixed(0) + ' — significantly above target');
        if (c.isLostBudget > 15) challenges.push(c.name + ' losing ' + c.isLostBudget.toFixed(0) + '% IS to budget');
    });
    if (challenges.length === 0) challenges.push('No critical challenges identified');
    return challenges.slice(0, 5);
}

function generateNextSteps_(alertCamps) {
    var steps = [];
    alertCamps.forEach(function (c) {
        if (c.cpa > 150) steps.push('Review bid strategy for ' + c.name + ' (CPA $' + c.cpa.toFixed(0) + ')');
        if (c.isLostBudget > 15) steps.push('Increase budget or reallocate for ' + c.name);
    });
    steps.push('Run search term audit and add negatives');
    steps.push('Review Quality Score on underperforming keywords');
    return steps.slice(0, 7);
}
