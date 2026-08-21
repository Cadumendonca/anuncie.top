"use client";

import { useEffect, useState } from "react";

function createSessionId() {
  if (typeof globalThis.crypto?.randomUUID === "function") return globalThis.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
  else for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
}

export function Presence({ initialOnline, initialLastHour }: { initialOnline: number; initialLastHour: number }) {
  const [stats, setStats] = useState({ online: initialOnline, lastHour: initialLastHour });
  useEffect(() => {
    const key = "anuncio-top-session";
    const sessionId = sessionStorage.getItem(key) ?? createSessionId();
    sessionStorage.setItem(key, sessionId);
    let active = true;
    const ping = async () => {
      try {
        const response = await fetch("/api/presence", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sessionId }) });
        if (active && response.ok) setStats(await response.json());
      } catch { /* Public metrics are non-critical. */ }
    };
    void ping();
    const timer = window.setInterval(ping, 30_000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);
  return <div className="presence" aria-live="polite"><span className="live-dot" aria-hidden="true" />{stats.online.toLocaleString("pt-BR")} online <span className="presence-separator" /> {stats.lastHour.toLocaleString("pt-BR")} na última hora</div>;
}
