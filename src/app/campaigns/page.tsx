import { getData } from "@/data/data-repository";
import { DataSourceBanner } from "@/components/layout/data-source-banner";
import { CampaignsTable } from "@/features/campaigns/campaigns-table";

export default async function CampaignsPage() {
  const data = await getData();

  return (
    <div className="space-y-6">
      <DataSourceBanner dataSource={data.dataSource} />
      <CampaignsTable campaigns={data.campaigns} metrics={data.campaignMetrics} />
    </div>
  );
}
