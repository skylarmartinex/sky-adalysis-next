"use client";

import { usePathname } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/campaigns": "Campaigns",
  "/opportunities": "Opportunities",
  "/reporting": "Reporting Studio",
};

export function Topbar() {
  const pathname = usePathname();

  const title =
    PAGE_TITLES[pathname] ||
    (pathname.startsWith("/campaigns/") ? "Campaign Detail" : "Adalysis");

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <h1 className="text-[15px] font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Last 30 days
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>
    </header>
  );
}
