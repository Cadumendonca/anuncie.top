import { BidHero } from "@/components/bid-hero";
import { Presence } from "@/components/presence";
import { RankingBoard } from "@/components/ranking-board";
import { getRankingSnapshot } from "@/lib/ranking";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const snapshot = await getRankingSnapshot();
  const top = snapshot.listings[0]?.netBidCents ?? 100;
  return <><div className="top-stats"><Presence initialOnline={snapshot.stats.online} initialLastHour={snapshot.stats.lastHour} /></div><BidHero listings={snapshot.listings} initialAmount={top + 100} /><RankingBoard initialListings={snapshot.listings} takeover={snapshot.takeover} /></>;
}
