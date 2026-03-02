// ============================================================
// MINI-APP 1: CAMPAIGN HEALTH DASHBOARD
// Paste into Apps Script editor of a new Google Sheet
// Also paste Utils.gs from _shared/
// ============================================================

/**
 * Menu setup — runs when the sheet opens.
 */
function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu('⚡ Adalysis')
        .addItem('📊 Open Dashboard', 'openDashboard')
        .addSeparator()
        .addItem('🔄 Refresh Campaign Data', 'refreshCampaigns')
        .addItem('🔄 Refresh Daily Metrics', 'refreshDailyMetrics')
        .addSeparator()
        .addSubMenu(
            SpreadsheetApp.getUi().createMenu('⚙️ Setup')
                .addItem('Set Data Lake Sheet ID', 'promptDataLakeId')
        )
        .addToUi();
}

// ---- Setup ----

function promptDataLakeId() {
    var ui = SpreadsheetApp.getUi();
    var response = ui.prompt(
        'Data Lake Sheet ID',
        'Enter the Google Sheet ID of your Ads Data Lake:',
        ui.ButtonSet.OK_CANCEL
    );
    if (response.getSelectedButton() === ui.Button.OK) {
        var id = response.getResponseText().trim();
        if (id) {
            setDataLakeId(id);
        }
    }
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
 * Returns a JSON-serializable object.
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
        // Get daily metrics for KPIs
        var dailyData = getDailyMetricsLocal();
        result.kpis = calculateKpis(dailyData, period);

        // Get campaign data
        result.campaigns = getCampaignsLocal();
    } catch (e) {
        result.error = e.message;
    }

    return result;
}

// ---- Data Refresh ----

function refreshCampaigns() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    try {
        var data = getDataLakeTab('Campaigns');
        var sheet = getOrCreateSheet(ss, 'Campaigns');
        writeTable(sheet, data);
        formatHeaderRow(sheet);
        applyCampaignFormatting(sheet);
        autoResize(sheet);
        SpreadsheetApp.getUi().alert('✓ Campaigns refreshed — ' + (data.length - 1) + ' rows loaded.');
    } catch (e) {
        SpreadsheetApp.getUi().alert('Error: ' + e.message);
    }
}

function refreshDailyMetrics() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    try {
        var data = getDataLakeTab('DailyMetrics');
        var sheet = getOrCreateSheet(ss, 'DailyMetrics');
        writeTable(sheet, data);
        formatHeaderRow(sheet);
        autoResize(sheet);
        SpreadsheetApp.getUi().alert('✓ Daily metrics refreshed — ' + (data.length - 1) + ' rows loaded.');
    } catch (e) {
        SpreadsheetApp.getUi().alert('Error: ' + e.message);
    }
}

// ---- Local Data Reading ----

function getCampaignsLocal() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Campaigns');
    if (!sheet || sheet.getLastRow() < 2) return [];

    var data = sheet.getDataRange().getValues();
    var rows = parseTable(data);

    return rows.map(function (r) {
        var cost = parseNum(r['Cost']);
        var conv = parseNum(r['Conversions']);
        var clicks = parseNum(r['Clicks']);
        var impressions = parseNum(r['Impressions']);
        var revenue = parseNum(r['Conv. value']);

        return {
            name: r['Campaign'] || '',
            status: r['Campaign Status'] || 'Active',
            type: r['Campaign Type'] || 'Nonbrand',
            bidStrategy: r['Bid Strategy'] || r['Bid Strategy Type'] || '',
            budget: parseNum(r['Budget']),
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
            is: parsePct(r['Search Impr. share']),
            isLostBudget: parsePct(r['Search Lost IS (budget)']),
            isLostRank: parsePct(r['Search Lost IS (rank)']),
            prevCost: parseNum(r['Prev Cost']),
            prevConv: parseNum(r['Prev Conv']),
            prevCPA: parseNum(r['Prev CPA']),
        };
    });
}

function getDailyMetricsLocal() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('DailyMetrics');
    if (!sheet || sheet.getLastRow() < 2) return [];

    var data = sheet.getDataRange().getValues();
    var rows = parseTable(data);

    return rows.map(function (r) {
        return {
            date: r['Date'] ? Utilities.formatDate(new Date(r['Date']), Session.getScriptTimeZone(), 'yyyy-MM-dd') : '',
            cost: parseNum(r['Cost']),
            clicks: parseNum(r['Clicks']),
            impressions: parseNum(r['Impressions']),
            conv: parseNum(r['Conversions']),
            revenue: parseNum(r['Revenue']),
            cpa: parseNum(r['CPA']),
            roas: parseNum(r['ROAS']),
        };
    }).sort(function (a, b) {
        return a.date < b.date ? -1 : 1;
    });
}

// ---- KPI Calculation ----

