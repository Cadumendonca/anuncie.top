import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { formatBRL } from "@/lib/money";
import type { PublicListing } from "@/lib/types";

function relativeTime(value: string) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60_000));
  if (minutes < 60) return `há ${minutes} min`;
  return `há ${Math.round(minutes / 60)} h`;
}

export function FeaturedRanking({ listings }: { listings: PublicListing[] }) {
  return <section className="featured-ranking" aria-label="Primeiras posições">
    {[0, 1].map((index) => {
      const listing = listings[index];
      return <div className={`featured-place place-${index + 1}`} key={listing?.id ?? index}>
        <span className="featured-rank">#{index + 1}</span>
        {listing ? <><div className="featured-avatar">{listing.faviconUrl ? <img src={listing.faviconUrl} alt="" /> : listing.host.charAt(0).toUpperCase()}</div><div className="featured-copy"><a href={`/r/${listing.slug}`} target="_blank" rel="noopener noreferrer">{listing.title}<ArrowUpRight /></a><span>{listing.host}</span><p>{listing.description}</p><small>Valor adicionado {relativeTime(listing.publishedAt)} · {listing.clicks.toLocaleString("pt-BR")} cliques</small></div><strong>{formatBRL(listing.netBidCents)}</strong></> : <div className="featured-copy empty-place"><strong>Posição disponível</strong><span>Seu site pode aparecer aqui.</span></div>}
      </div>;
    })}
  </section>;
}
