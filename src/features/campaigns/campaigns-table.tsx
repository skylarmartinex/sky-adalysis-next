"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatUsd, formatNum, formatPct, formatRoas, formatDec2 } from "@/lib/formatters";
import { CAMPAIGN_TYPE_COLORS, STATUS_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Campaign, CampaignMetrics } from "@/data/types";

interface CampaignsTableProps {
  campaigns: Campaign[];
  metrics: Record<string, CampaignMetrics>;
}

type SortKey = "name" | "cost" | "conv" | "cpa" | "roas" | "ctr" | "is" | "status";

export function CampaignsTable({ campaigns, metrics }: CampaignsTableProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("cost");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    let list = campaigns;
    if (filter !== "all") {
      list = list.filter((c) => c.type === filter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    return list.sort((a, b) => {
      const ma = metrics[a.id] || ({} as CampaignMetrics);
      const mb = metrics[b.id] || ({} as CampaignMetrics);
      let va: number | string = 0;
      let vb: number | string = 0;
      switch (sortKey) {
        case "name": va = a.name; vb = b.name; break;
        case "status": va = a.status; vb = b.status; break;
        case "cost": va = ma.cost ?? 0; vb = mb.cost ?? 0; break;
        case "conv": va = ma.conv ?? 0; vb = mb.conv ?? 0; break;
        case "cpa": va = ma.cpa ?? 0; vb = mb.cpa ?? 0; break;
        case "roas": va = ma.roas ?? 0; vb = mb.roas ?? 0; break;
        case "ctr": va = ma.ctr ?? 0; vb = mb.ctr ?? 0; break;
        case "is": va = ma.is ?? 0; vb = mb.is ?? 0; break;
      }
      if (typeof va === "string") {
        const cmp = va.localeCompare(vb as string);
        return sortDir === "asc" ? cmp : -cmp;
      }
      return sortDir === "asc" ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
  }, [campaigns, metrics, search, filter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const SortHeader = ({ k, children }: { k: SortKey; children: React.ReactNode }) => (
    <TableHead
      className="cursor-pointer select-none text-xs hover:text-foreground"
      onClick={() => toggleSort(k)}
    >
      <span className="flex items-center gap-1">
        {children}
        {sortKey === k && (
          <span className="text-primary">{sortDir === "asc" ? "\u2191" : "\u2193"}</span>
        )}
      </span>
    </TableHead>
  );

  const filters = ["all", "Brand", "Nonbrand", "Competitor"];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search campaigns..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-64 text-xs"
        />
        <div className="flex gap-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} campaigns
        </span>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <SortHeader k="name">Campaign</SortHeader>
              <SortHeader k="status">Status</SortHeader>
              <SortHeader k="cost">Cost</SortHeader>
              <SortHeader k="conv">Conv</SortHeader>
              <SortHeader k="cpa">CPA</SortHeader>
              <SortHeader k="roas">ROAS</SortHeader>
              <SortHeader k="ctr">CTR</SortHeader>
              <SortHeader k="is">IS</SortHeader>
              <TableHead className="text-xs">Issues</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => {
              const m = metrics[c.id];
              const overCPA =
                m && c.targetCPA && c.targetCPA > 0 && m.cpa > c.targetCPA * 1.25;
              return (
                <TableRow key={c.id} className="group cursor-pointer">
                  <TableCell className="py-2.5">
                    <Link href={`/campaigns/${c.id}`} className="block">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={cn("text-[10px]", CAMPAIGN_TYPE_COLORS[c.type])}
                        >
                          {c.type}
                        </Badge>
                        <span className="text-xs font-medium group-hover:text-primary">
                          {c.name}
                        </span>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <Badge
                      variant="secondary"
                      className={cn("text-[10px]", STATUS_COLORS[c.status])}
                    >
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2.5 text-xs">{m ? formatUsd(m.cost) : "-"}</TableCell>
                  <TableCell className="py-2.5 text-xs">{m ? formatNum(m.conv) : "-"}</TableCell>
                  <TableCell
                    className={cn("py-2.5 text-xs", overCPA && "font-medium text-red-400")}
                  >
                    {m ? "$" + m.cpa.toFixed(0) : "-"}
                  </TableCell>
                  <TableCell className="py-2.5 text-xs">
                    {m ? formatRoas(m.roas) : "-"}
                  </TableCell>
                  <TableCell className="py-2.5 text-xs">
                    {m ? formatPct(m.ctr) : "-"}
                  </TableCell>
                  <TableCell className="py-2.5 text-xs">
                    {m ? formatPct(m.is) : "-"}
                  </TableCell>
                  <TableCell className="py-2.5">
                    {c.issues.length > 0 && (
                      <div className="flex gap-1">
                        {c.issues.slice(0, 2).map((issue) => (
                          <Badge
                            key={issue}
                            variant="secondary"
                            className="bg-red-500/20 text-[10px] text-red-400"
                          >
                            {issue.replace(/_/g, " ")}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
