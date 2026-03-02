"use client";

import { usePathname } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePeriod, type Period } from "@/lib/period-context";
import { cn } from "@/lib/utils";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/campaigns": "Campaigns",
  "/keywords": "Keywords",
  "/opportunities": "Opportunities",
  "/reporting": "Reporting Studio",
  "/setup": "Sheets Setup",
};

const PERIODS: { label: string; value: Period }[] = [
  { label: "7d", value: 7 },
  { label: "14d", value: 14 },
  { label: "30d", value: 30 },
];

export function Topbar() {
  const pathname = usePathname();
  const { period, setPeriod } = usePeriod();

  const title =
    PAGE_TITLES[pathname] ||
    (pathname.startsWith("/campaigns/") ? "Campaign Detail" : "Adalysis");

  const isDashboard = pathname === "/";

  async function handleRefresh() {
    await fetch("/api/refresh", { method: "POST" });
    window.location.reload();
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <h1 className="text-[15px] font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Period selector — only on dashboard */}
        {isDashboard && (
          <div className="flex items-center rounded-md border border-border bg-secondary/50 p-0.5">
            {PERIODS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setPeriod(value)}
                className={cn(
                  "rounded px-3 py-1 text-xs font-medium transition-all duration-150",
                  period === value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Period label on non-dashboard pages */}
        {!isDashboard && (
          <div className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Last 30 days
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleRefresh}
          title="Refresh data"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>
    </header>
  );
}
