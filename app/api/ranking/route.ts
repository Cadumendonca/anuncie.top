import { NextResponse } from "next/server";
import { getRankingSnapshot } from "@/lib/ranking";
export async function GET() { return NextResponse.json(await getRankingSnapshot(), { headers: { "cache-control": "no-store" } }); }
