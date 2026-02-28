import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Diagnostic } from "@/data/types";
import { cn } from "@/lib/utils";
import { SEVERITY_COLORS } from "@/lib/constants";

interface ActiveAlertsProps {
  diagnostics: Diagnostic[];
}

export function ActiveAlerts({ diagnostics }: ActiveAlertsProps) {
  const alerts = diagnostics.filter((d) => d.severity !== "info").slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.map((d) => (
          <Link
            key={d.id}
            href={`/campaigns/${d.campId}?tab=diagnostics`}
            className="flex items-start gap-3 rounded-md border border-border/50 p-3 transition-colors hover:bg-secondary/50"
          >
            <Badge
              variant="secondary"
              className={cn("mt-0.5 shrink-0 text-[10px]", SEVERITY_COLORS[d.severity])}
            >
              {d.severity}
            </Badge>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium leading-tight">{d.title}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{d.signal}</p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
