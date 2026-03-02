import { NextResponse } from "next/server";
import { checkSheetsStatus } from "@/data/sheets-loader";

export async function GET() {
    const result = await checkSheetsStatus();
    return NextResponse.json(result);
}
