// ============================================================
// DATA LAKE SETUP SCRIPT
// Run this in the Data Lake Google Sheet's Apps Script editor
// ============================================================

/**
 * Creates the expected tab structure in the Data Lake sheet.
 * Run once after creating the Google Sheet.
 */
function setupDataLake() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // Create tabs with headers
    var tabs = {
        'Campaigns': [
            'Campaign', 'Campaign ID', 'Account', 'Campaign Status', 'Campaign Type',
            'Bid Strategy', 'Target CPA', 'Target ROAS', 'Budget',
            'Cost', 'Clicks', 'Impressions', 'Conversions', 'Conv. value',
            'CPA', 'ROAS', 'CTR', 'CVR', 'Avg. CPC',
            'Search Impr. share', 'Search Lost IS (budget)', 'Search Lost IS (rank)',
            'Prev Cost', 'Prev Conv', 'Prev CPA', 'Prev ROAS'
        ],
        'SearchTerms': [
            'Search term', 'Campaign', 'Campaign ID', 'Ad group', 'Ad group ID',
            'Match type', 'Cost', 'Clicks', 'Impressions', 'Conversions',
            'CPA', 'Status', 'Suggested Negative', 'Theme'
        ],
        'Keywords': [
            'Keyword', 'Campaign', 'Campaign ID', 'Ad group', 'Ad group ID',
            'Match type', 'Status', 'Cost', 'Clicks', 'Impressions',
            'Conversions', 'Quality Score', 'Avg. CPC', 'Max CPC',
            'CPA', 'CTR', 'CVR'
        ],
        'DailyMetrics': [
            'Date', 'Cost', 'Clicks', 'Impressions', 'Conversions',
            'Revenue', 'CPA', 'ROAS'
        ],
        'ChangeLog': [
            'Date', 'Campaign', 'Campaign ID', 'Entity', 'Change Type',
            'Description', 'Before', 'After', 'User', 'Impact',
            'Correlated KPI Shift'
        ]
    };

    for (var tabName in tabs) {
        var sheet = getOrCreateSheet(ss, tabName);
        var headers = tabs[tabName];

        // Write headers if sheet is empty
        if (sheet.getLastRow() === 0) {
            sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        }

        formatHeaderRow(sheet);
        autoResize(sheet);
    }

    // Clean up default Sheet1 if it exists and is empty
    var sheet1 = ss.getSheetByName('Sheet1');
    if (sheet1 && sheet1.getLastRow() === 0 && ss.getSheets().length > 1) {
        ss.deleteSheet(sheet1);
    }

    SpreadsheetApp.getUi().alert(
        'Data Lake Setup Complete ✓\n\n' +
        'Created tabs: ' + Object.keys(tabs).join(', ') + '\n\n' +
        'Next steps:\n' +
        '1. Export data from Google Ads\n' +
        '2. Paste into the corresponding tabs\n' +
        '3. Copy this Sheet ID for use in mini-apps'
    );
}

/**
 * Add custom menu to the Data Lake sheet.
 */
function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu('⚡ Adalysis')
        .addItem('Setup Data Lake Tabs', 'setupDataLake')
        .addSeparator()
        .addItem('Show Sheet ID', 'showSheetId')
        .addToUi();
}

function showSheetId() {
    var id = SpreadsheetApp.getActiveSpreadsheet().getId();
    SpreadsheetApp.getUi().alert(
        'Data Lake Sheet ID:\n\n' + id + '\n\nCopy this ID and paste it when setting up each mini-app.'
    );
}
