"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CaretLeft, CaretRight, CursorClick, Crown, TrendUp } from "@phosphor-icons/react";
import type { PublicListing, TakeoverView } from "@/lib/types";
import { formatBRL } from "@/lib/money";

const PAGE_SIZE = 50;

function relativeTime(value: string) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60_000));
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60); return `há ${hours} h`;
}

export function RankingBoard({ initialListings, takeover }: { initialListings: PublicListing[]; takeover: TakeoverView }) {
  const [listings, setListings] = useState(initialListings);
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(listings.length / PAGE_SIZE));
  const visible = useMemo(() => expanded ? listings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : listings.slice(0, 1), [expanded, listings, page]);

  useEffect(() => {
    const timer = window.setInterval(async () => {
      try { const response = await fetch("/api/ranking", { cache: "no-store" }); if (response.ok) setListings((await response.json()).listings); } catch { /* Keep the last verified snapshot. */ }
    }, 15_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_ABLY_ENABLED) return;
    let disposed = false;
    let client: import("ably").Realtime | null = null;
    void import("ably").then(async ({ Realtime }) => {
      if (disposed) return;
      client = new Realtime({ authUrl: "/api/ably/token" });
      await client.channels.get("ranking").subscribe("changed", async () => {
        const response = await fetch("/api/ranking", { cache: "no-store" });
        if (response.ok && !disposed) setListings((await response.json()).listings);
      });
    }).catch(() => undefined);
    return () => { disposed = true; client?.close(); };
  }, []);

  return (
    <section className="ranking-section" aria-labelledby="ranking-title">
      <div className="ranking-heading"><div><p>Ranking ao vivo</p><h2 id="ranking-title">Quanto mais alto o lance, mais alto o site.</h2></div><span>{listings.length} produtos disputando atenção</span></div>
      {takeover && <div className="takeover-banner"><Crown weight="fill" /><div><strong>{takeover.listing.host} domina a primeira página</strong><span>Takeover ativo até {new Date(takeover.endsAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span></div></div>}
      <div className="ranking-list">
        {visible.map((listing) => <article className={`ranking-row ${listing.rank === 1 ? "is-first" : ""}`} key={listing.id}>
          <div className="rank-number">#{listing.rank}</div>
          <div className="site-avatar" aria-hidden="true">{listing.host.charAt(0).toUpperCase()}</div>
          <div className="listing-copy"><a href={`/r/${listing.slug}`} target="_blank" rel="noopener noreferrer"><strong>{listing.host}</strong><ArrowRight /></a><p>{listing.description}</p><div className="listing-meta"><span>{relativeTime(listing.publishedAt)}</span><span><CursorClick /> {listing.clicks.toLocaleString("pt-BR")} cliques</span></div></div>
          <div className="listing-price"><strong>{formatBRL(listing.netBidCents)}</strong><button onClick={() => { const input = document.querySelector<HTMLInputElement>(".amount-control input"); if (input) { input.value = String(listing.netBidCents / 100 + 1); input.dispatchEvent(new Event("input", { bubbles: true })); } document.getElementById("anunciar")?.scrollIntoView({ behavior: "smooth" }); }}><TrendUp /> Assumir por {formatBRL(listing.netBidCents + 100)}</button></div>
        </article>)}
      </div>
      {!expanded ? <button className="secondary-button expand-button" onClick={() => setExpanded(true)}>Ver outros {Math.max(0, listings.length - 1)} sites <ArrowRight /></button> : <nav className="pagination" aria-label="Páginas do ranking"><button disabled={page === 1} onClick={() => setPage((value) => value - 1)} aria-label="Página anterior"><CaretLeft /></button><span>Página {page} de {pages}</span><button disabled={page === pages} onClick={() => setPage((value) => value + 1)} aria-label="Próxima página"><CaretRight /></button></nav>}
    </section>
  );
}
