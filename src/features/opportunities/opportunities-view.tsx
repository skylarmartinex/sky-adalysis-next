"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { KpiTile } from "@/components/shared/kpi-tile";
import { formatUsdFull } from "@/lib/formatters";
import { IMPACT_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Opportunity, Campaign } from "@/data/types";

interface OpportunitiesViewProps {
  opportunities: Opportunity[];
  campaigns: Campaign[];
}

export function OpportunitiesView({ opportunities, campaigns }: OpportunitiesViewProps) {
  const [filter, setFilter] = useState("all");

  const categories = useMemo(() => {
    const cats = new Set(opportunities.map((o) => o.category));
    return ["all", ...Array.from(cats)];
  }, [opportunities]);

  const filtered = useMemo(() => {
    if (filter === "all") return opportunities;
    return opportunities.filter((o) => o.category === filter);
  }, [opportunities, filter]);

  const totalSavings = opportunities.reduce((s, o) => s + o.estimatedSavings, 0);
  const totalConvGain = opportunities.reduce((s, o) => s + o.estimatedConvGain, 0);
  const avgConfidence = Math.round(
    opportunities.reduce((s, o) => s + o.confidence, 0) / opportunities.length
  );

  const getCampNames = (ids: string[]) =>
    ids
      .map((id) => campaigns.find((c) => c.id === id)?.name || id)
      .join(", ");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <KpiTile label="Est. Savings" value={formatUsdFull(totalSavings)} />
        <KpiTile label="Est. Conv Gain" value={`+${totalConvGain}`} />
        <KpiTile label="Avg Confidence" value={`${avgConfidence}%`} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium transition-colors",
              filter === cat
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            {cat === "all" ? "All" : cat.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((opp) => (
          <Collapsible key={opp.id}>
            <Card>
              <CollapsibleTrigger className="w-full text-left">
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                        opp.impact === "high" ? "bg-red-400" : opp.impact === "medium" ? "bg-yellow-400" : "bg-green-400"
                      )}
                    />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{opp.title}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className={cn("text-[10px]", IMPACT_COLORS[opp.impact])}>
                          {opp.impact} impact
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {opp.effort} effort
                        </Badge>
                        {opp.estimatedSavings > 0 && (
                          <span className="text-[11px] text-green-400">
                            Save {formatUsdFull(opp.estimatedSavings)}
                          </span>
                        )}
                        {opp.estimatedConvGain > 0 && (
                          <span className="text-[11px] text-blue-400">+{opp.estimatedConvGain} conv</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      {opp.confidence}%
                      <div className="h-1 w-12 rounded-full bg-secondary">
                        <div className="h-1 rounded-full bg-primary" style={{ width: `${opp.confidence}%` }} />
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-3 pt-0">
                  <p className="text-xs text-muted-foreground">{opp.description}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Campaigns: {getCampNames(opp.campIds)}
                  </p>
                  <div>
                    <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Implementation Steps</p>
                    <ol className="space-y-1">
                      {opp.implementation.map((step, i) => (
                        <li key={i} className="flex gap-2 text-xs">
                          <span className="shrink-0 font-bold text-primary">{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}
