// ============================================================
// ADALYSIS PROTOTYPE — MOCK DATA
// ============================================================

import type {
  Account,
  Campaign,
  CampaignMetrics,
  DailyMetric,
  ChangeEvent,
  SearchTerm,
  RSAAsset,
  Diagnostic,
  Opportunity,
  Rule,
  AuditChecklist,
  SegmentInsights,
  BudgetPacing,
  WeeklyReport,
} from "@/data/types";

export const accounts: Account[] = [
  {
    id: "acc-001",
    name: "TechCorp Global",
    platform: "Google Ads",
    currency: "USD",
    timezone: "America/New_York",
    status: "Active",
    mcc: "MCC-TECH-001",
    monthlyBudget: 85000,
    auditScore: 74,
  },
  {
    id: "acc-002",
    name: "TechCorp Global",
    platform: "Microsoft Ads",
    currency: "USD",
    timezone: "America/New_York",
    status: "Active",
    mcc: "MCC-TECH-001",
    monthlyBudget: 22000,
    auditScore: 61,
  },
];

export const campaigns: Campaign[] = [
  // -- GOOGLE ADS --
  {
    id: "camp-001", accountId: "acc-001", name: "Brand | Core Terms", type: "Brand",
    status: "Active", bidStrategy: "Target CPA", targetCPA: 18, dailyBudget: 800,
    network: "Search", startDate: "2023-01-01",
    issues: ["cpc_inflation"],
  },
  {
    id: "camp-002", accountId: "acc-001", name: "Brand | Exact Match", type: "Brand",
    status: "Active", bidStrategy: "Target ROAS", targetROAS: 8.5, dailyBudget: 400,
    network: "Search", startDate: "2023-03-15",
    issues: [],
  },
  {
    id: "camp-003", accountId: "acc-001", name: "Nonbrand | SaaS Tools", type: "Nonbrand",
    status: "Active", bidStrategy: "Target CPA", targetCPA: 65, dailyBudget: 2200,
    network: "Search", startDate: "2022-06-01",
    issues: ["cpa_spike", "is_lost_budget"],
  },
  {
    id: "camp-004", accountId: "acc-001", name: "Nonbrand | Project Management", type: "Nonbrand",
    status: "Active", bidStrategy: "Target CPA", targetCPA: 72, dailyBudget: 1800,
    network: "Search", startDate: "2022-09-12",
    issues: ["ctr_drop", "irrelevant_queries"],
  },
  {
    id: "camp-005", accountId: "acc-001", name: "Nonbrand | Collaboration", type: "Nonbrand",
    status: "Active", bidStrategy: "Max Conversions", targetCPA: 80, dailyBudget: 1500,
    network: "Search", startDate: "2023-02-20",
    issues: [],
  },
  {
    id: "camp-006", accountId: "acc-001", name: "Nonbrand | Analytics", type: "Nonbrand",
    status: "Active", bidStrategy: "Target CPA", targetCPA: 90, dailyBudget: 1200,
    network: "Search", startDate: "2023-04-01",
    issues: ["high_spend_low_conv"],
  },
  {
    id: "camp-007", accountId: "acc-001", name: "Competitor | Asana", type: "Competitor",
    status: "Active", bidStrategy: "Target CPA", targetCPA: 110, dailyBudget: 900,
    network: "Search", startDate: "2023-01-15",
    issues: ["cpa_spike"],
  },
  {
    id: "camp-008", accountId: "acc-001", name: "Competitor | Monday.com", type: "Competitor",
    status: "Active", bidStrategy: "Manual CPC", targetCPA: 120, dailyBudget: 700,
    network: "Search", startDate: "2023-05-10",
    issues: ["ctr_drop"],
  },
  {
    id: "camp-009", accountId: "acc-001", name: "Competitor | Jira", type: "Competitor",
    status: "Active", bidStrategy: "Target CPA", targetCPA: 130, dailyBudget: 600,
    network: "Search", startDate: "2023-07-01",
    issues: [],
  },
  {
    id: "camp-010", accountId: "acc-001", name: "Nonbrand | Enterprise", type: "Nonbrand",
    status: "Paused", bidStrategy: "Target CPA", targetCPA: 250, dailyBudget: 2500,
    network: "Search", startDate: "2022-11-01",
    issues: [],
  },
  {
    id: "camp-011", accountId: "acc-001", name: "Nonbrand | SMB", type: "Nonbrand",
    status: "Active", bidStrategy: "Target ROAS", targetROAS: 4.2, dailyBudget: 1100,
    network: "Search", startDate: "2023-06-15",
    issues: ["is_lost_rank"],
  },
  {
    id: "camp-012", accountId: "acc-001", name: "Brand | Branded Features", type: "Brand",
    status: "Active", bidStrategy: "Target CPA", targetCPA: 22, dailyBudget: 300,
    network: "Search", startDate: "2023-08-01",
    issues: [],
  },
  // -- MICROSOFT ADS --
  {
    id: "camp-013", accountId: "acc-002", name: "Brand | Core Terms", type: "Brand",
    status: "Active", bidStrategy: "Target CPA", targetCPA: 20, dailyBudget: 300,
    network: "Search", startDate: "2023-02-01",
    issues: [],
  },
  {
    id: "camp-014", accountId: "acc-002", name: "Nonbrand | SaaS Tools", type: "Nonbrand",
    status: "Active", bidStrategy: "Target CPA", targetCPA: 70, dailyBudget: 700,
    network: "Search", startDate: "2022-07-01",
    issues: ["cpa_spike", "is_lost_budget"],
  },
  {
    id: "camp-015", accountId: "acc-002", name: "Nonbrand | Project Management", type: "Nonbrand",
    status: "Active", bidStrategy: "Target CPA", targetCPA: 78, dailyBudget: 600,
    network: "Search", startDate: "2022-10-01",
    issues: [],
  },
  {
    id: "camp-016", accountId: "acc-002", name: "Nonbrand | Collaboration", type: "Nonbrand",
    status: "Active", bidStrategy: "Max Conversions", targetCPA: 85, dailyBudget: 450,
    network: "Search", startDate: "2023-03-10",
    issues: [],
  },
  {
    id: "camp-017", accountId: "acc-002", name: "Competitor | Asana", type: "Competitor",
    status: "Active", bidStrategy: "Target CPA", targetCPA: 115, dailyBudget: 280,
    network: "Search", startDate: "2023-04-01",
    issues: [],
  },
  {
    id: "camp-018", accountId: "acc-002", name: "Nonbrand | Analytics", type: "Nonbrand",
    status: "Active", bidStrategy: "Target CPA", targetCPA: 95, dailyBudget: 380,
    network: "Search", startDate: "2023-05-01",
    issues: [],
  },
  {
    id: "camp-019", accountId: "acc-002", name: "Nonbrand | Enterprise", type: "Nonbrand",
    status: "Active", bidStrategy: "Target CPA", targetCPA: 260, dailyBudget: 820,
    network: "Search", startDate: "2023-01-10",
    issues: ["high_spend_low_conv"],
  },
  {
    id: "camp-020", accountId: "acc-002", name: "Nonbrand | SMB", type: "Nonbrand",
    status: "Active", bidStrategy: "Target CPA", targetCPA: 88, dailyBudget: 350,
    network: "Search", startDate: "2023-07-15",
    issues: [],
  },
  {
    id: "camp-021", accountId: "acc-002", name: "Brand | Branded Features", type: "Brand",
    status: "Active", bidStrategy: "Target CPA", targetCPA: 24, dailyBudget: 120,
    network: "Search", startDate: "2023-09-01",
    issues: [],
  },
  {
    id: "camp-022", accountId: "acc-002", name: "Competitor | Monday.com", type: "Competitor",
    status: "Active", bidStrategy: "Manual CPC", targetCPA: 125, dailyBudget: 210,
    network: "Search", startDate: "2023-08-01",
    issues: ["ctr_drop"],
  },
  {
    id: "camp-023", accountId: "acc-002", name: "Competitor | Jira", type: "Competitor",
    status: "Active", bidStrategy: "Target CPA", targetCPA: 135, dailyBudget: 190,
    network: "Search", startDate: "2023-09-15",
    issues: [],
  },
  {
    id: "camp-024", accountId: "acc-002", name: "Brand | Exact Match", type: "Brand",
    status: "Paused", bidStrategy: "Target ROAS", targetROAS: 7.8, dailyBudget: 150,
    network: "Search", startDate: "2023-10-01",
    issues: [],
  },
];

