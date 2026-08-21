import { BidHero } from "@/components/bid-hero";
import { Logo } from "@/components/logo";
import { RankingBoard } from "@/components/ranking-board";
import { getRankingSnapshot } from "@/lib/ranking";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const snapshot = await getRankingSnapshot();
  const top = snapshot.listings[0]?.netBidCents ?? 100;
  return <><div className="simple-brand"><Logo /></div><section className="simple-hero"><p className="hero-label">Ranking aberto de sites</p><h1>Seu link no topo.<br /><span>Quem paga mais, sobe.</span></h1><p className="hero-intro">Sem cadastro, sem chaves de API e sem divisão de receita. Basta superar a concorrência com um lance maior para chegar ao topo. Você vai conquistar o primeiro lugar quando este site viralizar?</p></section><BidHero price={top + 100} /><RankingBoard initialListings={snapshot.listings} takeover={snapshot.takeover} /></>;
}
