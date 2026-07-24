import { NextResponse } from "next/server";
import { getAviamentos } from "@/lib/linx";
import { requireAuth } from "@/lib/supabase-server";

// GET /api/linx/aviamentos
// Lista os aviamentos do Linx (Matérias-primas → grupo 003008). O endpoint
// /aviamentos ainda vai ser criado pelo BI; enquanto não existir, devolvemos
// { available: false } para a tela mostrar "aguardando o BI" em vez de erro.
export async function GET() {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  try {
    const aviamentos = await getAviamentos();
    return NextResponse.json({ available: true, aviamentos });
  } catch (e: any) {
    const msg = String(e?.message || "");
    // 404 = endpoint ainda não publicado pelo BI (situação esperada por ora).
    if (/\b404\b/.test(msg)) {
      return NextResponse.json({ available: false, aviamentos: [] });
    }
    return NextResponse.json({ error: msg || "Erro ao consultar aviamentos do Linx." }, { status: 502 });
  }
}
