import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import type { NormalizedTarget } from "./url";

export type SiteMetadata = { title: string; description: string; faviconUrl?: string };

function isPrivateAddress(address: string) {
  if (!isIP(address)) return true;
  return /^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.)/.test(address) || address === "::1" || address.startsWith("fc") || address.startsWith("fd") || address.startsWith("fe80:");
}

function cleanText(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&#39;/g, "'").replace(/\s+/g, " ").trim().slice(0, 320);
}

function meta(html: string, names: string[]) {
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const patterns = [new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`, "i"), new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${escaped}["'][^>]*>`, "i")];
    for (const pattern of patterns) { const found = html.match(pattern)?.[1]; if (found) return cleanText(found); }
  }
  return "";
}

export async function fetchSiteMetadata(target: NormalizedTarget): Promise<SiteMetadata> {
  if (target.kind === "X_HANDLE") return { title: target.host, description: `Perfil ${target.host} no X.` };
  const addresses = await lookup(target.host, { all: true });
  if (!addresses.length || addresses.some((item) => isPrivateAddress(item.address))) throw new Error("O destino não passou pela verificação de segurança.");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);
  try {
    const response = await fetch(target.url, { redirect: "follow", signal: controller.signal, headers: { "user-agent": "SeuSiteEmAltaBot/1.0 (+metadata-preview)", accept: "text/html" } });
    if (!response.ok) throw new Error("O site não respondeu à prévia.");
    const type = response.headers.get("content-type") ?? "";
    const length = Number(response.headers.get("content-length") ?? 0);
    if (!type.includes("text/html") || length > 1_000_000) throw new Error("O destino não é uma página HTML válida.");
    const html = (await response.text()).slice(0, 1_000_000);
    const title = meta(html, ["og:title", "twitter:title"]) || cleanText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? target.host);
    const description = meta(html, ["og:description", "twitter:description", "description"]) || `Conheça ${target.host}.`;
    const iconHref = html.match(/<link[^>]+rel=["'][^"']*(?:icon|shortcut icon)[^"']*["'][^>]+href=["']([^"']+)["']/i)?.[1];
    return { title: title || target.host, description, faviconUrl: iconHref ? new URL(iconHref, target.url).toString() : new URL("/favicon.ico", target.url).toString() };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw new Error("O site demorou demais para responder.");
    throw error;
  } finally { clearTimeout(timeout); }
}
