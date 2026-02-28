import { NextResponse } from "next/server";
import { invalidateCache } from "@/data/data-repository";

export async function POST() {
  invalidateCache();
  return NextResponse.json({ ok: true, message: "Cache invalidated" });
}
