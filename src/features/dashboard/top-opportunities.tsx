import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatUsdFull } from "@/lib/formatters";
import type { Opportunity } from "@/data/types";
import { cn } from "@/lib/utils";
import { IMPACT_COLORS } from "@/lib/constants";

interface TopOpportunitiesProps {
  opportunities: Opportunity[];
}

export function TopOpportunities({ opportunities }: TopOpportunitiesProps) {
  const top = opportunities.slice(0, 4);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Top Opportunities</CardTitle>
        <Link href="/opportunities" className="text-xs text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {top.map((opp) => (
          <div
            key={opp.id}
            className="flex items-start gap-3 rounded-md border border-border/50 p-3"
          >
            <div
              className={cn(
                "mt-1 h-2 w-2 shrink-0 rounded-full",
                opp.impact === "high" ? "bg-red-400" : "bg-yellow-400"
              )}
            />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-xs font-medium leading-tight">{opp.title}</p>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={cn("text-[10px]", IMPACT_COLORS[opp.impact])}
                >
                  {opp.impact} impact
                </Badge>
                {opp.estimatedSavings > 0 && (
                  <span className="text-[11px] text-green-400">
                    Save {formatUsdFull(opp.estimatedSavings)}
                  </span>
                )}
                {opp.estimatedConvGain > 0 && (
                  <span className="text-[11px] text-blue-400">
                    +{opp.estimatedConvGain} conv
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground">
                  Confidence: {opp.confidence}%
                </span>
                <div className="h-1 w-16 rounded-full bg-secondary">
                  <div
                    className="h-1 rounded-full bg-primary"
                    style={{ width: `${opp.confidence}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
