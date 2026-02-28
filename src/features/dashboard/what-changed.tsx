import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ChangeEvent } from "@/data/types";
import { cn } from "@/lib/utils";

const IMPACT_STYLES: Record<string, string> = {
  high: "bg-red-500/20 text-red-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  low: "bg-blue-500/20 text-blue-400",
  positive: "bg-green-500/20 text-green-400",
};

interface WhatChangedProps {
  changes: ChangeEvent[];
}

export function WhatChanged({ changes }: WhatChangedProps) {
  const recent = changes.slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">What Changed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recent.map((c) => (
          <div
            key={c.id}
            className="flex items-start gap-3 rounded-md border border-border/50 p-3"
          >
            <div
              className={cn(
                "mt-0.5 h-2 w-2 shrink-0 rounded-full",
                c.impact === "high"
                  ? "bg-red-400"
                  : c.impact === "positive"
                    ? "bg-green-400"
                    : "bg-yellow-400"
              )}
            />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-xs font-medium leading-tight">{c.description}</p>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">{c.date}</span>
                <Badge
                  variant="secondary"
                  className={cn("text-[10px]", IMPACT_STYLES[c.impact])}
                >
                  {c.impact}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">{c.correlatedKpiShift}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
