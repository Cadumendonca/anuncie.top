import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";

const mainFont = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap", variable: "--font-main" });

export const metadata: Metadata = {
  title: { default: "Anuncio.top", template: "%s | Anuncio.top" },
  description: "O ranking brasileiro em que a sua oferta decide a posição.",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://anuncio.top"),
  alternates: { canonical: "/" },
  openGraph: { title: "Anuncio.top", description: "Dispute atenção. Ganhe cliques. Fique no topo.", url: "https://anuncio.top", siteName: "Anuncio.top", type: "website", locale: "pt_BR", images: [{ url: "/social-card-v2.png", width: 1728, height: 909, type: "image/png", alt: "Anuncio.top, seu site no topo" }] },
  twitter: { card: "summary_large_image", title: "Anuncio.top", description: "Seu site no topo. Quem paga mais, sobe.", images: [{ url: "/social-card-v2.png?card=3", alt: "Anuncio.top, seu site no topo" }] },
  other: { "twitter:image:src": "https://anuncio.top/social-card-v2.png?card=3", "twitter:domain": "anuncio.top" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={mainFont.variable}>
      <body>
        <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
        <main id="conteudo">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
