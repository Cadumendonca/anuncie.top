import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publishRankingChanged } from "@/lib/realtime";

export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected || request.headers.get("authorization") !== `Bearer ${expected}`) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const now = new Date();
  const [reservations, active] = await prisma.$transaction([
    prisma.takeover.updateMany({ where: { status: "RESERVED", reservedUntil: { lte: now } }, data: { status: "EXPIRED" } }),
    prisma.takeover.updateMany({ where: { status: "ACTIVE", endsAt: { lte: now } }, data: { status: "EXPIRED" } })
  ]);
  if (reservations.count + active.count > 0) await publishRankingChanged("takeover-expired");
  return NextResponse.json({ expiredReservations: reservations.count, expiredTakeovers: active.count, at: now.toISOString() });
}
