import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { assertWholeReal, MIN_BID_CENTS } from "@/lib/money";
import { normalizeTarget } from "@/lib/url";
import { databaseEnabled, prisma } from "@/lib/prisma";
import { getRankingSnapshot } from "@/lib/ranking";
import { fetchSiteMetadata, type SiteMetadata } from "@/lib/metadata";

const schema = z.object({ target: z.string().min(2).max(2048) });
const blockedWords = ["porn", "xxx", "cassino ilegal", "golpe", "pirâmide"];
function slugFor(host: string) { return `${host.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${randomUUID().slice(0, 6)}`; }

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const normalized = normalizeTarget(input.target);
    if (blockedWords.some((word) => normalized.url.toLowerCase().includes(word))) throw new Error("Este conteúdo não pode ser anunciado.");
    const snapshot = await getRankingSnapshot();
    const topBid = snapshot.listings[0]?.netBidCents ?? MIN_BID_CENTS - 100;
    const amountCents = topBid + 100;
    assertWholeReal(amountCents);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
    if (!databaseEnabled || !process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      return NextResponse.json({ checkoutUrl: `${appUrl}/pagamento/pendente?demo=1&valor=${amountCents}` });
    }
    const [existing, blocked] = await Promise.all([
      prisma.listing.findUnique({ where: { canonicalKey: normalized.key }, select: { id: true, status: true, netBidCents: true } }),
      prisma.blockRule.findFirst({ where: { active: true, value: { in: [normalized.host, normalized.key] } } })
    ]);
    if (existing && existing.status !== "PENDING" && existing.status !== "ACTIVE") return NextResponse.json({ error: "Este site não pode receber novos impulsos." }, { status: 409 });
    if (blocked) return NextResponse.json({ error: "Este endereço está bloqueado." }, { status: 403 });
    const listing = existing
      ? existing
      : await fetchSiteMetadata(normalized).catch((): SiteMetadata => ({ title: normalized.host, description: `Conheça ${normalized.host}.` })).then((metadata) => prisma.listing.create({ data: { originalUrl: normalized.original, canonicalUrl: normalized.url, canonicalKey: normalized.key, slug: slugFor(normalized.host), kind: normalized.kind, host: normalized.host, title: metadata.title, description: metadata.description, faviconUrl: metadata.faviconUrl, status: "PENDING" } }));
    const isIncrease = existing?.status === "ACTIVE";
    const chargeCents = isIncrease ? Math.max(100, amountCents - existing.netBidCents) : amountCents;
    const targetBidCents = (existing?.netBidCents ?? 0) + chargeCents;
    const order = await prisma.bidOrder.create({ data: { listingId: listing.id, type: isIncrease ? "INCREASE" : "NEW_LISTING", targetBidCents, chargeCents, topBidSnapshotCents: topBid } });
    const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN });
    const preference = await new Preference(client).create({ body: { items: [{ id: order.id, title: isIncrease ? `Impulso no Anuncie.top` : `Posição no Anuncie.top`, quantity: 1, currency_id: "BRL", unit_price: chargeCents / 100 }], external_reference: order.id, back_urls: { success: `${appUrl}/pagamento/sucesso`, pending: `${appUrl}/pagamento/pendente`, failure: `${appUrl}/pagamento/falha` }, auto_return: "approved", notification_url: `${appUrl}/api/webhooks/mercado-pago`, statement_descriptor: "ANUNCIETOP", payment_methods: { excluded_payment_types: [{ id: "credit_card" }, { id: "debit_card" }, { id: "ticket" }, { id: "atm" }], installments: 1 } } });
    await prisma.payment.create({ data: { bidOrderId: order.id, preferenceId: preference.id, amountCents: chargeCents, status: "CREATED", liveMode: process.env.MERCADO_PAGO_LIVE_MODE === "true" } });
    return NextResponse.json({ checkoutUrl: preference.init_point });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível criar o pagamento." }, { status: 400 }); }
}
