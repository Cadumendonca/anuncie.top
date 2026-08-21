import { databaseEnabled, prisma } from "./prisma";
import { mockSnapshot } from "./mock-data";
import type { RankingSnapshot } from "./types";

export async function getRankingSnapshot(): Promise<RankingSnapshot> {
  if (!databaseEnabled) return { ...mockSnapshot, generatedAt: new Date().toISOString() };
  try {
    const [listings, total, takeover] = await Promise.all([
      prisma.listing.findMany({ where: { status: "ACTIVE" }, orderBy: [{ netBidCents: "desc" }, { rankedAt: "asc" }, { id: "asc" }], take: 300, include: { clickDays: true } }),
      prisma.listing.count({ where: { status: "ACTIVE" } }),
      prisma.takeover.findFirst({ where: { status: "ACTIVE", endsAt: { gt: new Date() } }, include: { listing: { include: { clickDays: true } } }, orderBy: { startsAt: "desc" } })
    ]);
    const publicListings = listings.map((item, index) => ({
      id: item.id, rank: index + 1, slug: item.slug, host: item.host, title: item.title,
      description: item.description ?? "", faviconUrl: item.faviconUrl ?? undefined,
      netBidCents: item.netBidCents, clicks: item.clickDays.reduce((sum, day) => sum + day.count, 0),
      publishedAt: (item.publishedAt ?? item.createdAt).toISOString()
    }));
    return {
      listings: publicListings,
      stats: { online: 0, lastHour: 0, totalListings: total },
      takeover: takeover ? { listing: publicListings.find((x) => x.id === takeover.listingId) ?? publicListings[0], endsAt: takeover.endsAt!.toISOString() } : null,
      generatedAt: new Date().toISOString()
    };
  } catch {
    return { ...mockSnapshot, generatedAt: new Date().toISOString() };
  }
}

export function estimateRank(listings: { netBidCents: number }[], amountCents: number) {
  return listings.filter((item) => item.netBidCents >= amountCents).length + 1;
}
