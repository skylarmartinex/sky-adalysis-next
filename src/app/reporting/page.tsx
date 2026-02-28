import { getData } from "@/data/data-repository";
import { ReportingView } from "@/features/reporting/reporting-view";

export default async function ReportingPage() {
  const data = await getData();

  return <ReportingView report={data.weeklyReport} />;
}
