"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KpiTile } from "@/components/shared/kpi-tile";
import { CAMPAIGN_TYPE_COLORS, STATUS_COLORS, SEVERITY_COLORS } from "@/lib/constants";
import { formatUsd, formatNum, formatPct, formatRoas, formatDec2, pctDelta, formatDelta } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import type { Campaign, CampaignMetrics, Diagnostic, ChangeEvent, SearchTerm, RSAAsset } from "@/data/types";

interface CampaignDetailViewProps {
  campaign: Campaign;
  metrics: CampaignMetrics | undefined;
  diagnostics: Diagnostic[];
  changes: ChangeEvent[];
  searchTerms: SearchTerm[];
  rsaAssets: RSAAsset[];
}

export function CampaignDetailView({
  campaign,
  metrics,
  diagnostics,
  changes,
  searchTerms,
  rsaAssets,
}: CampaignDetailViewProps) {
  const m = metrics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/campaigns" className="rounded-md p-1.5 hover:bg-secondary">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{campaign.name}</h2>
            <Badge variant="secondary" className={cn("text-[10px]", CAMPAIGN_TYPE_COLORS[campaign.type])}>
              {campaign.type}
            </Badge>
            <Badge variant="secondary" className={cn("text-[10px]", STATUS_COLORS[campaign.status])}>
              {campaign.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {campaign.bidStrategy} &middot; Budget: ${campaign.dailyBudget}/day
            {campaign.targetCPA ? ` \u00b7 Target CPA: $${campaign.targetCPA}` : ""}
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-secondary">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="diagnostics" className="text-xs">
            Diagnostics
            {diagnostics.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 bg-red-500/20 text-[10px] text-red-400">
                {diagnostics.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="changelog" className="text-xs">Changelog</TabsTrigger>
          <TabsTrigger value="search-terms" className="text-xs">Search Terms</TabsTrigger>
          <TabsTrigger value="rsa" className="text-xs">RSA</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 pt-4">
          {m ? (
            <>
              <div className="grid grid-cols-4 gap-3">
                <KpiTile label="Cost" value={formatUsd(m.cost)} delta={formatDelta(pctDelta(m.cost, m.prevCost), true)} />
                <KpiTile label="Conversions" value={formatNum(m.conv)} delta={formatDelta(pctDelta(m.conv, m.prevConv))} />
                <KpiTile label="CPA" value={"$" + m.cpa.toFixed(0)} delta={formatDelta(pctDelta(m.cpa, m.prevCPA), true)} />
                <KpiTile label="ROAS" value={formatRoas(m.roas)} delta={formatDelta(pctDelta(m.roas, m.prevROAS))} />
              </div>
              <div className="grid grid-cols-4 gap-3">
                <KpiTile label="CTR" value={formatPct(m.ctr)} />
                <KpiTile label="CVR" value={formatPct(m.cvr)} />
                <KpiTile label="Avg CPC" value={"$" + formatDec2(m.avgCpc)} />
                <KpiTile label="Impressions" value={formatNum(m.impressions)} />
              </div>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Impression Share</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex h-6 overflow-hidden rounded-full">
                      <div className="bg-primary" style={{ width: `${m.is}%` }} title={`Captured: ${m.is.toFixed(1)}%`} />
                      <div className="bg-yellow-500/60" style={{ width: `${m.isLostBudget}%` }} title={`Lost Budget: ${m.isLostBudget.toFixed(1)}%`} />
                      <div className="bg-red-500/60" style={{ width: `${m.isLostRank}%` }} title={`Lost Rank: ${m.isLostRank.toFixed(1)}%`} />
                      <div className="flex-1 bg-secondary" />
                    </div>
                    <div className="flex gap-4 text-[11px] text-muted-foreground">
                      <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-primary" />Captured: {m.is.toFixed(1)}%</span>
                      <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-yellow-500/60" />Lost Budget: {m.isLostBudget.toFixed(1)}%</span>
                      <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-red-500/60" />Lost Rank: {m.isLostRank.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              No metrics available for this campaign (paused).
            </Card>
          )}
        </TabsContent>

        {/* Diagnostics Tab */}
        <TabsContent value="diagnostics" className="space-y-3 pt-4">
          {diagnostics.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              No active diagnostics for this campaign.
            </Card>
          ) : (
            diagnostics.map((d) => (
              <Collapsible key={d.id}>
                <Card>
                  <CollapsibleTrigger className="w-full text-left">
                    <CardHeader className="pb-2">
                      <div className="flex items-start gap-3">
                        <Badge variant="secondary" className={cn("mt-0.5 shrink-0 text-[10px]", SEVERITY_COLORS[d.severity])}>
                          {d.severity}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{d.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{d.signal}</p>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <span>{d.confidence}%</span>
                          <div className="h-1 w-12 rounded-full bg-secondary">
                            <div className="h-1 rounded-full bg-primary" style={{ width: `${d.confidence}%` }} />
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-4 pt-0">
                      <div>
                        <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Evidence</p>
                        <ul className="space-y-1">
                          {d.evidence.map((e, i) => (
                            <li key={i} className="flex gap-2 text-xs">
                              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                              {e}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Likely Causes</p>
                        <ul className="space-y-1">
                          {d.likelyCauses.map((c, i) => (
                            <li key={i} className="flex gap-2 text-xs">
                              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-yellow-400" />
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Recommended Actions</p>
                        <ol className="space-y-1">
                          {d.recommendedActions.map((a, i) => (
                            <li key={i} className="flex gap-2 text-xs">
                              <span className="shrink-0 font-bold text-primary">{i + 1}.</span>
                              {a}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))
          )}
        </TabsContent>

        {/* Changelog Tab */}
        <TabsContent value="changelog" className="space-y-3 pt-4">
          {changes.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              No changes recorded for this campaign.
            </Card>
          ) : (
            changes.map((c) => (
              <Card key={c.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "mt-1 h-2 w-2 shrink-0 rounded-full",
                      c.impact === "high" ? "bg-red-400" : c.impact === "positive" ? "bg-green-400" : "bg-yellow-400"
                    )} />
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{c.description}</span>
                        <Badge variant="secondary" className={cn("text-[10px]", c.impact === "high" ? "bg-red-500/20 text-red-400" : c.impact === "positive" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400")}>
                          {c.impact}
                        </Badge>
                      </div>
                      <div className="flex gap-4 text-[11px] text-muted-foreground">
                        <span>{c.date}</span>
                        <span>{c.user}</span>
                      </div>
                      <div className="flex gap-2 text-[11px]">
                        <span className="text-red-400/80">Before: {c.before}</span>
                        <span className="text-muted-foreground">&rarr;</span>
                        <span className="text-green-400/80">After: {c.after}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground italic">{c.correlatedKpiShift}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Search Terms Tab */}
        <TabsContent value="search-terms" className="space-y-4 pt-4">
          {searchTerms.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              No search term data for this campaign.
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                <KpiTile label="Waste Queries" value={String(searchTerms.filter((s) => s.status === "waste").length)} />
                <KpiTile label="Converting" value={String(searchTerms.filter((s) => s.status === "converting").length)} />
                <KpiTile label="High CPA" value={String(searchTerms.filter((s) => s.status === "high_cpa").length)} />
              </div>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Search Terms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-border">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground">
                          <th className="px-3 py-2 text-left font-medium">Query</th>
                          <th className="px-3 py-2 text-left font-medium">Status</th>
                          <th className="px-3 py-2 text-right font-medium">Cost</th>
                          <th className="px-3 py-2 text-right font-medium">Clicks</th>
                          <th className="px-3 py-2 text-right font-medium">Conv</th>
                          <th className="px-3 py-2 text-right font-medium">CPA</th>
                          <th className="px-3 py-2 text-left font-medium">Theme</th>
                        </tr>
                      </thead>
                      <tbody>
                        {searchTerms.map((st) => (
                          <tr key={st.id} className="border-b border-border/50 last:border-0">
                            <td className="px-3 py-2 font-medium">{st.query}</td>
                            <td className="px-3 py-2">
                              <Badge variant="secondary" className={cn("text-[10px]",
                                st.status === "waste" ? "bg-red-500/20 text-red-400" :
                                st.status === "converting" ? "bg-green-500/20 text-green-400" :
                                "bg-yellow-500/20 text-yellow-400"
                              )}>
                                {st.status}
                              </Badge>
                            </td>
                            <td className="px-3 py-2 text-right">{formatUsd(st.cost)}</td>
                            <td className="px-3 py-2 text-right">{st.clicks}</td>
                            <td className="px-3 py-2 text-right">{st.conv}</td>
                            <td className="px-3 py-2 text-right">{st.cpa > 0 ? "$" + st.cpa.toFixed(0) : "-"}</td>
                            <td className="px-3 py-2 text-muted-foreground">{st.theme}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* RSA Tab */}
        <TabsContent value="rsa" className="space-y-3 pt-4">
          {rsaAssets.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              No RSA data for this campaign.
            </Card>
          ) : (
            rsaAssets.map((rsa) => {
              const strengthColor =
                rsa.strength === "Excellent" ? "bg-green-500/20 text-green-400" :
                rsa.strength === "Good" ? "bg-blue-500/20 text-blue-400" :
                rsa.strength === "Average" ? "bg-yellow-500/20 text-yellow-400" :
                "bg-red-500/20 text-red-400";
              const strengthPct =
                rsa.strength === "Excellent" ? 100 :
                rsa.strength === "Good" ? 75 :
                rsa.strength === "Average" ? 50 : 25;
              return (
                <Card key={rsa.adId}>
                  <CardContent className="space-y-4 p-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className={cn("text-[10px]", strengthColor)}>
                        {rsa.strength}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{rsa.adId}</span>
                      <div className="ml-auto flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">Strength</span>
                        <Progress value={strengthPct} className="h-1.5 w-20" />
                      </div>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold text-muted-foreground">Headlines ({rsa.headlines.length})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {rsa.headlines.map((h, i) => (
                          <span key={i} className={cn(
                            "rounded border px-2 py-0.5 text-[11px]",
                            rsa.topHeadlines.includes(h) ? "border-green-500/30 bg-green-500/10 text-green-400" :
                            rsa.poorHeadlines.includes(h) ? "border-red-500/30 bg-red-500/10 text-red-400" :
                            "border-border bg-secondary"
                          )}>
                            {rsa.pinnedHeadlines.includes(i) && <span className="mr-1 text-yellow-400">&#128204;</span>}
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold text-muted-foreground">Descriptions ({rsa.descriptions.length})</p>
                      <div className="space-y-1">
                        {rsa.descriptions.map((d, i) => (
                          <p key={i} className="rounded border border-border bg-secondary px-2 py-1 text-[11px]">{d}</p>
                        ))}
                      </div>
                    </div>
                    {rsa.recommendations.length > 0 && (
                      <div>
                        <p className="mb-1 text-xs font-semibold text-muted-foreground">Recommendations</p>
                        <ul className="space-y-1">
                          {rsa.recommendations.map((r, i) => (
                            <li key={i} className="flex gap-2 text-xs text-yellow-400/90">
                              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-yellow-400" />
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