export const campaignMetrics: Record<string, CampaignMetrics> = {
  "camp-001": { cost: 18420, clicks: 4210, impressions: 52300, conv: 890, revenue: 142400, cpa: 20.7, roas: 7.73, ctr: 8.05, cvr: 21.14, avgCpc: 4.37, is: 88.2, isLostBudget: 1.2, isLostRank: 10.6, prevCost: 17100, prevConv: 820, prevCPA: 20.85, prevROAS: 7.61 },
  "camp-002": { cost: 9140, clicks: 2890, impressions: 32100, conv: 620, revenue: 99200, cpa: 14.74, roas: 10.85, ctr: 9.00, cvr: 21.45, avgCpc: 3.16, is: 91.5, isLostBudget: 0.8, isLostRank: 7.7, prevCost: 8800, prevConv: 590, prevCPA: 14.91, prevROAS: 10.62 },
  "camp-003": { cost: 52300, clicks: 8740, impressions: 196000, conv: 412, revenue: 206000, cpa: 126.9, roas: 3.94, ctr: 4.46, cvr: 4.71, avgCpc: 5.98, is: 58.4, isLostBudget: 18.2, isLostRank: 23.4, prevCost: 44100, prevConv: 490, prevCPA: 90.0, prevROAS: 4.67 },
  "camp-004": { cost: 38700, clicks: 5920, impressions: 184000, conv: 298, revenue: 149000, cpa: 129.9, roas: 3.85, ctr: 3.22, cvr: 5.03, avgCpc: 6.54, is: 47.2, isLostBudget: 8.4, isLostRank: 44.4, prevCost: 39200, prevConv: 340, prevCPA: 115.3, prevROAS: 3.80 },
  "camp-005": { cost: 29800, clicks: 4850, impressions: 128000, conv: 342, revenue: 171000, cpa: 87.1, roas: 5.74, ctr: 3.79, cvr: 7.05, avgCpc: 6.15, is: 62.8, isLostBudget: 12.1, isLostRank: 25.1, prevCost: 28400, prevConv: 318, prevCPA: 89.3, prevROAS: 5.60 },
  "camp-006": { cost: 24100, clicks: 3210, impressions: 98000, conv: 148, revenue: 74000, cpa: 162.8, roas: 3.07, ctr: 3.28, cvr: 4.61, avgCpc: 7.51, is: 41.3, isLostBudget: 6.2, isLostRank: 52.5, prevCost: 22800, prevConv: 168, prevCPA: 135.7, prevROAS: 3.25 },
  "camp-007": { cost: 21600, clicks: 2980, impressions: 68000, conv: 142, revenue: 71000, cpa: 152.1, roas: 3.29, ctr: 4.38, cvr: 4.77, avgCpc: 7.25, is: 52.6, isLostBudget: 9.8, isLostRank: 37.6, prevCost: 18900, prevConv: 178, prevCPA: 106.2, prevROAS: 3.76 },
  "camp-008": { cost: 14200, clicks: 1840, impressions: 59000, conv: 98, revenue: 49000, cpa: 144.9, roas: 3.45, ctr: 3.12, cvr: 5.33, avgCpc: 7.72, is: 38.4, isLostBudget: 14.2, isLostRank: 47.4, prevCost: 14600, prevConv: 118, prevCPA: 123.7, prevROAS: 3.36 },
  "camp-009": { cost: 12800, clicks: 1620, impressions: 48000, conv: 87, revenue: 43500, cpa: 147.1, roas: 3.40, ctr: 3.38, cvr: 5.37, avgCpc: 7.90, is: 44.1, isLostBudget: 11.3, isLostRank: 44.6, prevCost: 12400, prevConv: 88, prevCPA: 140.9, prevROAS: 3.51 },
  "camp-010": { cost: 0, clicks: 0, impressions: 0, conv: 0, revenue: 0, cpa: 0, roas: 0, ctr: 0, cvr: 0, avgCpc: 0, is: 0, isLostBudget: 0, isLostRank: 0, prevCost: 48200, prevConv: 180, prevCPA: 267.8, prevROAS: 2.10 },
  "camp-011": { cost: 22400, clicks: 3180, impressions: 112000, conv: 224, revenue: 112000, cpa: 100.0, roas: 5.00, ctr: 2.84, cvr: 7.04, avgCpc: 7.04, is: 34.2, isLostBudget: 4.1, isLostRank: 61.7, prevCost: 21800, prevConv: 228, prevCPA: 95.6, prevROAS: 5.14 },
  "camp-012": { cost: 6210, clicks: 1840, impressions: 23100, conv: 298, revenue: 47680, cpa: 20.84, roas: 7.68, ctr: 7.97, cvr: 16.20, avgCpc: 3.37, is: 82.4, isLostBudget: 2.1, isLostRank: 15.5, prevCost: 5980, prevConv: 282, prevCPA: 21.20, prevROAS: 7.45 },
  "camp-013": { cost: 6820, clicks: 1540, impressions: 19800, conv: 298, revenue: 47680, cpa: 22.89, roas: 6.99, ctr: 7.78, cvr: 19.35, avgCpc: 4.43, is: 82.1, isLostBudget: 2.4, isLostRank: 15.5, prevCost: 6400, prevConv: 275, prevCPA: 23.27, prevROAS: 6.81 },
  "camp-014": { cost: 15800, clicks: 2640, impressions: 68000, conv: 134, revenue: 67000, cpa: 117.9, roas: 4.24, ctr: 3.88, cvr: 5.08, avgCpc: 5.98, is: 54.2, isLostBudget: 16.4, isLostRank: 29.4, prevCost: 13200, prevConv: 158, prevCPA: 83.5, prevROAS: 5.08 },
  "camp-015": { cost: 12800, clicks: 1980, impressions: 62000, conv: 112, revenue: 56000, cpa: 114.3, roas: 4.38, ctr: 3.19, cvr: 5.66, avgCpc: 6.46, is: 49.8, isLostBudget: 9.2, isLostRank: 41.0, prevCost: 12400, prevConv: 118, prevCPA: 105.1, prevROAS: 4.52 },
  "camp-016": { cost: 9800, clicks: 1620, impressions: 44000, conv: 112, revenue: 56000, cpa: 87.5, roas: 5.71, ctr: 3.68, cvr: 6.91, avgCpc: 6.05, is: 57.4, isLostBudget: 13.2, isLostRank: 29.4, prevCost: 9400, prevConv: 104, prevCPA: 90.4, prevROAS: 5.96 },
  "camp-017": { cost: 6400, clicks: 890, impressions: 22000, conv: 48, revenue: 24000, cpa: 133.3, roas: 3.75, ctr: 4.05, cvr: 5.39, avgCpc: 7.19, is: 49.2, isLostBudget: 10.4, isLostRank: 40.4, prevCost: 6100, prevConv: 51, prevCPA: 119.6, prevROAS: 3.93 },
  "camp-018": { cost: 8200, clicks: 1120, impressions: 34000, conv: 58, revenue: 29000, cpa: 141.4, roas: 3.54, ctr: 3.29, cvr: 5.18, avgCpc: 7.32, is: 38.6, isLostBudget: 7.8, isLostRank: 53.6, prevCost: 7900, prevConv: 62, prevCPA: 127.4, prevROAS: 3.67 },
  "camp-019": { cost: 17400, clicks: 1980, impressions: 58000, conv: 42, revenue: 21000, cpa: 414.3, roas: 1.21, ctr: 3.41, cvr: 2.12, avgCpc: 8.79, is: 31.4, isLostBudget: 5.6, isLostRank: 63.0, prevCost: 15800, prevConv: 52, prevCPA: 303.8, prevROAS: 1.33 },
  "camp-020": { cost: 7800, clicks: 1140, impressions: 38000, conv: 72, revenue: 36000, cpa: 108.3, roas: 4.62, ctr: 3.00, cvr: 6.32, avgCpc: 6.84, is: 36.8, isLostBudget: 4.2, isLostRank: 59.0, prevCost: 7400, prevConv: 69, prevCPA: 107.2, prevROAS: 4.86 },
  "camp-021": { cost: 2640, clicks: 780, impressions: 9800, conv: 118, revenue: 18880, cpa: 22.37, roas: 7.15, ctr: 7.96, cvr: 15.13, avgCpc: 3.38, is: 79.4, isLostBudget: 2.8, isLostRank: 17.8, prevCost: 2520, prevConv: 110, prevCPA: 22.91, prevROAS: 6.95 },
  "camp-022": { cost: 4620, clicks: 604, impressions: 19800, conv: 28, revenue: 14000, cpa: 165.0, roas: 3.03, ctr: 3.05, cvr: 4.64, avgCpc: 7.65, is: 35.2, isLostBudget: 15.6, isLostRank: 49.2, prevCost: 4400, prevConv: 36, prevCPA: 122.2, prevROAS: 3.18 },
  "camp-023": { cost: 4200, clicks: 528, impressions: 16400, conv: 24, revenue: 12000, cpa: 175.0, roas: 2.86, ctr: 3.22, cvr: 4.55, avgCpc: 7.95, is: 34.8, isLostBudget: 11.2, isLostRank: 54.0, prevCost: 3980, prevConv: 26, prevCPA: 153.1, prevROAS: 3.01 },
  "camp-024": { cost: 0, clicks: 0, impressions: 0, conv: 0, revenue: 0, cpa: 0, roas: 0, ctr: 0, cvr: 0, avgCpc: 0, is: 0, isLostBudget: 0, isLostRank: 0, prevCost: 4800, prevConv: 82, prevCPA: 58.5, prevROAS: 6.84 },
};

