import { getData } from "@/data/data-repository";
import { DataSourceBanner } from "@/components/layout/data-source-banner";
import { KeywordsTable } from "@/features/keywords/keywords-table";

export const metadata = {
    title: "Keywords — Adalysis",
    description: "Keyword performance analysis for your Google Ads campaigns",
};

export default async function KeywordsPage() {
    const data = await getData();

    return (
        <div className="space-y-6">
            <DataSourceBanner dataSource={data.dataSource} />
            <KeywordsTable keywords={data.keywords} campaigns={data.campaigns} />
        </div>
    );
}
