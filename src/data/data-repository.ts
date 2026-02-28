import "server-only";

import type { AppData, Campaign, CampaignMetrics, DataSourceMeta } from "./types";
import { loadFromSheets } from "./sheets-loader";

// Lazy import mock data to avoid circular deps
async function getMockData() {
  const mod = await import("./mock-data");
  return mod;
}

let cachedData: AppData | null = null;
let cacheTime = 0;
const CACHE_TTL = 60_000; // 60 seconds

export async function getData(): Promise<AppData> {
  const now = Date.now();
  if (cachedData && now - cacheTime < CACHE_TTL) {
    return cachedData;
  }

  const mock = await getMockData();
  const sheets = await loadFromSheets();

  const liveCampaigns = sheets.campaigns.length > 0;
  const liveSearchTerms = sheets.searchTerms.length > 0;

  const campaigns: Campaign[] = liveCampaigns ? sheets.campaigns : mock.campaigns;
  const campaignMetrics: Record<string, CampaignMetrics> = liveCampaigns
    ? sheets.campaignMetrics
    : mock.campaignMetrics;
  const searchTerms = liveSearchTerms ? sheets.searchTerms : mock.searchTerms;

  // Auto-detect issues on live campaigns
  if (liveCampaigns) {
    for (const camp of campaigns) {
      const m = campaignMetrics[camp.id];
      if (!m) continue;
      camp.issues = [];
      if (m.cpa > 0 && camp.targetCPA && camp.targetCPA > 0 && m.cpa > camp.targetCPA * 1.25)
        camp.issues.push("cpa_spike");
      if (m.isLostBudget > 15) camp.issues.push("is_lost_budget");
      if (m.isLostRank > 40) camp.issues.push("is_lost_rank");
      if (m.ctr > 0 && m.ctr < 2) camp.issues.push("ctr_drop");
      if (m.cost > 5000 && m.conv < 5) camp.issues.push("high_spend_low_conv");
    }
  }

  const dataSource: DataSourceMeta = {
    source: sheets.source,
    sheetStatus: sheets.status,
    lastFetched: sheets.lastFetched,
    rowCounts: sheets.rowCounts,
    rawHeaders: sheets.rawHeaders,
    liveSheets: {
      campaigns: liveCampaigns,
      searchTerms: liveSearchTerms,
      keywords: sheets.keywords.length > 0,
    },
    unpublished: Object.entries(sheets.status)
      .filter(([, s]) => s !== "ok")
      .map(([k]) => k),
  };

  const data: AppData = {
    accounts: mock.accounts,
    campaigns,
    campaignMetrics,
    dailyMetrics: mock.dailyMetrics,
    changeEvents: mock.changeEvents,
    searchTerms,
    keywords: sheets.keywords.length > 0 ? sheets.keywords : [],
    rsaAssets: mock.rsaAssets,
    diagnostics: mock.diagnostics,
    opportunities: mock.opportunities,
    rules: mock.rules,
    auditChecklist: mock.auditChecklist,
    segmentInsights: mock.segmentInsights,
    budgetPacing: mock.budgetPacing,
    weeklyReport: mock.weeklyReport,
    dataSource,
  };

  cachedData = data;
  cacheTime = now;
  return data;
}

export function invalidateCache() {
  cachedData = null;
  cacheTime = 0;
}
