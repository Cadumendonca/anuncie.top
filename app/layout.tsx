import type { Metadata } from "next";
import { Epilogue } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const epilogue = Epilogue({ subsets: ["latin"], display: "swap", variable: "--font-epilogue" });

export const metadata: Metadata = {
  title: { default: "Seu Site em Alta", template: "%s | Seu Site em Alta" },
  description: "O ranking brasileiro em que a sua oferta decide a posição.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: { title: "Seu Site em Alta", description: "Dispute atenção. Ganhe cliques. Fique no topo.", type: "website", locale: "pt_BR" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={epilogue.variable}>
      <body>
        <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
        <SiteHeader />
        <main id="conteudo">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
