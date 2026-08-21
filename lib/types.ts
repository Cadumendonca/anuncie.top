export type PublicListing = {
  id: string;
  rank: number;
  slug: string;
  host: string;
  title: string;
  description: string;
  faviconUrl?: string;
  netBidCents: number;
  clicks: number;
  publishedAt: string;
};

export type PublicStats = {
  online: number;
  lastHour: number;
  totalListings: number;
};

export type TakeoverView = {
  listing: PublicListing;
  endsAt: string;
} | null;

export type RankingSnapshot = {
  listings: PublicListing[];
  stats: PublicStats;
  takeover: TakeoverView;
  generatedAt: string;
};
