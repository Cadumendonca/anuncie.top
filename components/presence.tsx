"use client";

import { useEffect, useState } from "react";

export function Presence({ initialOnline, initialLastHour }: { initialOnline: number; initialLastHour: number }) {
  const [stats, setStats] = useState({ online: initialOnline, lastHour: initialLastHour });
  useEffect(() => {
    const key = "seu-site-em-alta-session";
    const sessionId = sessionStorage.getItem(key) ?? crypto.randomUUID();
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
