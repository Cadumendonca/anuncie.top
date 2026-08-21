"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CursorClick, Crown } from "@phosphor-icons/react";
import type { PublicListing, TakeoverView } from "@/lib/types";
import { formatBRL } from "@/lib/money";

function relativeTime(value: string) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60_000));
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60); return `há ${hours} h`;
}

export function RankingBoard({ initialListings, takeover }: { initialListings: PublicListing[]; takeover: TakeoverView }) {
  const [listings, setListings] = useState(initialListings);

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
      <div className="ranking-heading"><div><p>Lista completa</p><h2 id="ranking-title">Outras posições</h2></div><span>{listings.reduce((total, listing) => total + listing.clicks, 0).toLocaleString("pt-BR")} visitas geradas · {listings.length} sites</span></div>
      {takeover && <div className="takeover-banner"><Crown weight="fill" /><div><strong>{takeover.listing.host} domina a primeira página</strong><span>Takeover ativo até {new Date(takeover.endsAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span></div></div>}
      <div className="ranking-list">
        {listings.length <= 2 && <div className="ranking-empty"><strong>Ainda não há outras posições.</strong><span>Os próximos sites aparecerão aqui.</span></div>}
        {listings.slice(2).map((listing) => <article className="ranking-row" key={listing.id}>
          <div className="rank-number">#{listing.rank}</div>
          <div className="site-avatar" aria-hidden="true">{listing.faviconUrl ? <img src={listing.faviconUrl} alt="" /> : listing.host.charAt(0).toUpperCase()}</div>
          <div className="listing-copy"><a href={`/r/${listing.slug}`} target="_blank" rel="noopener noreferrer"><strong>{listing.title}</strong><ArrowRight /></a><span className="listing-host">{listing.host}</span><p>{listing.description}</p><div className="listing-meta"><span>Valor adicionado {relativeTime(listing.publishedAt)}</span><span><CursorClick /> {listing.clicks.toLocaleString("pt-BR")} cliques</span></div></div>
          <div className="listing-price"><strong>{formatBRL(listing.netBidCents)}</strong><span>valor pago</span></div>
        </article>)}
      </div>
    </section>
  );
}
