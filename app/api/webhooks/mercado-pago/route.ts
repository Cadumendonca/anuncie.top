import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment as MercadoPayment } from "mercadopago";
import { databaseEnabled, prisma } from "@/lib/prisma";
import { publishRankingChanged } from "@/lib/realtime";

function verifySignature(request: Request, dataId: string) {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  const signature = request.headers.get("x-signature") ?? "";
  const requestId = request.headers.get("x-request-id") ?? "";
  const parts = Object.fromEntries(signature.split(",").map((part) => part.split("=").map((value) => value.trim())));
  if (!parts.ts || !parts.v1) return false;
  const expected = createHmac("sha256", secret).update(`id:${dataId};request-id:${requestId};ts:${parts.ts};`).digest("hex");
  try { return timingSafeEqual(Buffer.from(expected), Buffer.from(parts.v1)); } catch { return false; }
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({})) as { id?: string | number; action?: string; type?: string; data?: { id?: string | number } };
  const dataId = String(payload.data?.id ?? payload.id ?? "");
  const action = payload.action ?? payload.type ?? "payment.updated";
  const signatureOk = verifySignature(request, dataId);
  if (!signatureOk) return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
  if (!databaseEnabled || !process.env.MERCADO_PAGO_ACCESS_TOKEN) return NextResponse.json({ received: true });
  try {
    const event = await prisma.webhookEvent.upsert({ where: { provider_externalId_action: { provider: "MERCADO_PAGO", externalId: dataId, action } }, create: { provider: "MERCADO_PAGO", externalId: dataId, action, signatureOk, payload }, update: {} });
    if (event.processedAt) return NextResponse.json({ received: true, duplicate: true });
    const providerPayment = await new MercadoPayment(new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN })).get({ id: dataId });
    const orderId = providerPayment.external_reference;
    if (!orderId || providerPayment.currency_id !== "BRL") throw new Error("Pagamento sem referência ou moeda esperada.");
    const order = await prisma.bidOrder.findUnique({ where: { id: orderId }, include: { listing: true, payments: true, takeover: true } });
    if (!order) throw new Error("Pedido não encontrado.");
    const receivedCents = Math.round((providerPayment.transaction_amount ?? 0) * 100);
    if (receivedCents !== order.chargeCents) throw new Error("Valor divergente.");
    const mapped = providerPayment.status === "approved" ? "APPROVED" : providerPayment.status === "rejected" ? "REJECTED" : providerPayment.status === "cancelled" ? "CANCELLED" : providerPayment.status === "refunded" ? "REFUNDED" : "PENDING";
    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({ where: { bidOrderId: order.id }, data: { providerPaymentId: String(providerPayment.id), status: mapped, approvedAt: mapped === "APPROVED" ? new Date() : null } });
      if (mapped === "APPROVED" && order.status !== "APPROVED") {
        const payerEmail = providerPayment.payer?.email?.trim().toLowerCase() || `pagamento-${providerPayment.id}@anuncio.top`;
        const user = await tx.user.upsert({ where: { email: payerEmail }, create: { email: payerEmail }, update: {} });
        await tx.bidOrder.update({ where: { id: order.id }, data: { status: "APPROVED", userId: user.id } });
        await tx.listing.update({ where: { id: order.listingId }, data: { ownerId: order.listing.ownerId ?? user.id, status: "ACTIVE", netBidCents: { increment: order.chargeCents }, rankedAt: new Date(), publishedAt: order.listing.publishedAt ?? new Date() } });
        if (order.takeover && order.takeover.reservedUntil > new Date()) await tx.takeover.update({ where: { id: order.takeover.id }, data: { status: "ACTIVE", startsAt: new Date(), endsAt: new Date(Date.now() + Number(process.env.TAKEOVER_HOURS ?? 3) * 3_600_000) } });
      } else await tx.bidOrder.update({ where: { id: order.id }, data: { status: mapped } });
      await tx.webhookEvent.update({ where: { id: event.id }, data: { processedAt: new Date() } });
      void payment;
    });
    await publishRankingChanged(mapped.toLowerCase());
    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ received: true, processing: "deferred", error: error instanceof Error ? error.message : "unknown" });
  }
}
