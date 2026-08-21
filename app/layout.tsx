import type { Metadata } from "next";
import { Epilogue } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";

const epilogue = Epilogue({ subsets: ["latin"], display: "swap", variable: "--font-epilogue" });

export const metadata: Metadata = {
  title: { default: "Anuncio.top", template: "%s | Anuncio.top" },
  description: "O ranking brasileiro em que a sua oferta decide a posição.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://anuncio.top"),
  alternates: { canonical: "/" },
  openGraph: { title: "Anuncio.top", description: "Dispute atenção. Ganhe cliques. Fique no topo.", url: "https://anuncio.top", siteName: "Anuncio.top", type: "website", locale: "pt_BR" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={epilogue.variable}>
      <body>
        <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
        <main id="conteudo">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
