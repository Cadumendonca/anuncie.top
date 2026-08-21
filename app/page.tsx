import { BidHero } from "@/components/bid-hero";
import { Logo } from "@/components/logo";
import { RankingBoard } from "@/components/ranking-board";
import { getRankingSnapshot } from "@/lib/ranking";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const snapshot = await getRankingSnapshot();
  const top = snapshot.listings[0]?.netBidCents ?? 100;
  return <><div className="simple-brand"><Logo /></div><section className="simple-hero"><p className="hero-label">Visibilidade à venda</p><h1>Seu site <span>no topo.</span></h1><p className="hero-intro">Sem cadastro, API ou comissão. Cole seu link, faça um lance e suba no ranking. Se o Anuncio.top viralizar, quem estiver no topo recebe os primeiros olhares.</p></section><BidHero price={top + 100} /><RankingBoard initialListings={snapshot.listings} takeover={snapshot.takeover} /></>;
}
