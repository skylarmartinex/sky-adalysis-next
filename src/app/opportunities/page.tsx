import { getData } from "@/data/data-repository";
import { OpportunitiesView } from "@/features/opportunities/opportunities-view";

export default async function OpportunitiesPage() {
  const data = await getData();

  return <OpportunitiesView opportunities={data.opportunities} campaigns={data.campaigns} />;
}
