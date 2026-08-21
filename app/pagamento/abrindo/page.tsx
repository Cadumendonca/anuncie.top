import { ArrowSquareOut, ShieldCheck } from "@phosphor-icons/react/dist/ssr";

export default function OpeningPaymentPage() {
  return <main className="auth-shell payment-opening-page">
    <ShieldCheck size={42} color="var(--coral)" weight="duotone" aria-hidden="true" />
    <h1>Abrindo o pagamento</h1>
    <p>Aguarde enquanto preparamos a página segura do Mercado Pago nesta aba.</p>
    <div className="opening-browser-note"><ArrowSquareOut aria-hidden="true" /> Você continuará no navegador.</div>
  </main>;
}
