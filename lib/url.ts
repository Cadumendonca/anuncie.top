import { isIP } from "node:net";
import { z } from "zod";

const chatHosts = ["t.me", "telegram.me", "chat.whatsapp.com", "discord.gg", "discord.com", "signal.group", "m.me"];
const shorteners = ["bit.ly", "tinyurl.com", "t.co", "cutt.ly", "rebrand.ly", "linktr.ee"];
const pathIdentityHosts = ["github.com", "apps.apple.com", "play.google.com"];

export type NormalizedTarget = { original: string; url: string; key: string; host: string; kind: "WEBSITE" | "X_HANDLE" };

function privateHost(host: string) {
  const normalized = host.toLowerCase();
  if (["localhost", "0.0.0.0", "::1"].includes(normalized) || normalized.endsWith(".local")) return true;
  if (isIP(normalized)) {
    return /^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(normalized);
  }
  return false;
}

export function normalizeTarget(input: string): NormalizedTarget {
  const raw = z.string().trim().min(2).max(2048).parse(input);
  if (/^@[A-Za-z0-9_]{1,15}$/.test(raw)) {
    const handle = raw.slice(1).toLowerCase();
    return { original: raw, url: `https://x.com/${handle}`, key: `x:${handle}`, host: `@${handle}`, kind: "X_HANDLE" };
  }
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const parsed = new URL(withProtocol);
  if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Use uma URL http ou https.");
  let host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  if (privateHost(host)) throw new Error("Este endereço não pode ser anunciado.");
  if (chatHosts.some((blocked) => host === blocked || host.endsWith(`.${blocked}`))) throw new Error("Links de chat e convite não são permitidos.");
  if (shorteners.includes(host)) throw new Error("Use o endereço final, sem encurtadores.");
  parsed.protocol = "https:";
  parsed.hostname = host;
  parsed.hash = "";
  parsed.search = "";
  parsed.pathname = parsed.pathname.replace(/\/+$/, "") || "/";
  const identityPath = pathIdentityHosts.includes(host) ? parsed.pathname.toLowerCase() : "";
  return { original: raw, url: parsed.toString(), key: `url:${host}${identityPath}`, host, kind: "WEBSITE" };
}

export function destinationWithUtm(url: string) {
  const target = new URL(url);
  target.searchParams.set("utm_source", "seusiteemalta");
  return target.toString();
}
