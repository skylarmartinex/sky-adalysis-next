"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { usePeriod } from "@/lib/period-context";
import type { DailyMetric } from "@/data/types";

interface TrendChartProps {
  dailyMetrics: DailyMetric[];
}

const PERIOD_LABELS: Record<number, string> = {
  7: "7-Day Trend",
  14: "14-Day Trend",
  30: "30-Day Trend",
};

export function TrendChart({ dailyMetrics }: TrendChartProps) {
  const { period } = usePeriod();

  // Show current period + the equal prior period for comparison context
  const sliced = dailyMetrics.slice(-(period * 2));
  const splitIdx = sliced.length - period; // where "prior" ends and "current" begins

  const data = sliced.map((d, i) => ({
    date: d.date.slice(5),
    cost: Math.round(d.cost),
    conv: Math.round(d.conv * 10) / 10,
    isPrior: i < splitIdx,
  }));

  // The date at the split point (start of current period) for the reference line
  const splitDate = data[splitIdx]?.date;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {PERIOD_LABELS[period] ?? `${period}-Day Trend`}
          </CardTitle>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-4 rounded" style={{ background: "#3b82f688" }} />
              Cost
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-4 rounded" style={{ background: "#22c55e88" }} />
              Conv
            </span>
            <span className="flex items-center gap-1.5 border-l border-border pl-3">
              <span className="inline-block h-px w-3 border-t border-dashed border-muted-foreground/50" />
              Prior period
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3348" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "#2a3348" }}
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="cost"
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <YAxis
                yAxisId="conv"
                orientation="right"
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#161b27",
                  border: "1px solid #2a3348",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#e2e8f0",
                }}
                formatter={(value, name) => [
                  name === "cost" ? `$${Number(value).toLocaleString()}` : value,
                  name === "cost" ? "Cost" : "Conversions",
                ]}
              />
              {/* Dashed reference line at the period boundary */}
              {splitDate && (
                <ReferenceLine
                  yAxisId="cost"
                  x={splitDate}
                  stroke="#64748b"
                  strokeDasharray="4 3"
                  strokeWidth={1}
                  label={{
                    value: "prior ▸ current",
                    position: "insideTopRight",
                    fill: "#64748b",
                    fontSize: 10,
                  }}
                />
              )}
              <Area
                yAxisId="cost"
                type="monotone"
                dataKey="cost"
                stroke="#3b82f6"
                fill="url(#costGrad)"
                strokeWidth={2}
                name="cost"
                dot={false}
                activeDot={{ r: 4, fill: "#3b82f6" }}
              />
              <Area
                yAxisId="conv"
                type="monotone"
                dataKey="conv"
                stroke="#22c55e"
                fill="url(#convGrad)"
                strokeWidth={2}
                name="conv"
                dot={false}
                activeDot={{ r: 4, fill: "#22c55e" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
