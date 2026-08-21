import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizeTarget } from "@/lib/url";
import { databaseEnabled, prisma } from "@/lib/prisma";
import { fetchSiteMetadata } from "@/lib/metadata";

const schema = z.object({ target: z.string().min(2).max(2048) });
const blockedWords = ["porn", "xxx", "cassino ilegal", "golpe", "pirâmide"];

export async function POST(request: Request) {
  try {
    const { target } = schema.parse(await request.json());
    const normalized = normalizeTarget(target);
    if (blockedWords.some((word) => normalized.url.toLowerCase().includes(word))) throw new Error("Este conteúdo não pode ser anunciado.");
    if (databaseEnabled) {
      const existing = await prisma.listing.findUnique({ where: { canonicalKey: normalized.key }, select: { id: true } });
      if (existing) return NextResponse.json({ error: "Este endereço já possui proprietário. Entre no painel para aumentar o lance." }, { status: 409 });
      const blocked = await prisma.blockRule.findFirst({ where: { active: true, value: { in: [normalized.host, normalized.key] } } });
      if (blocked) throw new Error("Este endereço está bloqueado pela moderação.");
    }
    let metadata;
    try { metadata = await fetchSiteMetadata(normalized); }
    catch { metadata = { title: normalized.host, description: `Conheça ${normalized.host}.` }; }
    return NextResponse.json({ ...normalized, ...metadata });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Endereço inválido." }, { status: 400 }); }
}
