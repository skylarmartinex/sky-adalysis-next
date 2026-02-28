"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Sparkline } from "@/components/charts/sparkline";

interface KpiTileProps {
  label: string;
  value: string;
  delta?: { text: string; positive: boolean };
  sparkData?: number[];
  className?: string;
}

export function KpiTile({ label, value, delta, sparkData, className }: KpiTileProps) {
  return (
    <Card className={cn("relative overflow-hidden p-4", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-xl font-bold tracking-tight">{value}</p>
          {delta && (
            <p
              className={cn(
                "text-xs font-medium",
                delta.positive ? "text-green-400" : "text-red-400"
              )}
            >
              {delta.text}
            </p>
          )}
        </div>
        {sparkData && sparkData.length > 0 && (
          <Sparkline
            data={sparkData}
            width={72}
            height={32}
            className="mt-1 opacity-60"
          />
        )}
      </div>
    </Card>
  );
}
