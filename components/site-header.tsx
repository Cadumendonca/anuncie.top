import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" aria-label="Anuncio.top, página inicial"><Logo /></Link>
        <nav aria-label="Navegação principal">
          <Link href="/regras">Regras</Link>
          <Link href="/painel">Meu anúncio</Link>
          <Link className="nav-action" href="/#anunciar">Entrar no ranking</Link>
        </nav>
      </div>
    </header>
  );
}
