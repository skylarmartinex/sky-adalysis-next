"use client";

import { KpiTile } from "@/components/shared/kpi-tile";
import { formatUsd, formatNum, formatPct, formatRoas, formatDec2, pctDelta, formatDelta } from "@/lib/formatters";
import { usePeriod } from "@/lib/period-context";
import type { DailyMetric } from "@/data/types";

interface DashboardKpisProps {
  dailyMetrics: DailyMetric[];
}

export function DashboardKpis({ dailyMetrics }: DashboardKpisProps) {
  const { period } = usePeriod();

  // Slice the current period (last N days) and the equal prior period before it
  const current = dailyMetrics.slice(-period);
  const previous = dailyMetrics.slice(-period * 2, -period);

  const sum = (arr: DailyMetric[], key: keyof DailyMetric) =>
    arr.reduce((s, d) => s + (d[key] as number), 0);

  const curCost = sum(current, "cost");
  const prevCost = sum(previous, "cost");
  const curClicks = sum(current, "clicks");
  const prevClicks = sum(previous, "clicks");
  const curImpr = sum(current, "impressions");
  const prevImpr = sum(previous, "impressions");
  const curConv = sum(current, "conv");
  const prevConv = sum(previous, "conv");
  const curRev = sum(current, "revenue");
  const prevRev = sum(previous, "revenue");

  const curCPA = curConv > 0 ? curCost / curConv : 0;
  const prevCPA = prevConv > 0 ? prevCost / prevConv : 0;
  const curROAS = curCost > 0 ? curRev / curCost : 0;
  const prevROAS = prevCost > 0 ? prevRev / prevCost : 0;
  const curCTR = curImpr > 0 ? (curClicks / curImpr) * 100 : 0;
  const prevCTR = prevImpr > 0 ? (prevClicks / prevImpr) * 100 : 0;
  const curCVR = curClicks > 0 ? (curConv / curClicks) * 100 : 0;
  const prevCVR = prevClicks > 0 ? (prevConv / prevClicks) * 100 : 0;
  const curAvgCPC = curClicks > 0 ? curCost / curClicks : 0;
  const prevAvgCPC = prevClicks > 0 ? prevCost / prevClicks : 0;

  const tiles = [
    { label: "Cost", value: formatUsd(curCost), delta: formatDelta(pctDelta(curCost, prevCost), true), spark: current.map((d) => d.cost) },
    { label: "Clicks", value: formatNum(curClicks), delta: formatDelta(pctDelta(curClicks, prevClicks)), spark: current.map((d) => d.clicks) },
    { label: "Impressions", value: formatNum(curImpr), delta: formatDelta(pctDelta(curImpr, prevImpr)), spark: current.map((d) => d.impressions) },
    { label: "Conversions", value: formatNum(curConv), delta: formatDelta(pctDelta(curConv, prevConv)), spark: current.map((d) => d.conv) },
    { label: "CPA", value: "$" + curCPA.toFixed(0), delta: formatDelta(pctDelta(curCPA, prevCPA), true), spark: current.map((d) => d.cpa) },
    { label: "ROAS", value: formatRoas(curROAS), delta: formatDelta(pctDelta(curROAS, prevROAS)), spark: current.map((d) => d.roas) },
    { label: "CTR", value: formatPct(curCTR), delta: formatDelta(pctDelta(curCTR, prevCTR)), spark: [] },
    { label: "CVR", value: formatPct(curCVR), delta: formatDelta(pctDelta(curCVR, prevCVR)), spark: [] },
    { label: "Avg CPC", value: "$" + formatDec2(curAvgCPC), delta: formatDelta(pctDelta(curAvgCPC, prevAvgCPC), true), spark: [] },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 xl:grid-cols-5">
      {tiles.map((t) => (
        <KpiTile
          key={t.label}
          label={t.label}
          value={t.value}
          delta={previous.length > 0 ? t.delta : undefined}
          sparkData={t.spark.length > 0 ? t.spark : undefined}
        />
      ))}
    </div>
  );
}