export const dailyMetrics: DailyMetric[] = generateDailyMetrics();

function generateDailyMetrics(): DailyMetric[] {
  const data: DailyMetric[] = [];
  const now = new Date("2026-02-28");
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dow = d.getDay();
    const weekendFactor = dow === 0 || dow === 6 ? 0.72 : 1.0;
    const spike = i === 8 ? 1.35 : 1.0;   // CPA spike event
    const dip = i === 18 ? 0.78 : 1.0;    // budget cap event
    const base = 3800 + Math.random() * 400;
    const cost = base * weekendFactor * spike * dip;
    const clicks = (cost / 6.2 + Math.random() * 50) * weekendFactor;
    const impressions = clicks * (14 + Math.random() * 3);
    const conv = (clicks * 0.062 + Math.random() * 3) * (spike > 1 ? 0.7 : 1.0);
    const revenue = conv * 500;
    data.push({
      date: dateStr,
      cost: Math.round(cost),
      clicks: Math.round(clicks),
      impressions: Math.round(impressions),
      conv: Math.round(conv * 10) / 10,
      revenue: Math.round(revenue),
      cpa: conv > 0 ? Math.round((cost / conv) * 10) / 10 : 0,
      roas: cost > 0 ? Math.round((revenue / cost) * 100) / 100 : 0,
    });
  }
  return data;
}

