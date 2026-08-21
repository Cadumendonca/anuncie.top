import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { assertWholeReal, MIN_BID_CENTS } from "@/lib/money";
import { normalizeTarget } from "@/lib/url";
import { databaseEnabled, prisma } from "@/lib/prisma";
import { getRankingSnapshot } from "@/lib/ranking";
import { fetchSiteMetadata, type SiteMetadata } from "@/lib/metadata";

const schema = z.object({ target: z.string().min(2), email: z.string().email(), amountCents: z.number().int(), takeover: z.boolean().default(false) });
function slugFor(host: string) { return `${host.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${randomUUID().slice(0, 6)}`; }

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    assertWholeReal(input.amountCents);
    const normalized = normalizeTarget(input.target);
    const snapshot = await getRankingSnapshot();
    const topBid = snapshot.listings[0]?.netBidCents ?? MIN_BID_CENTS - 100;
    const takeoverPrice = topBid * 2;
    const amountCents = input.takeover ? takeoverPrice : input.amountCents;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
    if (!databaseEnabled || !process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      return NextResponse.json({ checkoutUrl: `${appUrl}/pagamento/pendente?demo=1&valor=${amountCents}` });
    }
    const existing = await prisma.listing.findUnique({ where: { canonicalKey: normalized.key }, include: { owner: true } });
    if (existing && existing.owner?.email.toLowerCase() !== input.email.toLowerCase()) return NextResponse.json({ error: "Este endereço já possui proprietário." }, { status: 409 });
    const metadata: SiteMetadata | null = existing ? null : await fetchSiteMetadata(normalized).catch(() => ({ title: normalized.host, description: `Conheça ${normalized.host}.` }));
    const listing = existing ?? await prisma.listing.create({ data: { originalUrl: normalized.original, canonicalUrl: normalized.url, canonicalKey: normalized.key, slug: slugFor(normalized.host), kind: normalized.kind, host: normalized.host, title: metadata!.title, description: metadata!.description, faviconUrl: metadata!.faviconUrl, status: "PENDING" } });
    const type = input.takeover ? "TAKEOVER" : existing ? "INCREASE" : "NEW_LISTING";
    const chargeCents = existing ? amountCents - existing.netBidCents : amountCents;
    if (chargeCents < 100) throw new Error("O novo lance deve superar o valor atual.");
    const expiresAt = input.takeover ? new Date(Date.now() + Number(process.env.TAKEOVER_RESERVATION_MINUTES ?? 15) * 60_000) : null;
    const order = await prisma.bidOrder.create({ data: { listingId: listing.id, type, targetBidCents: amountCents, chargeCents, topBidSnapshotCents: topBid, expiresAt } });
    if (input.takeover) await prisma.takeover.create({ data: { listingId: listing.id, bidOrderId: order.id, status: "RESERVED", reservedUntil: expiresAt! } });
    const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN });
    const preference = await new Preference(client).create({ body: { items: [{ id: order.id, title: `Posição no Anuncie.top`, quantity: 1, currency_id: "BRL", unit_price: chargeCents / 100 }], payer: { email: input.email }, external_reference: order.id, back_urls: { success: `${appUrl}/pagamento/sucesso`, pending: `${appUrl}/pagamento/pendente`, failure: `${appUrl}/pagamento/falha` }, auto_return: "approved", notification_url: `${appUrl}/api/webhooks/mercado-pago`, statement_descriptor: "ANUNCIETOP" } });
    await prisma.payment.create({ data: { bidOrderId: order.id, preferenceId: preference.id, amountCents: chargeCents, status: "CREATED", liveMode: process.env.MERCADO_PAGO_LIVE_MODE === "true" } });
    return NextResponse.json({ checkoutUrl: preference.init_point });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível criar o pagamento." }, { status: 400 }); }
}
