import { NextResponse } from "next/server";
import { getProdutos } from "@/lib/linx";

// Endpoint de teste — valida a conexão com a API do Linx.
// Roda 100% server-side; a chave nunca chega ao navegador.
export async function GET() {
  try {
    const produtos = await getProdutos();
    return NextResponse.json({
      ok: true,
      totalProdutos: produtos.length,
      amostra: produtos.slice(0, 3),
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 502 });
  }
}