export const changeEvents: ChangeEvent[] = [
  { id: "ce-001", campId: "camp-003", date: "2026-02-20", entity: "Bid Strategy", entityId: "camp-003", type: "bid_strategy_change", description: "Changed from Manual CPC to Target CPA", before: "Manual CPC (avg $5.20)", after: "Target CPA ($65)", user: "system", impact: "high", correlatedKpiShift: "+40% CPA in 5 days after change" },
  { id: "ce-002", campId: "camp-003", date: "2026-02-18", entity: "Daily Budget", entityId: "camp-003", type: "budget_change", description: "Budget reduced from $2,800 to $2,200", before: "$2,800/day", after: "$2,200/day", user: "john.doe@techcorp.com", impact: "medium", correlatedKpiShift: "IS Lost to Budget rose from 8% → 18%" },
  { id: "ce-003", campId: "camp-004", date: "2026-02-19", entity: "RSA Ad Copy", entityId: "ag-012", type: "ad_update", description: "Paused top-performing RSA (strength: Excellent)", before: "RSA enabled, 'Best project management tool' headline active", after: "RSA paused – replaced with lower-strength ad", user: "sarah.m@techcorp.com", impact: "high", correlatedKpiShift: "CTR dropped 1.8pp in 48h" },
  { id: "ce-004", campId: "camp-007", date: "2026-02-22", entity: "Target CPA", entityId: "camp-007", type: "bid_change", description: "Target CPA raised from $90 → $110 for competitor campaign", before: "$90 target CPA", after: "$110 target CPA", user: "john.doe@techcorp.com", impact: "medium", correlatedKpiShift: "CPA climbed to $152 (38% over target)" },
  { id: "ce-005", campId: "camp-011", date: "2026-02-15", entity: "Keyword", entityId: "kw-088", type: "keyword_add", description: "Added 42 broad match keywords to Nonbrand | SMB", before: "84 keywords", after: "126 keywords (+42 broad match)", user: "sarah.m@techcorp.com", impact: "medium", correlatedKpiShift: "IS Lost to Rank rose from 38% → 62%" },
  { id: "ce-006", campId: "camp-006", date: "2026-02-16", entity: "Audience", entityId: "camp-006", type: "audience_change", description: "Removed RLSA remarketing list from Analytics campaign", before: "RLSA: 'All visitors' (observation mode)", after: "No audience segments", user: "john.doe@techcorp.com", impact: "high", correlatedKpiShift: "CVR dropped 2.1pp, CPA rose to $162" },
  { id: "ce-007", campId: "camp-001", date: "2026-02-24", entity: "Max CPC Cap", entityId: "camp-001", type: "bid_change", description: "Removed manual max CPC cap on Brand Core Terms", before: "Max CPC cap: $8.00", after: "No cap – Smart Bidding unrestricted", user: "sarah.m@techcorp.com", impact: "low", correlatedKpiShift: "Avg CPC rose $4.10 → $4.37 (+6.6%)" },
  { id: "ce-008", campId: "camp-003", date: "2026-02-25", entity: "Negative Keyword", entityId: "camp-003", type: "negative_add", description: "Added 18 negative keywords to block irrelevant traffic", before: "142 negatives", after: "160 negatives", user: "system", impact: "positive", correlatedKpiShift: "Waste spend down ~$800 in 3 days" },
];

export const searchTerms: SearchTerm[] = [
  // camp-003 — SaaS Tools (waste signals)
  { id: "st-001", campId: "camp-003", adGroupId: "ag-003", query: "free project management software", matchType: "Broad", cost: 1420, clicks: 218, impressions: 3800, conv: 0, cpa: 0, status: "waste", suggestedNegative: true, negativeRisk: "low", theme: "Free/Non-commercial" },
  { id: "st-002", campId: "camp-003", adGroupId: "ag-003", query: "open source task manager", matchType: "Broad", cost: 890, clicks: 142, impressions: 2600, conv: 0, cpa: 0, status: "waste", suggestedNegative: true, negativeRisk: "low", theme: "Free/Non-commercial" },
  { id: "st-003", campId: "camp-003", adGroupId: "ag-004", query: "project management software", matchType: "Broad", cost: 2840, clicks: 420, impressions: 8900, conv: 28, cpa: 101.4, status: "converting", suggestedNegative: false, negativeRisk: null, theme: "Core category" },
  { id: "st-004", campId: "camp-003", adGroupId: "ag-004", query: "best saas project tools 2024", matchType: "Broad", cost: 1180, clicks: 195, impressions: 4200, conv: 14, cpa: 84.3, status: "converting", suggestedNegative: false, negativeRisk: null, theme: "Core category" },
  { id: "st-005", campId: "camp-003", adGroupId: "ag-003", query: "how to manage projects for students", matchType: "Broad", cost: 640, clicks: 98, impressions: 2100, conv: 0, cpa: 0, status: "waste", suggestedNegative: true, negativeRisk: "medium", theme: "Education/Students" },
  { id: "st-006", campId: "camp-003", adGroupId: "ag-003", query: "jira alternative free", matchType: "Broad", cost: 780, clicks: 122, impressions: 2400, conv: 2, cpa: 390, status: "high_cpa", suggestedNegative: true, negativeRisk: "low", theme: "Competitor" },
  { id: "st-007", campId: "camp-003", adGroupId: "ag-004", query: "enterprise project management platform", matchType: "Phrase", cost: 1920, clicks: 288, impressions: 5400, conv: 22, cpa: 87.3, status: "converting", suggestedNegative: false, negativeRisk: null, theme: "Core category" },
  // camp-004 — Project Management
  { id: "st-008", campId: "camp-004", adGroupId: "ag-010", query: "construction project management software", matchType: "Broad", cost: 1840, clicks: 262, impressions: 5200, conv: 1, cpa: 1840, status: "waste", suggestedNegative: true, negativeRisk: "low", theme: "Wrong vertical" },
  { id: "st-009", campId: "camp-004", adGroupId: "ag-010", query: "project management certification course", matchType: "Broad", cost: 920, clicks: 138, impressions: 2900, conv: 0, cpa: 0, status: "waste", suggestedNegative: true, negativeRisk: "low", theme: "Education" },
  { id: "st-010", campId: "camp-004", adGroupId: "ag-011", query: "software project management tool", matchType: "Phrase", cost: 2180, clicks: 320, impressions: 6800, conv: 24, cpa: 90.8, status: "converting", suggestedNegative: false, negativeRisk: null, theme: "Core category" },
  { id: "st-011", campId: "camp-004", adGroupId: "ag-010", query: "project management for dummies book", matchType: "Broad", cost: 380, clicks: 56, impressions: 1200, conv: 0, cpa: 0, status: "waste", suggestedNegative: true, negativeRisk: "low", theme: "Books/Learning" },
  // camp-006 — Analytics
  { id: "st-012", campId: "camp-006", adGroupId: "ag-020", query: "google analytics tutorial", matchType: "Broad", cost: 1120, clicks: 165, impressions: 3400, conv: 0, cpa: 0, status: "waste", suggestedNegative: true, negativeRisk: "low", theme: "Tutorial/Education" },
  { id: "st-013", campId: "camp-006", adGroupId: "ag-020", query: "business analytics software enterprise", matchType: "Phrase", cost: 2640, clicks: 380, impressions: 7200, conv: 18, cpa: 146.7, status: "high_cpa", suggestedNegative: false, negativeRisk: null, theme: "Core category" },
  { id: "st-014", campId: "camp-006", adGroupId: "ag-021", query: "analytics dashboard tool", matchType: "Exact", cost: 1880, clicks: 248, impressions: 4900, conv: 22, cpa: 85.5, status: "exact_candidate", suggestedNegative: false, negativeRisk: null, theme: "Core category" },
];

