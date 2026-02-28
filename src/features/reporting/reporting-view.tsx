import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { KpiTile } from "@/components/shared/kpi-tile";
import { formatUsdFull, formatNum, formatRoas, pctDelta, formatDelta } from "@/lib/formatters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { WeeklyReport } from "@/data/types";

interface ReportingViewProps {
  report: WeeklyReport;
}

export function ReportingView({ report }: ReportingViewProps) {
  const s = report.summary;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Weekly Performance Report
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {report.period} &middot; {report.account}
              </p>
            </div>
            <Badge variant="secondary" className="text-[10px]">
              Generated {report.generatedAt}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-4 gap-3">
        <KpiTile
          label="Total Cost"
          value={formatUsdFull(s.totalCost)}
          delta={formatDelta(pctDelta(s.totalCost, s.prevCost), true)}
        />
        <KpiTile
          label="Conversions"
          value={formatNum(s.totalConv)}
          delta={formatDelta(pctDelta(s.totalConv, s.prevConv))}
        />
        <KpiTile
          label="CPA"
          value={"$" + s.totalCPA.toFixed(0)}
          delta={formatDelta(pctDelta(s.totalCPA, s.prevCPA), true)}
        />
        <KpiTile
          label="ROAS"
          value={formatRoas(s.totalROAS)}
          delta={formatDelta(pctDelta(s.totalROAS, s.prevROAS))}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-400">Wins</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.wins.map((w, i) => (
                <li key={i} className="flex gap-2 text-xs">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
                  {w}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-400">Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.challenges.map((c, i) => (
                <li key={i} className="flex gap-2 text-xs">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                  {c}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-400">Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {report.nextSteps.map((step, i) => (
              <li key={i} className="flex gap-2 text-xs">
                <span className="shrink-0 font-bold text-primary">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Performing</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Campaign</TableHead>
                  <TableHead className="text-xs">Cost</TableHead>
                  <TableHead className="text-xs">Conv</TableHead>
                  <TableHead className="text-xs">CPA</TableHead>
                  <TableHead className="text-xs">ROAS</TableHead>
                  <TableHead className="text-xs">Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.tables.topCampaigns.map((c) => (
                  <TableRow key={c.name}>
                    <TableCell className="text-xs font-medium">{c.name}</TableCell>
                    <TableCell className="text-xs">{formatUsdFull(c.cost)}</TableCell>
                    <TableCell className="text-xs">{c.conv}</TableCell>
                    <TableCell className="text-xs">${c.cpa.toFixed(0)}</TableCell>
                    <TableCell className="text-xs">{formatRoas(c.roas)}</TableCell>
                    <TableCell className="text-xs text-green-400">{c.change}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Campaign</TableHead>
                  <TableHead className="text-xs">Cost</TableHead>
                  <TableHead className="text-xs">Conv</TableHead>
                  <TableHead className="text-xs">CPA</TableHead>
                  <TableHead className="text-xs">Issue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.tables.alertCampaigns.map((c) => (
                  <TableRow key={c.name}>
                    <TableCell className="text-xs font-medium">{c.name}</TableCell>
                    <TableCell className="text-xs">{formatUsdFull(c.cost)}</TableCell>
                    <TableCell className="text-xs">{c.conv}</TableCell>
                    <TableCell className="text-xs text-red-400">${c.cpa.toFixed(0)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-red-500/20 text-[10px] text-red-400">
                        {c.issue}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
