import { NextResponse } from "next/server";
import { MercadoPagoConfig, PaymentRefund } from "mercadopago";
import { z } from "zod";
import { auth } from "@/auth";
import { MIN_BID_CENTS } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { publishRankingChanged } from "@/lib/realtime";

const schema = z.object({ amountCents: z.number().int().positive().multipleOf(100), reason: z.string().trim().min(5).max(500) });

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") return NextResponse.json({ error: "Somente administradores podem estornar." }, { status: 403 });
  if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) return NextResponse.json({ error: "Mercado Pago não configurado." }, { status: 503 });
  const { id } = await context.params;
  const input = schema.parse(await request.json());
  const payment = await prisma.payment.findUnique({ where: { id }, include: { refunds: true, bidOrder: { include: { listing: true, takeover: true } } } });
  if (!payment?.providerPaymentId || payment.status !== "APPROVED") return NextResponse.json({ error: "Pagamento não pode ser estornado." }, { status: 409 });
  const refunded = payment.refunds.filter((item) => item.status === "APPROVED").reduce((sum, item) => sum + item.amountCents, 0);
  const available = payment.amountCents - refunded;
  if (input.amountCents > available) return NextResponse.json({ error: "Valor superior ao saldo disponível." }, { status: 400 });
  const service = new PaymentRefund(new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN }));
  const providerRefund = input.amountCents === available
    ? await service.total({ payment_id: payment.providerPaymentId })
    : await service.create({ payment_id: payment.providerPaymentId, body: { amount: input.amountCents / 100 } });
  await prisma.$transaction(async (tx) => {
    const nextBid = Math.max(0, payment.bidOrder.listing.netBidCents - input.amountCents);
    await tx.refund.create({ data: { paymentId: payment.id, providerRefundId: String(providerRefund.id), amountCents: input.amountCents, reason: input.reason, status: "APPROVED", actorId: session.user.id } });
    await tx.listing.update({ where: { id: payment.bidOrder.listingId }, data: { netBidCents: nextBid, status: nextBid < MIN_BID_CENTS ? "REFUNDED" : payment.bidOrder.listing.status } });
    if (input.amountCents === available) await tx.payment.update({ where: { id: payment.id }, data: { status: "REFUNDED" } });
    if (payment.bidOrder.takeover && ["RESERVED", "ACTIVE"].includes(payment.bidOrder.takeover.status)) await tx.takeover.update({ where: { id: payment.bidOrder.takeover.id }, data: { status: "CANCELLED", endsAt: new Date() } });
    await tx.auditLog.create({ data: { actorId: session.user.id, action: "PAYMENT_REFUND", entityType: "Payment", entityId: payment.id, metadata: { amountCents: input.amountCents, reason: input.reason, providerRefundId: String(providerRefund.id) } } });
  });
  await publishRankingChanged("refund");
  return NextResponse.json({ ok: true, refundId: providerRefund.id });
}
