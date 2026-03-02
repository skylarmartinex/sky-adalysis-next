export interface Account {
  id: string;
  name: string;
  platform: "Google Ads" | "Microsoft Ads";
  currency: string;
  timezone: string;
  status: "Active" | "Paused";
  mcc: string;
  monthlyBudget: number;
  auditScore: number;
}

export interface Campaign {
  id: string;
  accountId: string;
  name: string;
  type: "Brand" | "Nonbrand" | "Competitor";
  status: string;
  bidStrategy: string;
  targetCPA?: number;
  targetROAS?: number;
  dailyBudget: number;
  network: string;
  startDate: string;
  issues: string[];
  platform?: string;
}

export interface CampaignMetrics {
  cost: number;
  clicks: number;
  impressions: number;
  conv: number;
  revenue: number;
  cpa: number;
  roas: number;
  ctr: number;
  cvr: number;
  avgCpc: number;
  is: number;
  isLostBudget: number;
  isLostRank: number;
  prevCost: number;
  prevConv: number;
  prevCPA: number;
  prevROAS: number;
}

export interface DailyMetric {
  date: string;
  cost: number;
  clicks: number;
  impressions: number;
  conv: number;
  revenue: number;
  cpa: number;
  roas: number;
}

export interface ChangeEvent {
  id: string;
  campId: string;
  date: string;
  entity: string;
  entityId: string;
  type: string;
  description: string;
  before: string;
  after: string;
  user: string;
  impact: "high" | "medium" | "low" | "positive";
  correlatedKpiShift: string;
}

export interface SearchTerm {
  id: string;
  campId: string;
  campName?: string;
  adGroupId: string;
  adGroupName?: string;
  query: string;
  matchType: string;
  cost: number;
  clicks: number;
  impressions: number;
  conv: number;
  cpa: number;
  status: "waste" | "converting" | "high_cpa" | "exact_candidate" | "no_data";
  suggestedNegative: boolean;
  negativeRisk: "low" | "medium" | null;
  theme: string;
}

export interface Keyword {
  id: string;
  campId: string;
  campName?: string;
  adGroupId: string;
  adGroupName?: string;
  keyword: string;
  matchType: string;
  status: string;
  cost: number;
  clicks: number;
  impressions: number;
  conv: number;
  qualityScore: number;
  avgCpc: number;
  maxCpc: number;
  cpa: number;
  ctr: number;
  cvr: number;
}

export interface RSAAsset {
  campId: string;
  adGroupId: string;
  adId: string;
  strength: "Excellent" | "Good" | "Average" | "Poor";
  headlines: string[];
  descriptions: string[];
  pinnedHeadlines: number[];
  topHeadlines: string[];
  poorHeadlines: string[];
  missingAssets: string[];
  recommendations: string[];
}

export interface Diagnostic {
  id: string;
  campId: string;
  severity: "critical" | "warning" | "info";
  type: string;
  title: string;
  signal: string;
  evidence: string[];
  likelyCauses: string[];
  recommendedActions: string[];
  confidence: number;
  priority: "critical" | "high" | "medium" | "low";
  causalHint: string;
}

export interface Opportunity {
  id: string;
  category: string;
  title: string;
  impact: "high" | "medium" | "low";
  estimatedSavings: number;
  estimatedConvGain: number;
  campIds: string[];
  description: string;
  implementation: string[];
  effort: "low" | "medium" | "high";
  confidence: number;
}

export interface Rule {
  id: string;
  name: string;
  category: string;
  condition: string;
  action: string;
  active: boolean;
  triggeredCount: number;
  lastTriggered: string;
  affectedCamps: string[];
}

export interface AuditItem {
  check: string;
  pass: boolean;
  note?: string;
}

export interface AuditCategory {
  name: string;
  score: number;
  items: AuditItem[];
}

export interface AuditChecklist {
  overallScore: number;
  categories: AuditCategory[];
}

export interface SegmentRow {
  segment: string;
  cost: number;
  conv: number;
  cpa: number;
  cvr: number;
  share?: number;
}

export interface SegmentInsights {
  device: SegmentRow[];
  dayOfWeek: SegmentRow[];
  geo: SegmentRow[];
}

export interface BudgetPacingCampaign {
  campId: string;
  name: string;
  target: number;
  mtd: number;
  pacing: "on_track" | "under" | "over";
}

export interface BudgetPacing {
  accountId: string;
  month: string;
  monthlyTarget: number;
  daysInMonth: number;
  daysElapsed: number;
  mtdSpend: number;
  projectedSpend: number;
  pacingStatus: string;
  campaigns: BudgetPacingCampaign[];
}

export interface ReportSummary {
  totalCost: number;
  totalConv: number;
  totalCPA: number;
  totalROAS: number;
  prevCost: number;
  prevConv: number;
  prevCPA: number;
  prevROAS: number;
}

export interface WeeklyReport {
  period: string;
  account: string;
  generatedAt: string;
  summary: ReportSummary;
  wins: string[];
  challenges: string[];
  nextSteps: string[];
  tables: {
    topCampaigns: Array<{ name: string; cost: number; conv: number; cpa: number; roas: number; change: string }>;
    alertCampaigns: Array<{ name: string; cost: number; conv: number; cpa: number; roas: number; issue: string }>;
  };
}

export interface DataSourceMeta {
  source: "live" | "mock";
  sheetStatus: Record<string, string>;
  lastFetched: string;
  rowCounts: Record<string, number>;
  rawHeaders: Record<string, string[]>;
  liveSheets: Record<string, boolean>;
  unpublished: string[];
}

export interface AppData {
  accounts: Account[];
  campaigns: Campaign[];
  campaignMetrics: Record<string, CampaignMetrics>;
  dailyMetrics: DailyMetric[];
  changeEvents: ChangeEvent[];
  searchTerms: SearchTerm[];
  keywords: Keyword[];
  rsaAssets: RSAAsset[];
  diagnostics: Diagnostic[];
  opportunities: Opportunity[];
  rules: Rule[];
  auditChecklist: AuditChecklist;
  segmentInsights: SegmentInsights;
  budgetPacing: BudgetPacing;
  weeklyReport: WeeklyReport;
  dataSource: DataSourceMeta;
}