export const rsaAssets: RSAAsset[] = [
  { campId: "camp-003", adGroupId: "ag-003", adId: "rsa-001", strength: "Good", headlines: ["Best Project Management Software", "Try Free for 14 Days", "Used by 50,000+ Teams", "Streamline Your Workflow", "Collaborate in Real Time"], descriptions: ["Manage projects, tasks & timelines in one place. Try free.", "Award-winning project management trusted by enterprises."], pinnedHeadlines: [0], topHeadlines: ["Best Project Management Software", "Try Free for 14 Days"], poorHeadlines: [], missingAssets: ["Need 2 more unique headlines for full coverage"], recommendations: ["Unpin headline 1 to allow more rotation", "Add benefit-focused headline"] },
  { campId: "camp-004", adGroupId: "ag-010", adId: "rsa-002", strength: "Poor", headlines: ["Project Management Tool", "Sign Up Today", "Free Trial Available"], descriptions: ["Manage your projects online.", "Try our software now."], pinnedHeadlines: [0, 1, 2], topHeadlines: [], poorHeadlines: ["Sign Up Today", "Free Trial Available"], missingAssets: ["Need 12 more headlines", "Need 2 more descriptions"], recommendations: ["Unpin all headlines", "Add unique value propositions", "Add more descriptive descriptions", "Include pricing or social proof"] },
  { campId: "camp-006", adGroupId: "ag-020", adId: "rsa-003", strength: "Excellent", headlines: ["Powerful Analytics Dashboard", "Insights That Drive Decisions", "Connect All Your Data Sources", "Real-time Business Analytics", "7-Day Free Trial", "No Credit Card Required", "Trusted by 12,000+ Companies", "Advanced Reporting Tools", "Custom Dashboards & Alerts", "Integrate With 200+ Tools"], descriptions: ["Transform raw data into actionable insights with our AI-powered analytics platform.", "Connect, analyze, and visualize all your business data in one place. Start free."], pinnedHeadlines: [], topHeadlines: ["Powerful Analytics Dashboard", "Insights That Drive Decisions", "Trusted by 12,000+ Companies"], poorHeadlines: [], missingAssets: [], recommendations: ["Asset coverage is strong — monitor for low performers quarterly"] },
  { campId: "camp-007", adGroupId: "ag-025", adId: "rsa-004", strength: "Average", headlines: ["Better Than Asana", "Switch From Asana Today", "Asana Alternative", "More Features, Lower Price", "Try Free for 30 Days", "Easy Migration from Asana"], descriptions: ["Migrate from Asana in under an hour. Full feature parity plus enterprise AI tools.", "See why 5,000+ teams switched from Asana to TechCorp."], pinnedHeadlines: [0, 1], topHeadlines: ["More Features, Lower Price", "Try Free for 30 Days"], poorHeadlines: ["Asana Alternative"], missingAssets: ["Need 9 more headlines for full coverage"], recommendations: ["Unpin 'Better Than Asana' and 'Switch From Asana Today' — too similar", "Add unique selling points beyond comparison"] },
];

