import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { fetchSiteMetadata } from "@/lib/metadata";
import { normalizeTarget } from "@/lib/url";
import { publishRankingChanged } from "@/lib/realtime";

const inputSchema = z.object({ action: z.enum(["suspend", "restore", "remove", "refresh"]) });

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN" && session?.user.role !== "MODERATOR") return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const { id } = await context.params;
  const { action } = inputSchema.parse(await request.json());
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return NextResponse.json({ error: "Anúncio não encontrado." }, { status: 404 });
  const data = action === "refresh"
    ? await fetchSiteMetadata(normalizeTarget(listing.canonicalUrl)).then((metadata) => ({ title: metadata.title, description: metadata.description, faviconUrl: metadata.faviconUrl }))
    : { status: action === "suspend" ? "SUSPENDED" as const : action === "remove" ? "REMOVED" as const : "ACTIVE" as const };
  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.listing.update({ where: { id }, data });
    await tx.auditLog.create({ data: { actorId: session.user.id, action: `LISTING_${action.toUpperCase()}`, entityType: "Listing", entityId: id, metadata: { previousStatus: listing.status } } });
    return result;
  });
  await publishRankingChanged(`admin:${action}`);
  return NextResponse.json({ listing: updated });
}
