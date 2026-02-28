import { Badge } from "@/components/ui/badge";
import type { DataSourceMeta } from "@/data/types";

interface DataSourceBannerProps {
  dataSource: DataSourceMeta;
}

export function DataSourceBanner({ dataSource }: DataSourceBannerProps) {
  if (dataSource.source === "live" && dataSource.unpublished.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5">
      <Badge
        variant="secondary"
        className={
          dataSource.source === "live"
            ? "bg-green-500/20 text-green-400"
            : "bg-yellow-500/20 text-yellow-400"
        }
      >
        {dataSource.source === "live" ? "Live Data" : "Mock Data"}
      </Badge>
      <span className="text-xs text-muted-foreground">
        {dataSource.source === "mock"
          ? "Using demo data. Connect Google Sheets for live data."
          : `${dataSource.unpublished.length} sheet(s) not yet published.`}
      </span>
    </div>
  );
}
