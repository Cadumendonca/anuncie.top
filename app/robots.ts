import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "Twitterbot", allow: ["/", "/social-card-v2.png"] }
    ],
    sitemap: "https://anuncio.top/sitemap.xml",
    host: "https://anuncio.top"
  };
}
