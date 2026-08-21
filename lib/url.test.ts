import { describe, expect, it } from "vitest";
import { normalizeTarget } from "./url";

describe("normalizeTarget", () => {
  it("remove parâmetros de rastreamento de sites", () => {
    expect(normalizeTarget("https://www.Exemplo.com/oferta?ref=x#preco")).toMatchObject({ host: "exemplo.com", key: "url:exemplo.com", url: "https://exemplo.com/oferta" });
  });
  it("preserva o caminho do GitHub na identidade", () => {
    expect(normalizeTarget("github.com/empresa/produto").key).toBe("url:github.com/empresa/produto");
  });
  it("normaliza handles", () => {
    expect(normalizeTarget("@ProdutoBR")).toMatchObject({ key: "x:produtobr", host: "@produtobr" });
  });
  it("bloqueia endereços privados e chats", () => {
    expect(() => normalizeTarget("http://localhost:3000")).toThrow();
    expect(() => normalizeTarget("https://discord.gg/teste")).toThrow();
  });
});
