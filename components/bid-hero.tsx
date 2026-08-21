"use client";

import { useState } from "react";
import { ArrowRight, GlobeSimple, ShieldCheck } from "@phosphor-icons/react";
import { formatBRL } from "@/lib/money";

export function BidHero({ price }: { price: number }) {
  const [target, setTarget] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    // Abrir uma página do próprio site durante o clique mantém o checkout em
    // uma aba do navegador e evita que a resposta assíncrona pareça um deep link.
    const paymentWindow = window.open("/pagamento/abrindo", "anuncio-top-checkout");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ target })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Não foi possível abrir o Pix.");
      setRedirecting(true);
      window.setTimeout(() => {
        if (paymentWindow && !paymentWindow.closed) {
          paymentWindow.location.replace(body.checkoutUrl);
          return;
        }
        window.location.assign(body.checkoutUrl);
      }, 700);
    } catch (reason) {
      paymentWindow?.close();
      setError(reason instanceof Error ? reason.message : "Tente novamente.");
      setLoading(false);
    }
  }

  return <section className="simple-entry" id="anunciar">
    <div><span className="entry-eyebrow">Topo atual: {formatBRL(price)}</span><h2>Compre mais visibilidade</h2><p>Cole um link novo ou impulsione quem já está no ranking.</p></div>
    <form className="simple-form" onSubmit={submit} noValidate>
      <label className="sr-only" htmlFor="site-link">Link do seu site</label>
      <span className="input-shell"><GlobeSimple aria-hidden="true" /><input id="site-link" required value={target} onChange={(event) => setTarget(event.target.value)} placeholder="https://seusite.com.br" autoComplete="url" inputMode="url" /></span>
      <button className="primary-button" disabled={loading || target.trim().length < 3} type="submit">{loading ? "Calculando impulso" : <>Continuar com Pix <ArrowRight weight="bold" /></>}</button>
    </form>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="secure-note"><ShieldCheck weight="fill" aria-hidden="true" /> Pagamento seguro via Pix no Mercado Pago.</div>
    {redirecting && <div className="payment-redirect" role="status" aria-live="assertive"><span className="redirect-spinner" aria-hidden="true" /><strong>Pagamento aberto no navegador</strong><p>Continue na nova aba segura do Mercado Pago. Depois do pagamento, você voltará para anuncio.top.</p></div>}
  </section>;
}