export const diagnostics: Diagnostic[] = [
  {
    id: "diag-001", campId: "camp-003", severity: "critical",
    type: "cpa_spike", title: "CPA Spike Detected",
    signal: "CPA rose from $90 → $127 (+41%) over 7 days",
    evidence: ["Conv volume dropped 16% (490 → 412) while cost rose 19% ($44K → $52K)", "IS Lost to Budget increased from 8% → 18%", "Bid strategy changed to Target CPA on Feb 20", "CPC inflation: avg CPC rose from $5.05 → $5.98 (+18%)"],
    likelyCauses: ["Bid strategy transition created learning period instability", "Budget cap limiting reach during high-intent hours", "Potential quality score degradation from ad rotation change"],
    recommendedActions: ["Increase daily budget by 25% to remove budget constraint during learning", "Set target CPA at $100 (current avg × 1.1) to give algorithm room", "Monitor for 7 more days before further changes — avoid strategy thrash"],
    confidence: 87, priority: "critical",
    causalHint: "demand_drop_plus_budget_cap",
  },
  {
    id: "diag-002", campId: "camp-003", severity: "warning",
    type: "is_lost_budget", title: "IS Lost to Budget Rising",
    signal: "IS Lost to Budget at 18.2% (target: <10%)",
    evidence: ["Budget reduced from $2,800 → $2,200 on Feb 18", "Account avg search volume up 12% (seasonal pattern)", "Campaign shows 'Limited by budget' for 6+ hours/day", "Top 3 ad schedules (Tue-Thu, 10am-2pm) most affected"],
    likelyCauses: ["Budget reduction during peak demand season", "Competing campaigns increased spend share (Analytics, Enterprise)"],
    recommendedActions: ["Restore budget to $2,800 or reallocate from paused Enterprise campaign", "Consider day-parting to concentrate budget on peak hours", "Review shared budget if applicable"],
    confidence: 94, priority: "high",
    causalHint: "budget_cap",
  },
  {
    id: "diag-003", campId: "camp-004", severity: "warning",
    type: "ctr_drop", title: "CTR Drop — Ad Relevance Issue",
    signal: "CTR dropped from 4.8% → 3.2% (-33%) over 10 days",
    evidence: ["Top RSA paused on Feb 19 (replaced with Poor strength ad)", "Avg ad position declined 2.1 → 2.8 (rank loss)", "IS Lost to Rank rose to 44.4%", "Impression share stable — quality drop, not budget drop"],
    likelyCauses: ["Removal of high-strength RSA impacted Quality Score", "Lower CTR triggering negative QS feedback loop", "New RSA lacks compelling differentiation in headlines"],
    recommendedActions: ["Re-enable the paused Excellent-strength RSA immediately", "A/B test new RSA variants before pausing incumbents", "Review pinning strategy — all 3 positions pinned on current RSA"],
    confidence: 91, priority: "high",
    causalHint: "rank_loss_quality_score",
  },
  {
    id: "diag-004", campId: "camp-006", severity: "warning",
    type: "high_spend_low_conv", title: "High Spend, Low Conversion Rate",
    signal: "CVR at 4.6% vs account avg 7.1% — spending $162 CPA vs $90 target",
    evidence: ["RLSA audience removed on Feb 16 — remarketing lift lost", "Search terms analysis: 22% of spend on tutorial/education queries (0 conv)", "Landing page for this campaign has 3.8s load time (others avg 1.9s)", "Negative keyword gap: no exclusions for 'tutorial', 'how to', 'free'"],
    likelyCauses: ["RLSA removal eliminated high-intent remarketing audience multiplier", "Irrelevant query traffic increasing waste spend significantly", "Landing page performance gap reducing CVR for cold traffic"],
    recommendedActions: ["Re-add RLSA 'All Visitors' in bid-only mode with +30% adjustment", "Add 'tutorial', 'how to', 'free', 'course', 'certification' as negatives", "Test new landing page variant with faster load time"],
    confidence: 83, priority: "high",
    causalHint: "audience_removal_plus_waste_traffic",
  },
  {
    id: "diag-005", campId: "camp-007", severity: "warning",
    type: "cpa_spike", title: "Competitor Campaign CPA Over Target",
    signal: "CPA at $152 vs $110 target (+38%)",
    evidence: ["Target CPA raised from $90 → $110 on Feb 22", "Competitor (Asana) likely increased bids (external signal)", "Conv rate stable at 4.8% — not a quality issue", "CPCs rising: $6.80 → $7.25 (+6.6%) in 2 weeks"],
    likelyCauses: ["Auction competitiveness increase — Asana Q1 campaign launch signal", "New target CPA giving algorithm permission to bid higher", "CPC inflation in competitor segment (industry trend)"],
    recommendedActions: ["Reset target CPA to $120 with max CPC cap at $10", "Review auction insights report for new entrants", "Test ad copy emphasizing switching/migration benefits"],
    confidence: 78, priority: "medium",
    causalHint: "competitor_auction_pressure",
  },
  {
    id: "diag-006", campId: "camp-011", severity: "info",
    type: "is_lost_rank", title: "High IS Lost to Rank — Bid/Quality Issue",
    signal: "IS Lost to Rank at 61.7% — potential scale opportunity",
    evidence: ["42 new broad match keywords added Feb 15 — many with low QS", "Average QS for new keywords: 4.2/10 (vs 6.8 for original keywords)", "Expected IS with QS improvement: ~55% achievable IS"],
    likelyCauses: ["New keywords with low QS dragging campaign rank", "Broad match adding volume but poor relevance signals", "Insufficient ad group structure for new keyword themes"],
    recommendedActions: ["Pause broad match keywords with QS < 4 after 2 weeks", "Create dedicated ad groups for top 5 new keyword themes", "Consider exact match for top converting search queries"],
    confidence: 82, priority: "medium",
    causalHint: "quality_score_drag",
  },
];

export const opportunities: Opportunity[] = [
  { id: "opp-001", category: "negative_keywords", title: "Add 47 Negative Keywords", impact: "high", estimatedSavings: 8420, estimatedConvGain: 0, campIds: ["camp-003", "camp-004", "camp-006"], description: "Waste analysis found 47 search queries costing $8,420 with 0 conversions. Adding these as negatives will improve CPA by an estimated 12% across 3 campaigns.", implementation: ["Export search terms report filtered to 0 conv, cost > $50", "Group by theme (free/education/wrong vertical)", "Add to campaign-level negatives or shared negative list", "Use phrase match for broader protection"], effort: "low", confidence: 94 },
  { id: "opp-002", category: "budget_reallocation", title: "Reallocate $2,500/day from Paused Enterprise to Nonbrand SaaS", impact: "high", estimatedSavings: 0, estimatedConvGain: 38, campIds: ["camp-003", "camp-010"], description: "Enterprise campaign (camp-010) is paused with $2,500/day budget. Nonbrand SaaS is budget-constrained and losing 18% IS. Reallocation would recover estimated 38 conversions/month.", implementation: ["Verify Enterprise is permanently paused vs seasonal", "Increase Nonbrand SaaS budget from $2,200 → $3,200", "Monitor IS Lost to Budget — target <8% in 7 days"], effort: "low", confidence: 88 },
  { id: "opp-003", category: "exact_match_harvest", title: "Promote 8 High-Converting Queries to Exact Match", impact: "medium", estimatedSavings: 0, estimatedConvGain: 22, campIds: ["camp-003", "camp-004", "camp-006"], description: "8 search queries driving 80+ conversions each at CPA < $80 are only matched via broad/phrase. Adding exact match versions will improve control and likely reduce CPCs by 15-20%.", implementation: ["Create exact match keywords for identified queries", "Add corresponding phrase match as negatives in exact campaigns", "Monitor for cannibalisation in first 2 weeks"], effort: "medium", confidence: 82 },
  { id: "opp-004", category: "rsa_improvement", title: "Fix Poor-Strength RSA in Project Management Campaign", impact: "medium", estimatedSavings: 0, estimatedConvGain: 14, campIds: ["camp-004"], description: "Ad group 'Core PM Keywords' has a Poor-strength RSA with only 3 headlines (all pinned). Improving to Good strength is projected to improve CTR by 8-12%.", implementation: ["Add 12 unique headlines covering different value props", "Remove all pinning or limit to position 1 only", "Add 2 more description lines with CTAs", "Set rotation to Optimise (not rotate evenly)"], effort: "medium", confidence: 85 },
  { id: "opp-005", category: "bid_strategy", title: "Switch Analytics Campaign from Max Conv to Target CPA $90", impact: "medium", estimatedSavings: 4200, estimatedConvGain: 8, campIds: ["camp-006"], description: "Analytics campaign on Max Conversions is overspending — CPA at $162 vs account target of $90. Switching to Target CPA $90 with portfolio strategy may reduce waste by $4,200/month.", implementation: ["Set Target CPA bid strategy at $120 (step down from current $162 actual)", "After 14 days, adjust to $100 if volume maintained", "Add Target CPA to shared portfolio strategy for efficiency"], effort: "low", confidence: 76 },
  { id: "opp-006", category: "pause_keywords", title: "Pause 23 Keywords With No Conv in 90 Days ($6,840 Spend)", impact: "medium", estimatedSavings: 6840, estimatedConvGain: 0, campIds: ["camp-003", "camp-004", "camp-007", "camp-008"], description: "23 keywords across 4 campaigns have accumulated $6,840 in spend over 90 days with zero conversions. Pausing will improve account efficiency.", implementation: ["Review each keyword for expected future conversion potential", "Pause keywords with 100+ clicks, 0 conv, and poor QS (<5)", "Add high-intent search terms as new keywords if missing"], effort: "low", confidence: 91 },
  { id: "opp-007", category: "rlsa", title: "Re-Add RLSA to Analytics Campaign", impact: "high", estimatedSavings: 0, estimatedConvGain: 18, campIds: ["camp-006"], description: "RLSA 'All Visitors' was removed on Feb 16. Historical data shows +45% CVR lift from remarketing audiences. Restoring with +30% bid adjustment is estimated to add 18 conversions at $70 CPA.", implementation: ["Add 'All Visitors' RLSA in observation mode", "Set +30% bid adjustment based on historical CVR delta", "Add 'Past Converters' with +50% adjustment", "Monitor for 14 days then switch to target mode"], effort: "low", confidence: 89 },
  { id: "opp-008", category: "landing_page", title: "Test Faster Landing Page for Analytics Campaign", impact: "medium", estimatedSavings: 0, estimatedConvGain: 12, campIds: ["camp-006"], description: "Analytics campaign LP has 3.8s load time vs account avg 1.9s. A 1-second improvement is projected to increase CVR by 7%, adding ~12 conversions/month.", implementation: ["Audit page speed with PageSpeed Insights", "Compress hero images (currently 2.1MB)", "Enable server-side rendering for above-fold content", "A/B test new page before full rollout (Google Optimize or VWO)"], effort: "high", confidence: 72 },
];

