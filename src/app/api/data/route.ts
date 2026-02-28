import { NextResponse } from "next/server";
import { getData } from "@/data/data-repository";

export async function GET() {
  const data = await getData();
  return NextResponse.json(data);
}
