/**
 * Adobe Stock - Search Terms Report Export
 * Account: NA - Adobe Stock (509-829-4026)
 *
 * Exports daily search terms data to Google Sheets including:
 * - Search query, matched keyword, match type
 * - Core metrics (cost, impressions, clicks, conversions, conversion value)
 * - Derived metrics (CPC, CTR, CVR, CPA)
 *
 * SETUP: Replace SPREADSHEET_URL with your actual Google Sheets URL
 * SCHEDULE: Run daily
 */

var CONFIG = {
    SPREADSHEET_URL: 'https://docs.google.com/spreadsheets/d/1TzVdwRarnEvMuiMH59qfbdtruue9T9-EWBBAEiSYSik/edit',
    SHEET_NAME: 'Search Terms',
    DATE_RANGE: 'YESTERDAY',
    ACCOUNT_ID: '509-829-4026'
};

function main() {
    var spreadsheet = SpreadsheetApp.openByUrl(CONFIG.SPREADSHEET_URL);
    var sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);

    if (!sheet) {
        sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);
    }

    // Write headers if sheet is empty
    if (sheet.getLastRow() === 0) {
        var headers = [
            'Date', 'CampaignName', 'CampaignId', 'AdGroupName', 'AdGroupId',
            'SearchTerm', 'Keyword', 'MatchType',
            'Cost', 'Impressions', 'Clicks', 'Conversions', 'ConversionValue',
            'CPC', 'CTR', 'CVR', 'CPA'
        ];
        sheet.appendRow(headers);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }

    var query = 'SELECT ' +
        'segments.date, ' +
        'campaign.name, ' +
        'campaign.id, ' +
        'ad_group.name, ' +
        'ad_group.id, ' +
        'search_term_view.search_term, ' +
        'segments.keyword.info.text, ' +
        'segments.keyword.info.match_type, ' +
        'metrics.cost_micros, ' +
        'metrics.impressions, ' +
        'metrics.clicks, ' +
        'metrics.conversions, ' +
        'metrics.conversions_value ' +
        'FROM search_term_view ' +
        'WHERE segments.date DURING ' + CONFIG.DATE_RANGE + ' ' +
        'AND metrics.cost_micros > 0 ' +
        'AND metrics.impressions > 5 ' +
        'AND campaign.name NOT LIKE \'%_AWAR_%\' ' +
        'AND campaign.name NOT LIKE \'%_RLSA_%\' ' +
        'ORDER BY metrics.cost_micros DESC';

    var rows = [];
    var report = AdsApp.search(query);

    while (report.hasNext()) {
        var row = report.next();

        var cost = row.metrics.costMicros / 1000000;
        var impressions = row.metrics.impressions;
        var clicks = row.metrics.clicks;
        var conversions = row.metrics.conversions;
        var convValue = row.metrics.conversionsValue;

        var cpc = clicks > 0 ? cost / clicks : 0;
        var ctr = impressions > 0 ? clicks / impressions : 0;
        var cvr = clicks > 0 ? conversions / clicks : 0;
        var cpa = conversions > 0 ? cost / conversions : 0;

        rows.push([
            row.segments.date,
            row.campaign.name,
            row.campaign.id,
            row.adGroup.name,
            row.adGroup.id,
            row.searchTermView.searchTerm,
            row.segments.keyword.info.text || '',
            row.segments.keyword.info.matchType || '',
            cost,
            impressions,
            clicks,
            conversions,
            convValue,
            cpc,
            ctr,
            cvr,
            cpa
        ]);

        // Flush in batches - search terms can be very large
        if (rows.length >= 5000) {
            sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
            rows = [];
        }
    }

    if (rows.length > 0) {
        sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
    }

    Logger.log('Search terms export complete. Total rows in sheet: ' + sheet.getLastRow());
}
