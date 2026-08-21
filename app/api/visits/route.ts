import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { databaseEnabled, prisma } from "@/lib/prisma";
import { getVisitCount, VISITOR_BASE_COUNT } from "@/lib/visits";

export async function POST(request: NextRequest) {
  if (!databaseEnabled) return NextResponse.json({ visits: VISITOR_BASE_COUNT });
  const knownVisitor = request.cookies.has("anuncio_visitor");
  try {
    if (!knownVisitor) {
      const visitorId = randomUUID();
      await prisma.auditLog.create({ data: { action: "FIRST_VISIT", entityType: "SITE_VISITOR", entityId: visitorId } });
    }
    const visits = await getVisitCount();
    const response = NextResponse.json({ visits });
    if (!knownVisitor) response.cookies.set("anuncio_visitor", randomUUID(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 365, path: "/" });
    return response;
  } catch {
    return NextResponse.json({ visits: VISITOR_BASE_COUNT });
  }
}
