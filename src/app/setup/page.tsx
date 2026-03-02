import { SheetsSetup } from "@/components/sheets-setup";

export const metadata = {
    title: "Sheets Setup — Adalysis",
    description: "Connect your Google Sheets to import live PPC data",
};

export default function SetupPage() {
    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <SheetsSetup />
        </div>
    );
}
