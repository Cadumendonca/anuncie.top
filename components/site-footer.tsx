import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div><Logo /><p>Atenção pública, decidida pelo lance.</p></div>
        <div className="footer-links"><Link href="/regras">Regras</Link><Link href="/termos">Termos</Link><Link href="/privacidade">Privacidade</Link><Link href="/denunciar">Denunciar</Link></div>
        <div className="footer-note">Pagamentos processados no ambiente seguro do Mercado Pago.</div>
      </div>
    </footer>
  );
}
