/**
 * Adobe Stock - Campaign Performance Export
 * Account: NA - Adobe Stock (509-829-4026)
 *
 * Exports daily campaign-level performance data to Google Sheets including:
 * - Core metrics (cost, impressions, clicks, conversions, conversion value)
 * - Budget data (daily budget)
 * - All Impression Share metrics (Search IS, Lost IS Budget/Rank, Top/Abs Top IS, etc.)
 * - Derived metrics (CPC, CTR, CVR, CPA, ROAS)
 *
 * SETUP: Replace SPREADSHEET_URL with your actual Google Sheets URL
 * SCHEDULE: Run daily
 */

var CONFIG = {
    SPREADSHEET_URL: 'https://docs.google.com/spreadsheets/d/1DDvUi5RAOpRlJ_VvgVJptAg_3vrqG0mNc_IBeZ7Vj14/edit',
    SHEET_NAME: 'Campaign Performance',
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
            'Date', 'CampaignName', 'CampaignId', 'CampaignStatus', 'BidStrategy',
            'Cost', 'Impressions', 'Clicks', 'Conversions', 'ConversionValue',
            'CPC', 'CTR', 'CVR', 'CPA', 'ROAS',
            'DailyBudget',
            'SearchImpressionShare', 'SearchLostISBudget', 'SearchLostISRank',
            'SearchExactMatchIS', 'SearchAbsTopIS', 'SearchTopIS',
            'ContentImpressionShare', 'ContentLostISBudget', 'ContentLostISRank'
        ];
        sheet.appendRow(headers);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }

    var query = 'SELECT ' +
        'segments.date, ' +
        'campaign.name, ' +
        'campaign.id, ' +
        'campaign.status, ' +
        'campaign.bidding_strategy_type, ' +
        'metrics.cost_micros, ' +
        'metrics.impressions, ' +
        'metrics.clicks, ' +
        'metrics.conversions, ' +
        'metrics.conversions_value, ' +
        'metrics.average_cpc, ' +
        'metrics.ctr, ' +
        'campaign.campaign_budget, ' +
        'metrics.search_impression_share, ' +
        'metrics.search_budget_lost_impression_share, ' +
        'metrics.search_rank_lost_impression_share, ' +
        'metrics.search_exact_match_impression_share, ' +
        'metrics.search_absolute_top_impression_share, ' +
        'metrics.search_top_impression_share, ' +
        'metrics.content_impression_share, ' +
        'metrics.content_budget_lost_impression_share, ' +
        'metrics.content_rank_lost_impression_share ' +
        'FROM campaign ' +
        'WHERE segments.date DURING ' + CONFIG.DATE_RANGE + ' ' +
        'AND metrics.cost_micros > 0 ' +
        'AND metrics.impressions > 0 ' +
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
        var roas = cost > 0 ? convValue / cost : 0;

        // Get budget - need separate API call
        var dailyBudget = '';
        try {
            var budgetQuery = 'SELECT campaign_budget.amount_micros FROM campaign_budget WHERE campaign_budget.resource_name = "' + row.campaign.campaignBudget + '"';
            var budgetReport = AdsApp.search(budgetQuery);
            if (budgetReport.hasNext()) {
                dailyBudget = budgetReport.next().campaignBudget.amountMicros / 1000000;
            }
        } catch (e) {
            // Budget lookup failed, leave empty
        }

        rows.push([
            row.segments.date,
            row.campaign.name,
            row.campaign.id,
            row.campaign.status,
            row.campaign.biddingStrategyType || '',
            cost,
            impressions,
            clicks,
            conversions,
            convValue,
            cpc,
            ctr,
            cvr,
            cpa,
            roas,
            dailyBudget,
            parseIS(row.metrics.searchImpressionShare),
            parseIS(row.metrics.searchBudgetLostImpressionShare),
            parseIS(row.metrics.searchRankLostImpressionShare),
            parseIS(row.metrics.searchExactMatchImpressionShare),
            parseIS(row.metrics.searchAbsoluteTopImpressionShare),
            parseIS(row.metrics.searchTopImpressionShare),
            parseIS(row.metrics.contentImpressionShare),
            parseIS(row.metrics.contentBudgetLostImpressionShare),
            parseIS(row.metrics.contentRankLostImpressionShare)
        ]);
    }

    if (rows.length > 0) {
        sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
    }

    Logger.log('Campaign export complete. Rows added: ' + rows.length);
}

function parseIS(value) {
    if (value === null || value === undefined || value === '--') return '';
    return value;
}
