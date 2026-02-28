import { notFound } from "next/navigation";
import { getData } from "@/data/data-repository";
import { CampaignDetailView } from "@/features/campaign-detail/campaign-detail-view";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CampaignDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await getData();

  const campaign = data.campaigns.find((c) => c.id === id);
  if (!campaign) notFound();

  const metrics = data.campaignMetrics[id];
  const diagnostics = data.diagnostics.filter((d) => d.campId === id);
  const changes = data.changeEvents.filter((c) => c.campId === id);
  const searchTerms = data.searchTerms.filter((s) => s.campId === id);
  const rsaAssets = data.rsaAssets.filter((r) => r.campId === id);

  return (
    <CampaignDetailView
      campaign={campaign}
      metrics={metrics}
      diagnostics={diagnostics}
      changes={changes}
      searchTerms={searchTerms}
      rsaAssets={rsaAssets}
    />
  );
}
