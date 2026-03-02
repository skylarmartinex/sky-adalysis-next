"use client";

import { useState, useMemo } from "react";
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
import { formatUsd, formatNum, formatPct, formatDec2 } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Keyword, Campaign } from "@/data/types";

interface KeywordsTableProps {
    keywords: Keyword[];
    campaigns: Campaign[];
}

type SortKey = "keyword" | "cost" | "clicks" | "conv" | "cpa" | "ctr" | "cvr" | "qs" | "status";

const MATCH_TYPE_COLORS: Record<string, string> = {
    Exact: "bg-blue-500/20 text-blue-400",
    Phrase: "bg-purple-500/20 text-purple-400",
    Broad: "bg-orange-500/20 text-orange-400",
};

const STATUS_COLORS: Record<string, string> = {
    Active: "bg-green-500/20 text-green-400",
    Paused: "bg-gray-500/20 text-gray-400",
    Removed: "bg-red-500/20 text-red-400",
};

const QS_COLOR = (score: number) => {
    if (score >= 7) return "text-green-400";
    if (score >= 4) return "text-yellow-400";
    if (score === 0) return "text-muted-foreground";
    return "text-red-400";
};

export function KeywordsTable({ keywords, campaigns }: KeywordsTableProps) {
    const [search, setSearch] = useState("");
    const [matchFilter, setMatchFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [campaignFilter, setCampaignFilter] = useState("all");
    const [sortKey, setSortKey] = useState<SortKey>("cost");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

    const uniqueCampaigns = useMemo(() => {
        const names = Array.from(new Set(keywords.map((k) => k.campName).filter(Boolean) as string[]));
        return names.slice(0, 20); // cap for dropdown
    }, [keywords]);

    const filtered = useMemo(() => {
        let list = keywords;

        if (matchFilter !== "all") {
            list = list.filter((k) => k.matchType === matchFilter);
        }
        if (statusFilter !== "all") {
            list = list.filter((k) => k.status === statusFilter);
        }
        if (campaignFilter !== "all") {
            list = list.filter((k) => k.campName === campaignFilter);
        }
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(
                (k) =>
                    k.keyword.toLowerCase().includes(q) ||
                    (k.campName ?? "").toLowerCase().includes(q) ||
                    (k.adGroupName ?? "").toLowerCase().includes(q)
            );
        }

        return [...list].sort((a, b) => {
            let va: number | string = 0;
            let vb: number | string = 0;
            switch (sortKey) {
                case "keyword": va = a.keyword; vb = b.keyword; break;
                case "status": va = a.status; vb = b.status; break;
                case "cost": va = a.cost; vb = b.cost; break;
                case "clicks": va = a.clicks; vb = b.clicks; break;
                case "conv": va = a.conv; vb = b.conv; break;
                case "cpa": va = a.cpa; vb = b.cpa; break;
                case "ctr": va = a.ctr; vb = b.ctr; break;
                case "cvr": va = a.cvr; vb = b.cvr; break;
                case "qs": va = a.qualityScore; vb = b.qualityScore; break;
            }
            if (typeof va === "string") {
                const cmp = va.localeCompare(vb as string);
                return sortDir === "asc" ? cmp : -cmp;
            }
            return sortDir === "asc" ? (va as number) - (vb as number) : (vb as number) - (va as number);
        });
    }, [keywords, search, matchFilter, statusFilter, campaignFilter, sortKey, sortDir]);

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("desc"); }
    };

    const SortHeader = ({ k, children }: { k: SortKey; children: React.ReactNode }) => (
        <TableHead
            className="cursor-pointer select-none text-xs hover:text-foreground"
            onClick={() => toggleSort(k)}
        >
            <span className="flex items-center gap-1">
                {children}
                {sortKey === k && (
                    <span className="text-primary">{sortDir === "asc" ? "↑" : "↓"}</span>
                )}
            </span>
        </TableHead>
    );

    if (keywords.length === 0) {
        return (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                    <span className="text-xl">🔑</span>
                </div>
                <h3 className="mb-2 text-sm font-semibold">No keywords loaded</h3>
                <p className="text-xs text-muted-foreground">
                    Publish your Keywords Google Sheet to see keyword-level performance data.{" "}
                    <a href="/setup" className="text-primary hover:underline">
                        Go to Setup →
                    </a>
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Keywords</h2>
                    <p className="text-xs text-muted-foreground">
                        Keyword-level performance from your Google Ads account
                    </p>
                </div>
                <span className="text-xs text-muted-foreground">{filtered.length} keywords</span>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
                <Input
                    placeholder="Search keywords, campaigns..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-8 w-64 text-xs"
                />

                {/* Match type */}
                <div className="flex gap-1">
                    {["all", "Exact", "Phrase", "Broad"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setMatchFilter(f)}
                            className={cn(
                                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                                matchFilter === f
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {f === "all" ? "All Match" : f}
                        </button>
                    ))}
                </div>

                {/* Status */}
                <div className="flex gap-1">
                    {["all", "Active", "Paused"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setStatusFilter(f)}
                            className={cn(
                                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                                statusFilter === f
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {f === "all" ? "All Status" : f}
                        </button>
                    ))}
                </div>

                {/* Campaign filter */}
                {uniqueCampaigns.length > 0 && (
                    <select
                        value={campaignFilter}
                        onChange={(e) => setCampaignFilter(e.target.value)}
                        className="h-8 rounded-md border border-border bg-secondary px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                        <option value="all">All Campaigns</option>
                        {uniqueCampaigns.map((name) => (
                            <option key={name} value={name}>
                                {name.length > 40 ? name.slice(0, 40) + "…" : name}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Table */}
            <div className="rounded-lg border border-border">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <SortHeader k="keyword">Keyword</SortHeader>
                            <SortHeader k="status">Status</SortHeader>
                            <TableHead className="text-xs">Match</TableHead>
                            <SortHeader k="qs">QS</SortHeader>
                            <SortHeader k="cost">Cost</SortHeader>
                            <SortHeader k="clicks">Clicks</SortHeader>
                            <SortHeader k="conv">Conv</SortHeader>
                            <SortHeader k="cpa">CPA</SortHeader>
                            <SortHeader k="ctr">CTR</SortHeader>
                            <SortHeader k="cvr">CVR</SortHeader>
                            <TableHead className="text-xs">Avg CPC</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.slice(0, 500).map((kw) => (
                            <TableRow key={kw.id} className="group">
                                <TableCell className="py-2.5">
                                    <div className="space-y-0.5">
                                        <div className="text-xs font-medium">{kw.keyword}</div>
                                        {(kw.campName || kw.adGroupName) && (
                                            <div className="text-[10px] text-muted-foreground">
                                                {kw.campName && (
                                                    <span className="truncate">{kw.campName}</span>
                                                )}
                                                {kw.campName && kw.adGroupName && " / "}
                                                {kw.adGroupName && (
                                                    <span className="text-muted-foreground/70">{kw.adGroupName}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="py-2.5">
                                    <Badge
                                        variant="secondary"
                                        className={cn("text-[10px]", STATUS_COLORS[kw.status] ?? "bg-gray-500/20 text-gray-400")}
                                    >
                                        {kw.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-2.5">
                                    <Badge
                                        variant="secondary"
                                        className={cn("text-[10px]", MATCH_TYPE_COLORS[kw.matchType] ?? "bg-gray-500/20 text-gray-400")}
                                    >
                                        {kw.matchType}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-2.5">
                                    <span className={cn("text-xs font-semibold", QS_COLOR(kw.qualityScore))}>
                                        {kw.qualityScore > 0 ? kw.qualityScore : "—"}
                                    </span>
                                </TableCell>
                                <TableCell className="py-2.5 text-xs">{formatUsd(kw.cost)}</TableCell>
                                <TableCell className="py-2.5 text-xs">{formatNum(kw.clicks)}</TableCell>
                                <TableCell className="py-2.5 text-xs">{formatNum(kw.conv)}</TableCell>
                                <TableCell className="py-2.5 text-xs">
                                    {kw.cpa > 0 ? "$" + kw.cpa.toFixed(0) : "—"}
                                </TableCell>
                                <TableCell className="py-2.5 text-xs">{formatPct(kw.ctr)}</TableCell>
                                <TableCell className="py-2.5 text-xs">{formatPct(kw.cvr)}</TableCell>
                                <TableCell className="py-2.5 text-xs">
                                    {kw.avgCpc > 0 ? "$" + formatDec2(kw.avgCpc) : "—"}
                                </TableCell>
                            </TableRow>
                        ))}
                        {filtered.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={11} className="py-8 text-center text-xs text-muted-foreground">
                                    No keywords match your filters
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                {filtered.length > 500 && (
                    <div className="border-t border-border px-4 py-2 text-center text-xs text-muted-foreground">
                        Showing first 500 of {filtered.length} rows
                    </div>
                )}
            </div>
        </div>
    );
}
