import { NextResponse } from "next/server";
import Ably from "ably";

export async function GET() {
  if (!process.env.ABLY_API_KEY) return NextResponse.json({ error: "Realtime não configurado." }, { status: 503 });
  const client = new Ably.Rest(process.env.ABLY_API_KEY);
  const request = await client.auth.createTokenRequest({ clientId: `visitor-${crypto.randomUUID()}`, capability: JSON.stringify({ ranking: ["subscribe"] }), ttl: 60 * 60 * 1000 });
  return NextResponse.json(request);
}
