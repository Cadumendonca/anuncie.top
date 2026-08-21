"use client";

import { useMemo, useState } from "react";
import { ArrowRight, GlobeSimple, Minus, Plus, ShieldCheck } from "@phosphor-icons/react";
import { formatBRL } from "@/lib/money";
import type { PublicListing } from "@/lib/types";

export function BidHero({ listings, initialAmount }: { listings: PublicListing[]; initialAmount: number }) {
  const [amount, setAmount] = useState(initialAmount);
  const [target, setTarget] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const rank = useMemo(() => listings.filter((listing) => listing.netBidCents >= amount).length + 1, [amount, listings]);

  function updateAmount(next: number) { setAmount(Math.max(200, Math.round(next / 100) * 100)); }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const preview = await fetch("/api/listings/preview", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ target }) });
      const previewBody = await preview.json();
      if (!preview.ok) throw new Error(previewBody.error ?? "Não foi possível validar o endereço.");
      const response = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ target, email, amountCents: amount, takeover: false }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Não foi possível abrir o pagamento.");
      window.location.href = body.checkoutUrl;
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Tente novamente."); setLoading(false); }
  }

  return (
    <section className="hero" id="anunciar">
      <div className="hero-copy">
        <p className="hero-kicker">O ranking brasileiro de atenção paga</p>
        <h1>Coloque seu produto <span>onde todos olham.</span></h1>
        <p>Seu valor decide a posição. Sem assinatura, sem algoritmo escondido.</p>
      </div>
      <form className="bid-console" onSubmit={submit} noValidate>
        <div className="bid-heading">
          <span>Assuma a posição #{rank} por</span>
          <div className="amount-control">
            <button type="button" onClick={() => updateAmount(amount - 100)} aria-label="Diminuir lance em um real"><Minus /></button>
            <label><span className="sr-only">Valor do lance em reais</span><span>R$</span><input inputMode="numeric" value={amount / 100} onChange={(event) => updateAmount(Number(event.target.value) * 100)} /></label>
            <button type="button" onClick={() => updateAmount(amount + 100)} aria-label="Aumentar lance em um real"><Plus /></button>
          </div>
        </div>
        <p className="bid-helper">Você entra no ranking mesmo sem assumir o primeiro lugar.</p>
        <div className="bid-fields">
          <label className="field"><span>Site ou @handle</span><span className="input-shell"><GlobeSimple aria-hidden="true" /><input required value={target} onChange={(event) => setTarget(event.target.value)} onBlur={() => { if (target && target.length < 3) setError("Digite uma URL ou @handle válido."); }} placeholder="seuproduto.com.br" autoComplete="url" /></span></label>
          <label className="field"><span>E-mail do proprietário</span><span className="input-shell"><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@empresa.com" autoComplete="email" /></span></label>
          <button className="primary-button" disabled={loading || !target || !email} type="submit">{loading ? "Preparando pagamento" : <>Entrar por {formatBRL(amount)} <ArrowRight weight="bold" /></>}</button>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="secure-note"><ShieldCheck weight="fill" aria-hidden="true" /> Checkout seguro via Mercado Pago. A publicação acontece somente após a confirmação.</div>
      </form>
    </section>
  );
}
