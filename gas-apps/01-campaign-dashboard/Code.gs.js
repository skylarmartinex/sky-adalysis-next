// ============================================================
// MINI-APP 1: CAMPAIGN HEALTH DASHBOARD
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
    var result = { kpis: {}, campaigns: [], period: period, lastRefresh: new Date().toLocaleString() };

    try {
        result.campaigns = getCampaigns_();
        result.kpis = calculateKpis_(result.campaigns);
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

// ---- Read Campaigns ----
// Column names match Google Ads script headers exactly:
// CampaignName, CampaignStatus, BidStrategy, Cost, Impressions, Clicks,
// Conversions, ConversionValue, CPC, CTR, CVR, CPA, ROAS, DailyBudget,
// SearchImpressionShare, SearchLostISBudget, SearchLostISRank

function getCampaigns_() {
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
        var conv = parseNum(r['Conversions']);
        var clicks = parseNum(r['Clicks']);
        var impressions = parseNum(r['Impressions']);
        var revenue = parseNum(r['ConversionValue']);

        return {
            name: r['CampaignName'] || '',
            status: r['CampaignStatus'] || 'ENABLED',
            type: detectType_(r['CampaignName'] || ''),
            cost: cost,
            clicks: clicks,
            impressions: impressions,
            conv: conv,
            revenue: revenue,
            cpa: parseNum(r['CPA']),
            roas: parseNum(r['ROAS']),
            ctr: parseNum(r['CTR']),
            cvr: parseNum(r['CVR']),
            avgCpc: parseNum(r['CPC']),
            budget: parseNum(r['DailyBudget']),
            is: parsePct(r['SearchImpressionShare']),
            isLostBudget: parsePct(r['SearchLostISBudget']),
            isLostRank: parsePct(r['SearchLostISRank']),
        };
    });
}

function detectType_(name) {
    var n = name.toLowerCase();
    if (n.indexOf('brand') >= 0 || n.indexOf('_br_') >= 0) return 'Brand';
    if (n.indexOf('competitor') >= 0 || n.indexOf('_comp_') >= 0) return 'Competitor';
    return 'Nonbrand';
}

// ---- KPI Calculation ----

function calculateKpis_(campaigns) {
    if (!campaigns.length) return { error: 'No campaign data found.' };

    var t = { cost: 0, clicks: 0, impr: 0, conv: 0, rev: 0 };
    campaigns.forEach(function (c) {
        t.cost += c.cost; t.clicks += c.clicks; t.impr += c.impressions;
        t.conv += c.conv; t.rev += c.revenue;
    });

    var cpa = t.conv > 0 ? t.cost / t.conv : 0;
    var roas = t.cost > 0 ? t.rev / t.cost : 0;
    var ctr = t.impr > 0 ? (t.clicks / t.impr) * 100 : 0;
    var cvr = t.clicks > 0 ? (t.conv / t.clicks) * 100 : 0;
    var avgCpc = t.clicks > 0 ? t.cost / t.clicks : 0;

    var dash = { text: '—', color: '#94a3b8' };
    return {
        tiles: [
            { label: 'Cost', value: fmtUsd(t.cost), delta: dash },
            { label: 'Clicks', value: fmtNum(t.clicks), delta: dash },
            { label: 'Impressions', value: fmtNum(t.impr), delta: dash },
            { label: 'Conversions', value: fmtNum(t.conv), delta: dash },
            { label: 'CPA', value: '$' + cpa.toFixed(0), delta: dash },
            { label: 'ROAS', value: fmtRoas(roas), delta: dash },
            { label: 'CTR', value: fmtPct(ctr), delta: dash },
            { label: 'CVR', value: fmtPct(cvr), delta: dash },
            { label: 'Avg CPC', value: '$' + fmtDec2(avgCpc), delta: dash },
        ],
        periodLabel: 'Campaign totals (' + campaigns.length + ' campaigns)',
        dataPoints: campaigns.length,
        comparisonPoints: 'n/a',
    };
}

// ---- Formatting ----

function applyCampaignFormatting_(sheet) {
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return;
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(function (h) { return String(h).trim(); });

    var cpaCol = findCol(headers, ['CPA']) + 1;
    if (cpaCol > 0) {
        var cpaRange = sheet.getRange(2, cpaCol, lastRow - 1, 1);
        var rules = sheet.getConditionalFormatRules();
        rules.push(SpreadsheetApp.newConditionalFormatRule()
            .whenNumberGreaterThan(100).setBackground('#fecaca').setFontColor('#991b1b')
            .setRanges([cpaRange]).build());
        rules.push(SpreadsheetApp.newConditionalFormatRule()
            .whenNumberLessThanOrEqualTo(50).setBackground('#bbf7d0').setFontColor('#166534')
            .setRanges([cpaRange]).build());
        sheet.setConditionalFormatRules(rules);
    }
}
