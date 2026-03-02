// ============================================================
// MINI-APP 1: CAMPAIGN HEALTH DASHBOARD
// Paste into Apps Script editor of a new Google Sheet
// Also paste Utils.gs from _shared/
// ============================================================

function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu('⚡ Adalysis')
        .addItem('📊 Open Dashboard', 'openDashboard')
        .addSeparator()
        .addItem('🔄 Refresh Campaign Data', 'refreshCampaigns')
        .addToUi();
}

// ---- Dashboard Sidebar ----

function openDashboard() {
    var html = HtmlService.createHtmlOutputFromFile('Sidebar')
        .setTitle('Campaign Dashboard')
        .setWidth(380);
    SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Called from the sidebar to get all dashboard data.
 */
function getDashboardData(period) {
    period = period || 30;

    var result = {
        kpis: {},
        campaigns: [],
        period: period,
        lastRefresh: new Date().toLocaleString(),
    };

    try {
        result.campaigns = getCampaignsFromSource_();
        // KPIs are calculated from campaign-level data
        result.kpis = calculateKpisFromCampaigns_(result.campaigns, period);
    } catch (e) {
        result.error = e.message;
    }

    return result;
}

// ---- Data Refresh ----

function refreshCampaigns() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    try {
        var data = getSheetData('CAMPAIGNS');
        var sheet = getOrCreateSheet(ss, 'Campaigns');
        writeTable(sheet, data);
        formatHeaderRow(sheet);
        applyCampaignFormatting_(sheet);
        autoResize(sheet);
        SpreadsheetApp.getUi().alert('✓ Campaigns refreshed — ' + (data.length - 1) + ' rows loaded.');
    } catch (e) {
        SpreadsheetApp.getUi().alert('Error: ' + e.message);
    }
}

// ---- Read Campaign Data ----

function getCampaignsFromSource_() {
    // Try local sheet first, fall back to source
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Campaigns');

    var data;
    if (sheet && sheet.getLastRow() >= 2) {
        data = sheet.getDataRange().getValues();
    } else {
        data = getSheetData('CAMPAIGNS');
    }

    var rows = parseTable(data);

    return rows.map(function (r) {
        var cost = parseNum(r['Cost']);
        var conv = parseNum(r['Conversions'] || r['Conv.'] || r['Conv']);
        var clicks = parseNum(r['Clicks']);
        var impressions = parseNum(r['Impressions'] || r['Impr.'] || r['Impr']);
        var revenue = parseNum(r['Conv. value'] || r['Revenue'] || r['Conversion value']);

        return {
            name: r['Campaign'] || r['Campaign name'] || '',
            status: r['Campaign Status'] || r['Campaign status'] || r['Status'] || 'Active',
            type: detectCampaignType_(r['Campaign'] || r['Campaign name'] || ''),
            cost: cost,
            clicks: clicks,
            impressions: impressions,
            conv: conv,
            revenue: revenue,
            cpa: conv > 0 ? cost / conv : 0,
            roas: cost > 0 ? revenue / cost : 0,
            ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
            cvr: clicks > 0 ? (conv / clicks) * 100 : 0,
            avgCpc: clicks > 0 ? cost / clicks : 0,
            is: parsePct(r['Search Impr. share'] || r['Search impr. share'] || r['Impr. (Top) %'] || 0),
            isLostBudget: parsePct(r['Search Lost IS (budget)'] || r['Search lost IS (budget)'] || 0),
        };
    });
}

/**
 * Auto-detect campaign type from name.
 */
function detectCampaignType_(name) {
    var n = name.toLowerCase();
    if (n.indexOf('brand') >= 0) return 'Brand';
    if (n.indexOf('competitor') >= 0 || n.indexOf('comp') >= 0) return 'Competitor';
    return 'Nonbrand';
}

// ---- KPI Calculation ----

function calculateKpisFromCampaigns_(campaigns, period) {
    if (!campaigns.length) {
        return { error: 'No campaign data found.' };
    }

    // With campaign-level data (not daily), we show totals and can't do period comparison
    // If you have daily metrics, switch to the daily-based calculation
    var totals = { cost: 0, clicks: 0, impr: 0, conv: 0, rev: 0 };

    campaigns.forEach(function (c) {
        totals.cost += c.cost;
        totals.clicks += c.clicks;
        totals.impr += c.impressions;
        totals.conv += c.conv;
        totals.rev += c.revenue;
    });

    var cpa = totals.conv > 0 ? totals.cost / totals.conv : 0;
    var roas = totals.cost > 0 ? totals.rev / totals.cost : 0;
    var ctr = totals.impr > 0 ? (totals.clicks / totals.impr) * 100 : 0;
    var cvr = totals.clicks > 0 ? (totals.conv / totals.clicks) * 100 : 0;
    var avgCpc = totals.clicks > 0 ? totals.cost / totals.clicks : 0;

    return {
        tiles: [
            { label: 'Cost', value: fmtUsd(totals.cost), delta: { text: '—', color: '#94a3b8' } },
            { label: 'Clicks', value: fmtNum(totals.clicks), delta: { text: '—', color: '#94a3b8' } },
            { label: 'Impressions', value: fmtNum(totals.impr), delta: { text: '—', color: '#94a3b8' } },
            { label: 'Conversions', value: fmtNum(totals.conv), delta: { text: '—', color: '#94a3b8' } },
            { label: 'CPA', value: '$' + cpa.toFixed(0), delta: { text: '—', color: '#94a3b8' } },
            { label: 'ROAS', value: fmtRoas(roas), delta: { text: '—', color: '#94a3b8' } },
            { label: 'CTR', value: fmtPct(ctr), delta: { text: '—', color: '#94a3b8' } },
            { label: 'CVR', value: fmtPct(cvr), delta: { text: '—', color: '#94a3b8' } },
            { label: 'Avg CPC', value: '$' + fmtDec2(avgCpc), delta: { text: '—', color: '#94a3b8' } },
        ],
        periodLabel: 'Campaign totals (from automated sheet)',
        dataPoints: campaigns.length + ' campaigns',
        comparisonPoints: 'n/a',
    };
}

// ---- Conditional Formatting ----

function applyCampaignFormatting_(sheet) {
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return;

    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    // Find CPA column (try multiple possible names)
    var cpaNames = ['CPA', 'Cost / conv.', 'Cost/conv.'];
    var cpaCol = -1;
    for (var i = 0; i < cpaNames.length; i++) {
        var idx = headers.indexOf(cpaNames[i]);
        if (idx >= 0) { cpaCol = idx + 1; break; }
    }

    if (cpaCol > 0) {
        var cpaRange = sheet.getRange(2, cpaCol, lastRow - 1, 1);
        var rules = sheet.getConditionalFormatRules();

        rules.push(SpreadsheetApp.newConditionalFormatRule()
            .whenNumberGreaterThan(100)
            .setBackground('#fecaca').setFontColor('#991b1b')
            .setRanges([cpaRange]).build());

        rules.push(SpreadsheetApp.newConditionalFormatRule()
            .whenNumberLessThanOrEqualTo(50)
            .setBackground('#bbf7d0').setFontColor('#166534')
            .setRanges([cpaRange]).build());

        sheet.setConditionalFormatRules(rules);
    }
}
