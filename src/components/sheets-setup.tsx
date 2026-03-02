"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SheetStatusResult {
    status: Record<string, "ok" | "unpublished" | "error">;
    sheetIds: Record<string, string>;
    urls: Record<string, string>;
    editUrls: Record<string, string>;
    publishInstructions: string;
}

const SHEET_LABELS: Record<string, string> = {
    campaigns: "Campaigns Sheet",
    searchTerms: "Search Terms Sheet",
    keywords: "Keywords Sheet",
};

const SHEET_DESCRIPTIONS: Record<string, string> = {
    campaigns: "Campaign-level performance metrics (cost, conversions, IS, etc.)",
    searchTerms: "Search term report to identify negative keyword opportunities",
    keywords: "Keyword-level data including Quality Score and bid info",
};

const STATUS_CONFIG = {
    ok: { label: "Connected", className: "bg-green-500/20 text-green-400 border-green-500/30" },
    unpublished: { label: "Not Published", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    error: { label: "Error", className: "bg-red-500/20 text-red-400 border-red-500/30" },
};

export function SheetsSetup() {
    const [sheetsData, setSheetsData] = useState<SheetStatusResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [lastChecked, setLastChecked] = useState<Date | null>(null);

    async function checkStatus() {
        setLoading(true);
        try {
            const res = await fetch("/api/sheets");
            const data = await res.json();
            setSheetsData(data);
            setLastChecked(new Date());
        } catch {
            // swallow
        } finally {
            setLoading(false);
        }
    }

    async function refreshCache() {
        setRefreshing(true);
        try {
            await fetch("/api/refresh", { method: "POST" });
            await checkStatus();
        } finally {
            setRefreshing(false);
        }
    }

    useEffect(() => {
        checkStatus();
    }, []);

    const allConnected = sheetsData && Object.values(sheetsData.status).every((s) => s === "ok");
    const anyConnected = sheetsData && Object.values(sheetsData.status).some((s) => s === "ok");

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Google Sheets Setup</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Connect your Google Ads data exports to power the Adalysis dashboard with live data.
                </p>
            </div>

            {/* Status card */}
            <Card className="p-5">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div
                            className={cn(
                                "h-2 w-2 rounded-full",
                                allConnected ? "bg-green-400" : anyConnected ? "bg-yellow-400" : "bg-red-400"
                            )}
                        />
                        <h2 className="text-sm font-semibold">Connection Status</h2>
                        {lastChecked && (
                            <span className="text-xs text-muted-foreground">
                                — checked {lastChecked.toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={checkStatus}
                            disabled={loading}
                            className="h-7 text-xs"
                        >
                            {loading ? "Checking..." : "Check Status"}
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={refreshCache}
                            disabled={refreshing}
                            className="h-7 text-xs"
                        >
                            {refreshing ? "Refreshing..." : "Refresh Cache"}
                        </Button>
                    </div>
                </div>

                <div className="space-y-3">
                    {sheetsData ? (
                        Object.entries(sheetsData.status).map(([sheetKey, status]) => {
                            const cfg = STATUS_CONFIG[status];
                            return (
                                <div
                                    key={sheetKey}
                                    className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-3"
                                >
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">
                                                {SHEET_LABELS[sheetKey] ?? sheetKey}
                                            </span>
                                            <Badge variant="secondary" className={cn("text-[10px]", cfg.className)}>
                                                {cfg.label}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {SHEET_DESCRIPTIONS[sheetKey]}
                                        </p>
                                        {sheetsData.editUrls?.[sheetKey] && (
                                            <div className="flex gap-3 pt-1">
                                                <a
                                                    href={sheetsData.editUrls[sheetKey]}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[11px] text-primary hover:underline"
                                                >
                                                    Open Sheet ↗
                                                </a>
                                                <span className="text-[11px] font-mono text-muted-foreground/60">
                                                    ID: {sheetsData.sheetIds?.[sheetKey]}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-4 text-center text-xs text-muted-foreground">
                            {loading ? "Checking sheet status..." : "Click 'Check Status' to test connections"}
                        </div>
                    )}
                </div>
            </Card>

            {/* Step-by-step instructions */}
            <Card className="p-5">
                <h2 className="mb-4 text-sm font-semibold">How to Connect Your Sheets</h2>
                <div className="space-y-4">
                    {[
                        {
                            step: "1",
                            title: "Export from Google Ads",
                            desc: "In Google Ads, go to Campaigns, Search Terms, or Keywords report. Click Download → Google Sheets to export the data.",
                        },
                        {
                            step: "2",
                            title: "Note the Sheet IDs",
                            desc: "The sheet ID is in the URL: docs.google.com/spreadsheets/d/[SHEET_ID]/edit. Copy the IDs for each of your three sheets.",
                        },
                        {
                            step: "3",
                            title: "Publish Each Sheet as CSV",
                            desc: 'In each Google Sheet: File → Share → Publish to web → choose "Entire Document" and "CSV" format, then click Publish.',
                        },
                        {
                            step: "4",
                            title: "Set Environment Variables (Optional)",
                            desc: "Create a .env.local file with your custom sheet IDs. The defaults are pre-configured for Skylar\'s accounts.",
                        },
                        {
                            step: "5",
                            title: "Verify Connection",
                            desc: 'Click "Check Status" above. Green badges indicate the sheet is accessible. The dashboard will automatically use live data.',
                        },
                    ].map((s) => (
                        <div key={s.step} className="flex gap-3">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                                {s.step}
                            </div>
                            <div>
                                <div className="text-sm font-medium">{s.title}</div>
                                <div className="mt-0.5 text-xs text-muted-foreground">{s.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Environment variable reference */}
            <Card className="p-5">
                <h2 className="mb-3 text-sm font-semibold">Environment Variables</h2>
                <p className="mb-3 text-xs text-muted-foreground">
                    Create a <code className="rounded bg-secondary px-1 font-mono text-xs">.env.local</code> file
                    in the project root with your Sheet IDs:
                </p>
                <pre className="overflow-x-auto rounded-lg bg-secondary/80 p-4 text-xs font-mono text-foreground">
                    {`# .env.local
SHEETS_CAMPAIGNS_ID=your_campaigns_sheet_id
SHEETS_SEARCH_TERMS_ID=your_search_terms_sheet_id
SHEETS_KEYWORDS_ID=your_keywords_sheet_id`}
                </pre>
                <p className="mt-3 text-xs text-muted-foreground">
                    If these are not set, the app falls back to the default Sheet IDs which are already configured.
                    Mock data is used if the sheets are not published or accessible.
                </p>
            </Card>

            {/* Expected column structure */}
            <Card className="p-5">
                <h2 className="mb-3 text-sm font-semibold">Expected Sheet Columns</h2>
                <p className="mb-3 text-xs text-muted-foreground">
                    The importer auto-maps Google Ads standard column names. Standard Google Ads CSV exports work out of the box.
                </p>
                <div className="space-y-4">
                    {[
                        {
                            name: "Campaigns Sheet",
                            cols: ["Campaign", "Campaign Status", "Budget", "Cost", "Clicks", "Impressions", "Conversions", "Conv. value", "CTR", "Search Impr. share", "Bid Strategy Type", "Target CPA"],
                        },
                        {
                            name: "Search Terms Sheet",
                            cols: ["Search term", "Campaign", "Ad group", "Match type", "Cost", "Clicks", "Impressions", "Conversions"],
                        },
                        {
                            name: "Keywords Sheet",
                            cols: ["Keyword", "Campaign", "Ad group", "Match type", "Status", "Cost", "Clicks", "Impressions", "Conversions", "Quality Score", "Avg. CPC", "Max CPC"],
                        },
                    ].map((sheet) => (
                        <div key={sheet.name}>
                            <div className="mb-1.5 text-xs font-medium text-foreground">{sheet.name}</div>
                            <div className="flex flex-wrap gap-1.5">
                                {sheet.cols.map((col) => (
                                    <code key={col} className="rounded bg-secondary px-1.5 py-0.5 text-[11px] font-mono text-muted-foreground">
                                        {col}
                                    </code>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
