import { getData } from "@/data/data-repository";
import { DataSourceBanner } from "@/components/layout/data-source-banner";
import { DashboardKpis } from "@/features/dashboard/dashboard-kpis";
import { TrendChart } from "@/features/dashboard/trend-chart";
import { WhatChanged } from "@/features/dashboard/what-changed";
import { ActiveAlerts } from "@/features/dashboard/active-alerts";
import { TopOpportunities } from "@/features/dashboard/top-opportunities";

export default async function DashboardPage() {
  const data = await getData();

  return (
    <div className="space-y-6">
      <DataSourceBanner dataSource={data.dataSource} />

      <DashboardKpis dailyMetrics={data.dailyMetrics} />

      <div className="grid gap-4 lg:grid-cols-2">
        <WhatChanged changes={data.changeEvents} />
        <TopOpportunities opportunities={data.opportunities} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ActiveAlerts diagnostics={data.diagnostics} />
        <TrendChart dailyMetrics={data.dailyMetrics} />
      </div>
    </div>
  );
}
