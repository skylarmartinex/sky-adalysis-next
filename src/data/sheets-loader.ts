import "server-only";

import type { Campaign, CampaignMetrics, SearchTerm } from "./types";

export const SHEET_IDS = {
  campaigns: process.env.SHEETS_CAMPAIGNS_ID || "1DDvUi5RAOpRlJ_VvgVJptAg_3vrqG0mNc_IBeZ7Vj14",
  searchTerms: process.env.SHEETS_SEARCH_TERMS_ID || "1TzVdwRarnEvMuiMH59qfbdtruue9T9-EWBBAEiSYSik",
  keywords: process.env.SHEETS_KEYWORDS_ID || "1KLFvJbV3_kpOBmx6CsCVYKiKpuGTdh4gnV_xZFQAm5A",
} as const;

export type SheetName = keyof typeof SHEET_IDS;

function pubUrl(sheetId: string): string {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/pub?output=csv`;
}

// ── Robust CSV parser ─────────────────────────────────────────
export function parseCSV(text: string): Record<string, string>[] {
  const lines = splitCSVLines(text);
  if (lines.length < 2) return [];

  const headers = parseCSVRow(lines[0]).map((h) => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVRow(line);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (values[idx] ?? "").trim();
    });
    if (Object.values(row).every((v) => v === "")) continue;
    rows.push(row);
  }
  return rows;
}

function splitCSVLines(text: string): string[] {
  const lines: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      lines.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function parseCSVRow(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      fields.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

// ── Number helpers ────────────────────────────────────────────
function n(v: string | undefined): number {
  if (!v) return 0;
  const clean = v.replace(/[$,€£%\s]/g, "").trim();
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

function pct(v: string | undefined): number {
  if (!v) return 0;
  const clean = v.replace(/[%\s]/g, "").trim();
  const num = parseFloat(clean);
  if (isNaN(num)) return 0;
  return num > 0 && num < 1 ? num * 100 : num;
}

// ── Column name resolver ──────────────────────────────────────
function pick(row: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== "") return row[k];
    const lower = k.toLowerCase();
    const found = Object.keys(row).find((rk) => rk.toLowerCase() === lower);
    if (found && row[found] !== "") return row[found];
  }
  return "";
}

// ── Fetch with timeout ────────────────────────────────────────
async function fetchCSV(sheetId: string, timeoutMs = 8000): Promise<string | null> {
  const url = pubUrl(sheetId);
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "text/csv,text/plain,*/*" },
      next: { revalidate: 60 },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const text = await res.text();
    if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html"))
      return null;
    return text;
  } catch {
    return null;
  }
}

// ── Campaign sheet mapper ─────────────────────────────────────
interface MappedCampaign extends Campaign {
  _metrics: CampaignMetrics;
}

export function mapCampaignRow(row: Record<string, string>, idx: number): MappedCampaign {
  const id = pick(row, "Campaign ID", "Campaign Id", "campaign_id", "Id") || `camp-gs-${idx}`;
  const name = pick(row, "Campaign", "Campaign Name", "campaign_name", "Campaign name");
  const status = pick(row, "Campaign Status", "Status", "status") || "Unknown";
  const budget = n(pick(row, "Budget", "Daily Budget", "daily_budget", "Campaign Budget"));
  const bidStrategy = pick(row, "Bid Strategy Type", "Bid Strategy", "bid_strategy", "Bidding Strategy") || "Unknown";

  let type: string = pick(row, "Campaign Type", "Type", "type");
  if (!type) {
    const lower = name.toLowerCase();
    if (lower.includes("brand") || lower.includes("branded")) type = "Brand";
    else if (lower.includes("competitor") || lower.includes("compet")) type = "Competitor";
    else type = "Nonbrand";
  }

  const cost = n(pick(row, "Cost", "Spend", "spend", "cost"));
  const clicks = n(pick(row, "Clicks", "clicks"));
  const impressions = n(pick(row, "Impressions", "Impr.", "impressions", "Impr"));
  const conv = n(pick(row, "Conversions", "Conv.", "conversions", "Converted clicks"));
  const revenue = n(pick(row, "Conv. value", "Revenue", "Conversion value", "Value"));
  const cpa = conv > 0 ? cost / conv : n(pick(row, "Cost / conv.", "CPA", "cpa", "Cost/Conv"));
  const roas = cost > 0 ? revenue / cost : n(pick(row, "Conv. value/cost", "ROAS", "roas"));
  const ctr = pct(pick(row, "CTR", "ctr")) || (impressions > 0 ? (clicks / impressions) * 100 : 0);
  const cvr = pct(pick(row, "Conv. rate", "CVR", "cvr", "Conversion rate")) || (clicks > 0 ? (conv / clicks) * 100 : 0);
  const avgCpc = n(pick(row, "Avg. CPC", "Avg CPC", "avg_cpc", "CPC")) || (clicks > 0 ? cost / clicks : 0);
  const is_ = pct(pick(row, "Search Impr. share", "Impr. share", "IS", "Search impression share"));
  const isLostBudget = pct(pick(row, "Search Lost IS (budget)", "IS Lost Budget", "Lost IS (budget)", "Search lost IS (budget)"));
  const isLostRank = pct(pick(row, "Search Lost IS (rank)", "IS Lost Rank", "Lost IS (rank)", "Search lost IS (rank)"));
  const targetCPA = n(pick(row, "Target CPA", "target_cpa", "Target CPA ($)"));
  const targetROAS = n(pick(row, "Target ROAS", "target_roas"));

  const accountId = pick(row, "Account ID", "Account", "account_id") || "acc-001";
  const platform = pick(row, "Platform", "Network", "platform") || "Google Ads";

  return {
    id,
    name,
    type: type as Campaign["type"],
    status: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
    accountId: accountId.includes("acc-") ? accountId : "acc-001",
    platform,
    bidStrategy,
    targetCPA,
    targetROAS,
    dailyBudget: budget,
    network: "Search",
    startDate: pick(row, "Start Date", "start_date") || "",
    issues: [],
    _metrics: {
      cost,
      clicks,
      impressions,
      conv,
      revenue,
      cpa: cpa || (conv > 0 ? cost / conv : 0),
      roas: roas || (cost > 0 ? revenue / cost : 0),
      ctr: ctr || (impressions > 0 ? (clicks / impressions) * 100 : 0),
      cvr: cvr || (clicks > 0 ? (conv / clicks) * 100 : 0),
      avgCpc,
      is: is_,
      isLostBudget,
      isLostRank,
      prevCost: 0,
      prevConv: 0,
      prevCPA: 0,
      prevROAS: 0,
    },
  };
}

// ── Search terms sheet mapper ─────────────────────────────────
export function mapSearchTermRow(row: Record<string, string>, idx: number): SearchTerm {
  const query = pick(row, "Search term", "Query", "search_term", "Search Term", "Keyword", "Search query");
  const campName = pick(row, "Campaign", "Campaign Name", "campaign_name");
  const adGroup = pick(row, "Ad group", "Ad Group", "ad_group", "AdGroup");
  const matchType = pick(row, "Match type", "Match Type", "match_type") || "Broad";
  const cost = n(pick(row, "Cost", "Spend"));
  const clicks = n(pick(row, "Clicks"));
  const impressions = n(pick(row, "Impressions", "Impr."));
  const conv = n(pick(row, "Conversions", "Conv."));
  const cpa = conv > 0 ? cost / conv : 0;
  const campId = pick(row, "Campaign ID", "Campaign Id") || "camp-001";

  let status: SearchTerm["status"] = "converting";
  if (conv === 0 && cost > 50) status = "waste";
  else if (conv > 0 && cpa > 200) status = "high_cpa";
  else if (conv === 0 && cost === 0) status = "no_data";

  let theme = "General";
  const q = query.toLowerCase();
  if (q.includes("free") || q.includes("open source")) theme = "Free/Non-commercial";
  else if (q.includes("course") || q.includes("tutorial") || q.includes("learn") || q.includes("certif")) theme = "Education";
  else if (q.includes("book") || q.includes("pdf") || q.includes("guide")) theme = "Books/Learning";
  else if (q.includes("construction") || q.includes("building")) theme = "Wrong vertical";

  const suggestedNegative = status === "waste" || (status === "high_cpa" && cpa > 300);

  return {
    id: `st-gs-${idx}`,
    campId: campId.startsWith("camp-") ? campId : "camp-001",
    campName,
    adGroupId: `ag-gs-${idx}`,
    adGroupName: adGroup,
    query: query || `(empty row ${idx})`,
    matchType: matchType.charAt(0).toUpperCase() + matchType.slice(1).toLowerCase(),
    cost,
    clicks,
    impressions,
    conv,
    cpa,
    status,
    theme,
    suggestedNegative,
    negativeRisk: suggestedNegative ? (cost > 500 ? "low" : "medium") : null,
  };
}

// ── Main loader ───────────────────────────────────────────────
export interface SheetsResult {
  source: "live" | "mock";
  status: Record<SheetName, "ok" | "error" | "unpublished">;
  lastFetched: string;
  campaigns: Campaign[];
  campaignMetrics: Record<string, CampaignMetrics>;
  searchTerms: SearchTerm[];
  keywords: SearchTerm[];
  rawHeaders: Record<string, string[]>;
  rowCounts: Record<string, number>;
}

export async function loadFromSheets(): Promise<SheetsResult> {
  const result: SheetsResult = {
    source: "mock",
    status: { campaigns: "unpublished", searchTerms: "unpublished", keywords: "unpublished" },
    lastFetched: new Date().toISOString(),
    campaigns: [],
    campaignMetrics: {},
    searchTerms: [],
    keywords: [],
    rawHeaders: { campaigns: [], searchTerms: [], keywords: [] },
    rowCounts: { campaigns: 0, searchTerms: 0, keywords: 0 },
  };

  const [campCSV, stCSV, kwCSV] = await Promise.all([
    fetchCSV(SHEET_IDS.campaigns),
    fetchCSV(SHEET_IDS.searchTerms),
    fetchCSV(SHEET_IDS.keywords),
  ]);

  if (campCSV) {
    try {
      const rows = parseCSV(campCSV);
      if (rows.length > 0) {
        result.rawHeaders.campaigns = Object.keys(rows[0]);
        const mapped = rows.map((r, i) => mapCampaignRow(r, i));
        result.campaigns = mapped.map(({ _metrics, ...rest }) => rest);
        result.campaignMetrics = Object.fromEntries(mapped.map((c) => [c.id, c._metrics]));
        result.rowCounts.campaigns = rows.length;
        result.status.campaigns = "ok";
      }
    } catch {
      result.status.campaigns = "error";
    }
  }

  if (stCSV) {
    try {
      const rows = parseCSV(stCSV);
      if (rows.length > 0) {
        result.rawHeaders.searchTerms = Object.keys(rows[0]);
        result.searchTerms = rows.map((r, i) => mapSearchTermRow(r, i));
        result.rowCounts.searchTerms = rows.length;
        result.status.searchTerms = "ok";
      }
    } catch {
      result.status.searchTerms = "error";
    }
  }

  if (kwCSV) {
    try {
      const rows = parseCSV(kwCSV);
      if (rows.length > 0) {
        result.rawHeaders.keywords = Object.keys(rows[0]);
        result.keywords = rows.map((r, i) => mapSearchTermRow(r, i));
        result.rowCounts.keywords = rows.length;
        result.status.keywords = "ok";
      }
    } catch {
      result.status.keywords = "error";
    }
  }

  const anyLive = Object.values(result.status).some((s) => s === "ok");
  if (anyLive) result.source = "live";

  return result;
}

export async function checkSheetsStatus(): Promise<Record<SheetName, "ok" | "unpublished" | "error">> {
  const checks = await Promise.all(
    (Object.entries(SHEET_IDS) as [SheetName, string][]).map(async ([name, id]) => {
      const csv = await fetchCSV(id, 5000);
      const status = csv === null ? "unpublished" : csv.length < 10 ? "error" : "ok";
      return [name, status] as [SheetName, "ok" | "unpublished" | "error"];
    })
  );
  return Object.fromEntries(checks) as Record<SheetName, "ok" | "unpublished" | "error">;
}
