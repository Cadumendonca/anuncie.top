"use client";

import { useEffect, useState } from "react";

function createSessionId() {
  if (typeof globalThis.crypto?.randomUUID === "function") return globalThis.crypto.randomUUID();
  if (globalThis.crypto?.getRandomValues) {
    const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

export function Presence({ initialOnline, initialLastHour }: { initialOnline: number; initialLastHour: number }) {
  const [stats, setStats] = useState({ online: initialOnline, lastHour: initialLastHour });
  useEffect(() => {
    const key = "anuncie-top-session";
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