function calculateKpis(dailyData, period) {
    if (!dailyData.length) {
        return { error: 'No daily metrics. Refresh data first.' };
    }

    var current = dailyData.slice(-period);
    var previous = dailyData.slice(-period * 2, -period);

    function sum(arr, key) {
        return arr.reduce(function (s, d) { return s + (d[key] || 0); }, 0);
    }

    var curCost = sum(current, 'cost');
    var prevCost = sum(previous, 'cost');
    var curClicks = sum(current, 'clicks');
    var prevClicks = sum(previous, 'clicks');
    var curImpr = sum(current, 'impressions');
    var prevImpr = sum(previous, 'impressions');
    var curConv = sum(current, 'conv');
    var prevConv = sum(previous, 'conv');
    var curRev = sum(current, 'revenue');
    var prevRev = sum(previous, 'revenue');

    var curCPA = curConv > 0 ? curCost / curConv : 0;
    var prevCPA = prevConv > 0 ? prevCost / prevConv : 0;
    var curROAS = curCost > 0 ? curRev / curCost : 0;
    var prevROAS = prevCost > 0 ? prevRev / prevCost : 0;
    var curCTR = curImpr > 0 ? (curClicks / curImpr) * 100 : 0;
    var prevCTR = prevImpr > 0 ? (prevClicks / prevImpr) * 100 : 0;
    var curCVR = curClicks > 0 ? (curConv / curClicks) * 100 : 0;
    var prevCVR = prevClicks > 0 ? (prevConv / prevClicks) * 100 : 0;
    var curAvgCPC = curClicks > 0 ? curCost / curClicks : 0;
    var prevAvgCPC = prevClicks > 0 ? prevCost / prevClicks : 0;

    return {
        tiles: [
            { label: 'Cost', value: fmtUsd(curCost), delta: fmtDelta(pctDelta(curCost, prevCost), true) },
            { label: 'Clicks', value: fmtNum(curClicks), delta: fmtDelta(pctDelta(curClicks, prevClicks)) },
            { label: 'Impressions', value: fmtNum(curImpr), delta: fmtDelta(pctDelta(curImpr, prevImpr)) },
            { label: 'Conversions', value: fmtNum(curConv), delta: fmtDelta(pctDelta(curConv, prevConv)) },
            { label: 'CPA', value: '$' + curCPA.toFixed(0), delta: fmtDelta(pctDelta(curCPA, prevCPA), true) },
            { label: 'ROAS', value: fmtRoas(curROAS), delta: fmtDelta(pctDelta(curROAS, prevROAS)) },
            { label: 'CTR', value: fmtPct(curCTR), delta: fmtDelta(pctDelta(curCTR, prevCTR)) },
            { label: 'CVR', value: fmtPct(curCVR), delta: fmtDelta(pctDelta(curCVR, prevCVR)) },
            { label: 'Avg CPC', value: '$' + fmtDec2(curAvgCPC), delta: fmtDelta(pctDelta(curAvgCPC, prevAvgCPC), true) },
        ],
        periodLabel: period + '-day comparison',
        dataPoints: current.length,
        comparisonPoints: previous.length,
    };
}

// ---- Conditional Formatting ----

function applyCampaignFormatting(sheet) {
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return;

    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    // Find column indices
    var cpaCol = headers.indexOf('CPA') + 1;
    var isCol = headers.indexOf('Search Impr. share') + 1;
    var statusCol = headers.indexOf('Campaign Status') + 1;

    // CPA > $100 = red background
    if (cpaCol > 0) {
        var cpaRange = sheet.getRange(2, cpaCol, lastRow - 1, 1);
        var rule1 = SpreadsheetApp.newConditionalFormatRule()
            .whenNumberGreaterThan(100)
            .setBackground('#fecaca')
            .setFontColor('#991b1b')
            .setRanges([cpaRange])
            .build();

        var rule2 = SpreadsheetApp.newConditionalFormatRule()
            .whenNumberLessThanOrEqualTo(50)
            .setBackground('#bbf7d0')
            .setFontColor('#166534')
            .setRanges([cpaRange])
            .build();

        var rules = sheet.getConditionalFormatRules();
        rules.push(rule1, rule2);
        sheet.setConditionalFormatRules(rules);
    }

    // IS < 50% = yellow
    if (isCol > 0) {
        var isRange = sheet.getRange(2, isCol, lastRow - 1, 1);
        var rule3 = SpreadsheetApp.newConditionalFormatRule()
            .whenNumberLessThan(50)
            .setBackground('#fef9c3')
            .setFontColor('#854d0e')
            .setRanges([isRange])
            .build();

        var rules = sheet.getConditionalFormatRules();
        rules.push(rule3);
        sheet.setConditionalFormatRules(rules);
    }
}
