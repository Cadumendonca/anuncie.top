import Link from "next/link";
import { auth } from "@/auth";
import { databaseEnabled, prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/money";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return <div className="auth-shell"><h1>Seu anúncio, em um só lugar.</h1><p>Aumente o lance, acompanhe cliques e receba alertas de posição.</p><Link className="primary-button" href="/entrar">Receber link de acesso</Link></div>;
  const listings = databaseEnabled ? await prisma.listing.findMany({ where: { ownerId: session.user.id }, include: { clickDays: true }, orderBy: { updatedAt: "desc" } }) : [];
  const totalClicks = listings.reduce((sum, listing) => sum + listing.clickDays.reduce((acc, day) => acc + day.count, 0), 0);
  return <div className="dashboard-shell"><div className="dashboard-header"><div><h1>Meu anúncio</h1><p>{session.user.email}</p></div><Link className="secondary-button" href="/#anunciar">Criar novo lance</Link></div><div className="metric-grid"><div className="metric"><span>Anúncios ativos</span><strong>{listings.length}</strong></div><div className="metric"><span>Cliques totais</span><strong>{totalClicks.toLocaleString("pt-BR")}</strong></div><div className="metric"><span>Maior lance</span><strong>{formatBRL(Math.max(0, ...listings.map((item) => item.netBidCents)))}</strong></div><div className="metric"><span>Alertas</span><strong>Ativos</strong></div></div><section className="data-panel"><div className="data-panel-header"><h2>Seus produtos</h2></div>{listings.length ? <table className="data-table"><thead><tr><th>Produto</th><th>Status</th><th>Valor</th><th>Publicado</th></tr></thead><tbody>{listings.map((listing) => <tr key={listing.id}><td><strong>{listing.host}</strong></td><td><span className="status">{listing.status}</span></td><td>{formatBRL(listing.netBidCents)}</td><td>{listing.publishedAt?.toLocaleDateString("pt-BR") ?? "Pendente"}</td></tr>)}</tbody></table> : <div style={{ padding: 28 }}><p>Nenhum anúncio vinculado a este e-mail.</p><Link href="/#anunciar">Entrar no ranking</Link></div>}</section></div>;
}