export const rules: Rule[] = [
  { id: "rule-001", name: "CPA Spike Alert", category: "alert", condition: "CPA > target by 25% for 5 consecutive days", action: "Alert + flag campaign for review", active: true, triggeredCount: 3, lastTriggered: "2026-02-25", affectedCamps: ["camp-003", "camp-007", "camp-019"] },
  { id: "rule-002", name: "Budget Cap Alert", category: "alert", condition: "IS Lost to Budget > 15%", action: "Alert + recommend budget increase", active: true, triggeredCount: 2, lastTriggered: "2026-02-24", affectedCamps: ["camp-003", "camp-014"] },
  { id: "rule-003", name: "Negative Keyword Flag", category: "qa", condition: "Search term cost > $100 with 0 conv in 30 days", action: "Flag as suggested negative", active: true, triggeredCount: 12, lastTriggered: "2026-02-27", affectedCamps: ["camp-003", "camp-004", "camp-006", "camp-008"] },
  { id: "rule-004", name: "RSA Coverage Warning", category: "qa", condition: "RSA has < 8 headlines OR < 2 descriptions", action: "Flag ad group for RSA improvement", active: true, triggeredCount: 4, lastTriggered: "2026-02-26", affectedCamps: ["camp-004", "camp-008", "camp-019", "camp-022"] },
  { id: "rule-005", name: "Keyword No Impressions", category: "qa", condition: "Keyword with 0 impressions in 30 days and status Active", action: "Flag for review / possible pause", active: true, triggeredCount: 18, lastTriggered: "2026-02-27", affectedCamps: ["camp-004", "camp-006", "camp-011"] },
  { id: "rule-006", name: "IS Lost to Rank High", category: "opportunity", condition: "IS Lost to Rank > 40% and campaign not budget-limited", action: "Recommend bid increase or QS improvement", active: true, triggeredCount: 5, lastTriggered: "2026-02-26", affectedCamps: ["camp-004", "camp-006", "camp-008", "camp-011", "camp-020"] },
  { id: "rule-007", name: "Exact Match Harvest", category: "opportunity", condition: "Search term conv > 20 in 30 days, no exact match keyword exists, CPA < target", action: "Recommend adding as exact match keyword", active: false, triggeredCount: 8, lastTriggered: "2026-02-20", affectedCamps: ["camp-003", "camp-004", "camp-006"] },
  { id: "rule-008", name: "Paused Campaign Budget Recovery", category: "opportunity", condition: "Campaign paused > 14 days AND budget > $500/day", action: "Suggest reallocating budget to active campaigns", active: true, triggeredCount: 2, lastTriggered: "2026-02-22", affectedCamps: ["camp-010", "camp-024"] },
];

export const auditChecklist: AuditChecklist = {
  overallScore: 68,
  categories: [
    { name: "Campaign Structure", score: 82, items: [
      { check: "All campaigns have ≥1 ad group", pass: true },
      { check: "Ad group keyword count ≤ 20", pass: true },
      { check: "Consistent naming convention", pass: false, note: "3 campaigns don't follow Brand|Type|Theme pattern" },
      { check: "Single keyword ad groups for brand terms", pass: true },
    ]},
    { name: "Ad Coverage", score: 61, items: [
      { check: "Every ad group has ≥1 RSA", pass: true },
      { check: "All RSAs have Good or Excellent strength", pass: false, note: "6 ad groups have Poor/Average RSA strength" },
      { check: "No excessive headline pinning", pass: false, note: "4 RSAs have all 3 positions pinned" },
      { check: "ETA coverage removed (sunset)", pass: true },
    ]},
    { name: "Negative Keywords", score: 54, items: [
      { check: "Account-level negative keyword list exists", pass: true },
      { check: "Campaign-level negatives for each type", pass: false, note: "Competitor campaigns missing brand protection negatives" },
      { check: "No zero-conv queries > $100 spend (30d)", pass: false, note: "47 queries identified this period" },
      { check: "Shared negative lists applied", pass: true },
    ]},
    { name: "Bid Strategy", score: 74, items: [
      { check: "All active campaigns have Smart Bidding", pass: false, note: "2 campaigns still on Manual CPC (camp-008, camp-022)" },
      { check: "Target CPA within 20% of actual CPA", pass: false, note: "camp-003, camp-007 targets misaligned" },
      { check: "Max CPC caps set for Smart Bidding", pass: true },
      { check: "Portfolio bid strategies used for related campaigns", pass: false, note: "Brand campaigns not in shared portfolio" },
    ]},
    { name: "Tracking & Measurement", score: 88, items: [
      { check: "Conversion tracking active", pass: true },
      { check: "Primary conversion action defined", pass: true },
      { check: "GA4 linked and auto-tagging enabled", pass: true },
      { check: "Value-based bidding configured", pass: false, note: "Revenue values not set for all conversion actions" },
    ]},
    { name: "Budget Management", score: 71, items: [
      { check: "No campaigns paused by budget cap", pass: false, note: "camp-003 limited by budget 6+ hrs/day" },
      { check: "Shared budgets used for related campaigns", pass: false, note: "Brand campaigns could share budget" },
      { check: "Budget distribution aligns with ROAS performance", pass: true },
      { check: "Monthly pacing on track (±10%)", pass: true },
    ]},
  ],
};

