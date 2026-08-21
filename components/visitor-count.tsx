"use client";

import { useEffect, useState } from "react";

export function VisitorCount({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  useEffect(() => {
    void fetch("/api/visits", { method: "POST" })
      .then((response) => response.ok ? response.json() : null)
      .then((body) => { if (body?.visits !== undefined) setCount(body.visits); })
      .catch(() => undefined);
  }, []);
  return <p className="visitor-count"><strong>{count.toLocaleString("pt-BR")}</strong> {count === 1 ? "pessoa já visitou" : "pessoas já visitaram"} o Anuncio.top</p>;
}
