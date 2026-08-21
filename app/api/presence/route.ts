import { NextResponse } from "next/server";
import { z } from "zod";
import { heartbeat } from "@/lib/redis";
const schema = z.object({ sessionId: z.string().uuid() });
export async function POST(request: Request) { try { const { sessionId } = schema.parse(await request.json()); return NextResponse.json(await heartbeat(sessionId)); } catch { return NextResponse.json({ error: "Sessão inválida." }, { status: 400 }); } }