export const segmentInsights: SegmentInsights = {
  device: [
    { segment: "Desktop", cost: 124800, conv: 1842, cpa: 67.8, cvr: 8.2, share: 47 },
    { segment: "Mobile", cost: 98400, conv: 982, cpa: 100.2, cvr: 4.9, share: 37 },
    { segment: "Tablet", cost: 42100, conv: 418, cpa: 100.7, cvr: 5.8, share: 16 },
  ],
  dayOfWeek: [
    { segment: "Monday", cost: 38200, conv: 524, cpa: 72.9, cvr: 7.1 },
    { segment: "Tuesday", cost: 41800, conv: 598, cpa: 69.9, cvr: 7.4 },
    { segment: "Wednesday", cost: 44100, conv: 621, cpa: 71.0, cvr: 7.5 },
    { segment: "Thursday", cost: 42600, conv: 584, cpa: 73.0, cvr: 7.2 },
    { segment: "Friday", cost: 36400, conv: 478, cpa: 76.2, cvr: 6.8 },
    { segment: "Saturday", cost: 21800, conv: 218, cpa: 100.0, cvr: 5.1 },
    { segment: "Sunday", cost: 17400, conv: 162, cpa: 107.4, cvr: 4.8 },
  ],
  geo: [
    { segment: "United States", cost: 142100, conv: 1848, cpa: 76.9, cvr: 7.2, share: 54 },
    { segment: "United Kingdom", cost: 48200, conv: 584, cpa: 82.5, cvr: 6.8, share: 18 },
    { segment: "Canada", cost: 28400, conv: 368, cpa: 77.2, cvr: 7.1, share: 11 },
    { segment: "Australia", cost: 22800, conv: 264, cpa: 86.4, cvr: 6.4, share: 9 },
    { segment: "Germany", cost: 16800, conv: 178, cpa: 94.4, cvr: 5.9, share: 6 },
    { segment: "Other", cost: 7000, conv: 0, cpa: 0, cvr: 0, share: 2 },
  ],
};

export const budgetPacing: BudgetPacing = {
  accountId: "acc-001",
  month: "February 2026",
  monthlyTarget: 85000,
  daysInMonth: 28,
  daysElapsed: 28,
  mtdSpend: 82400,
  projectedSpend: 82400,
  pacingStatus: "on_track",
  campaigns: [
    { campId: "camp-003", name: "Nonbrand | SaaS Tools", target: 22000*28/30, mtd: 21800, pacing: "on_track" },
    { campId: "camp-004", name: "Nonbrand | Project Management", target: 18000*28/30, mtd: 16200, pacing: "under" },
    { campId: "camp-006", name: "Nonbrand | Analytics", target: 12000*28/30, mtd: 14100, pacing: "over" },
    { campId: "camp-007", name: "Competitor | Asana", target: 9000*28/30, mtd: 9800, pacing: "over" },
  ],
};

export const weeklyReport: WeeklyReport = {
  period: "Feb 17–28, 2026",
  account: "TechCorp Global (Google + Microsoft)",
  generatedAt: "2026-02-28",
  summary: {
    totalCost: 265800,
    totalConv: 3242,
    totalCPA: 82.0,
    totalROAS: 4.21,
    prevCost: 248400,
    prevConv: 3480,
    prevCPA: 71.4,
    prevROAS: 4.82,
  },
  wins: [
    "Brand campaigns maintained strong efficiency: Google Brand CPA $20.84 (-1.7% vs prior period)",
    "Nonbrand Collaboration campaign improved CVR +0.8pp to 7.1%",
    "Negative keyword additions in SaaS Tools saved ~$800 in waste spend",
    "Microsoft Ads Brand campaign showing improved Conv Rate (+3.2%)",
  ],
  challenges: [
    "Nonbrand SaaS Tools CPA spiked +41% to $127 following bid strategy change — primary concern",
    "Analytics campaign RLSA removal caused CVR drop and CPA inflation to $163",
    "Competitor campaign CPCs rising across the board (+8% avg) — likely Q1 competitor activity",
    "Project Management RSA paused accidentally — CTR dropped 33% in 48 hours",
  ],
  nextSteps: [
    "Restore Analytics RLSA segments (priority: immediate)",
    "Re-enable Excellent-strength RSA in Project Management campaign",
    "Review SaaS Tools budget and target CPA alignment for learning period exit",
    "Add 47 identified negative keywords before next week's optimization session",
    "Reallocate Enterprise campaign budget to SaaS Tools and Collaboration",
  ],
  tables: {
    topCampaigns: [
      { name: "Brand | Core Terms", cost: 18420, conv: 890, cpa: 20.7, roas: 7.73, change: "+8.5%" },
      { name: "Nonbrand | Collaboration", cost: 29800, conv: 342, cpa: 87.1, roas: 5.74, change: "+2.5%" },
      { name: "Nonbrand | SMB", cost: 22400, conv: 224, cpa: 100.0, roas: 5.00, change: "-2.6%" },
    ],
    alertCampaigns: [
      { name: "Nonbrand | SaaS Tools", cost: 52300, conv: 412, cpa: 126.9, roas: 3.94, issue: "CPA Spike +41%" },
      { name: "Nonbrand | Analytics", cost: 24100, conv: 148, cpa: 162.8, roas: 3.07, issue: "High Spend Low Conv" },
      { name: "Competitor | Asana", cost: 21600, conv: 142, cpa: 152.1, roas: 3.29, issue: "CPA Over Target +38%" },
    ],
  },
};
