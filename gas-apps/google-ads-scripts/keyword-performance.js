/**
 * Adobe Stock - Keyword Performance Export
 * Account: NA - Adobe Stock (509-829-4026)
 *
 * Exports daily keyword performance data to Google Sheets including:
 * - Core metrics (cost, impressions, clicks, conversions, conversion value)
 * - Quality Score components (QS, Expected CTR, Ad Relevance, Landing Page)
 * - Keyword-level IS metrics (Search IS, Lost IS Rank, Exact Match IS, Top IS, Abs Top IS)
 * - Derived metrics (CPC, CTR, CVR, CPA, ROAS)
 *
 * NOTE: Budget-related IS metrics (Lost IS Budget) are campaign-level only.
 * Those are pulled via 02_campaign_performance.js
 *
 * SCHEDULE: Run daily
 */

var CONFIG = {
    SPREADSHEET_URL: 'https://docs.google.com/spreadsheets/d/1KLFvJbV3_kpOBmx6CsCVYKiKpuGTdh4gnV_xZFQAm5A/edit',
    SHEET_NAME: 'Keyword Performance',
    DATE_RANGE: 'YESTERDAY',
    ACCOUNT_ID: '509-829-4026'
};

function main() {
    var spreadsheet = SpreadsheetApp.openByUrl(CONFIG.SPREADSHEET_URL);
    var sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);

    if (!sheet) {
        sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);
    }

    if (sheet.getLastRow() === 0) {
        var headers = [
            'Date', 'CampaignName', 'CampaignId', 'AdGroupName', 'AdGroupId',
            'Keyword', 'MatchType', 'Status',
            'QualityScore', 'ExpectedCtr', 'AdRelevance', 'LandingPageExperience',
            'Cost', 'Impressions', 'Clicks', 'Conversions', 'ConversionValue',
            'CPC', 'CTR', 'CVR', 'CPA', 'ROAS',
            'SearchImpressionShare', 'SearchLostISRank',
            'SearchExactMatchIS', 'SearchAbsTopIS', 'SearchTopIS'
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
        'ad_group_criterion.keyword.text, ' +
        'ad_group_criterion.keyword.match_type, ' +
        'ad_group_criterion.status, ' +
        'ad_group_criterion.quality_info.quality_score, ' +
        'ad_group_criterion.quality_info.creative_quality_score, ' +
        'ad_group_criterion.quality_info.post_click_quality_score, ' +
        'ad_group_criterion.quality_info.search_predicted_ctr, ' +
        'metrics.cost_micros, ' +
        'metrics.impressions, ' +
        'metrics.clicks, ' +
        'metrics.conversions, ' +
        'metrics.conversions_value, ' +
        'metrics.average_cpc, ' +
        'metrics.ctr, ' +
        'metrics.search_impression_share, ' +
        'metrics.search_rank_lost_impression_share, ' +
        'metrics.search_exact_match_impression_share, ' +
        'metrics.search_absolute_top_impression_share, ' +
        'metrics.search_top_impression_share ' +
        'FROM keyword_view ' +
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
        var roas = cost > 0 ? convValue / cost : 0;

        var qi = row.adGroupCriterion.qualityInfo || {};

        rows.push([
            row.segments.date,
            row.campaign.name,
            row.campaign.id,
            row.adGroup.name,
            row.adGroup.id,
            row.adGroupCriterion.keyword.text,
            row.adGroupCriterion.keyword.matchType,
            row.adGroupCriterion.status,
            qi.qualityScore || '',
            qi.searchPredictedCtr || '',
            qi.creativeQualityScore || '',
            qi.postClickQualityScore || '',
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
            parseIS(row.metrics.searchImpressionShare),
            parseIS(row.metrics.searchRankLostImpressionShare),
            parseIS(row.metrics.searchExactMatchImpressionShare),
            parseIS(row.metrics.searchAbsoluteTopImpressionShare),
            parseIS(row.metrics.searchTopImpressionShare)
        ]);

        if (rows.length >= 5000) {
            sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
            rows = [];
        }
    }

    if (rows.length > 0) {
        sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
    }

    Logger.log('Keyword export complete. Total rows in sheet: ' + sheet.getLastRow());
}

function parseIS(value) {
    if (value === null || value === undefined || value === '--') return '';
    return value;
}
