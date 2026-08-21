import { describe, expect, it } from "vitest";
import { estimateRank } from "./ranking";

describe("estimateRank", () => {
  it("coloca empates depois dos lances existentes", () => {
    expect(estimateRank([{ netBidCents: 1000 }, { netBidCents: 500 }], 500)).toBe(3);
  });
  it("estima o primeiro lugar", () => {
    expect(estimateRank([{ netBidCents: 1000 }], 1100)).toBe(1);
  });
});
