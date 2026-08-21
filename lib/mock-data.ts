import type { RankingSnapshot } from "./types";

const now = Date.now();

export const mockSnapshot: RankingSnapshot = {
  stats: { online: 187, lastHour: 1249, totalListings: 236 },
  generatedAt: new Date().toISOString(),
  takeover: null,
  listings: [
    { id: "1", rank: 1, slug: "nuvem-paga", host: "nuvempaga.com.br", title: "Nuvem Paga", description: "Infraestrutura de pagamentos para produtos digitais brasileiros.", netBidCents: 148900, clicks: 3241, publishedAt: new Date(now - 32 * 60_000).toISOString() },
    { id: "2", rank: 2, slug: "foco-labs", host: "focolabs.com.br", title: "Foco Labs", description: "Agentes de IA que transformam atendimento em receita mensurável.", netBidCents: 93200, clicks: 1867, publishedAt: new Date(now - 2.3 * 3_600_000).toISOString() },
    { id: "3", rank: 3, slug: "pingo-financas", host: "pingo.app", title: "Pingo", description: "Controle financeiro simples para quem trabalha por conta própria.", netBidCents: 72100, clicks: 945, publishedAt: new Date(now - 4.8 * 3_600_000).toISOString() },
    { id: "4", rank: 4, slug: "orbita-crm", host: "orbitacrm.com.br", title: "Órbita CRM", description: "CRM enxuto para times comerciais que precisam vender hoje.", netBidCents: 50800, clicks: 714, publishedAt: new Date(now - 6.1 * 3_600_000).toISOString() },
    { id: "5", rank: 5, slug: "trilha-cursos", host: "trilha.cursos", title: "Trilha", description: "Cursos práticos criados por profissionais que trabalham no mercado.", netBidCents: 36700, clicks: 508, publishedAt: new Date(now - 8.4 * 3_600_000).toISOString() },
    { id: "6", rank: 6, slug: "nexo-data", host: "nexodata.dev", title: "Nexo Data", description: "Dashboards de produto sem semanas de configuração.", netBidCents: 24100, clicks: 322, publishedAt: new Date(now - 11.2 * 3_600_000).toISOString() },
    { id: "7", rank: 7, slug: "caju-video", host: "cajuvideo.com", title: "Caju Vídeo", description: "Transforme uma gravação longa em clipes prontos para publicar.", netBidCents: 15900, clicks: 271, publishedAt: new Date(now - 15.6 * 3_600_000).toISOString() }
  ]
};
