import { NextResponse } from "next/server";
import { checkSheetsStatus, SHEET_IDS } from "@/data/sheets-loader";

export async function GET() {
  const status = await checkSheetsStatus();
  return NextResponse.json({
    status,
    sheetIds: SHEET_IDS,
    publishInstructions:
      "For each sheet: File > Share > Publish to web > Entire Document > CSV > Publish",
  });
}
