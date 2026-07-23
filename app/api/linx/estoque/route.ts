import { NextRequest, NextResponse } from "next/server";
import { getEstoque, getCores } from "@/lib/linx";
import { requireAuth } from "@/lib/supabase-server";

// GET /api/linx/estoque
//   (sem params)  -> { totals: { [produto_pai]: estoque_total } }  — compacto, para a lista
//   ?ref=XXXX     -> { ref, total, porCor: [...], porFilial: [...] } — detalhe de um SKU
//
// A chave do Linx nunca sai do servidor: o browser fala só com esta rota.
export async function GET(req: NextRequest) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const ref = req.nextUrl.searchParams.get("ref")?.trim();

  try {
    const estoque = await getEstoque();

    // Detalhe de um único SKU (por cor e por filial)
    if (ref) {
      const doProduto = estoque.filter(e => String(e.produto_pai).trim() === ref);
      if (doProduto.length === 0) {
        return NextResponse.json({ ref, total: 0, porCor: [], porFilial: [], semDados: true });
      }

      const cores = await getCores().catch(() => ({} as Record<string, string>));

      const porCorMap = new Map<string, number>();
      const porFilialMap = new Map<string, number>();
      let total = 0;
      for (const e of doProduto) {
        const q = Number(e.estoque_total) || 0;
        total += q;
        porCorMap.set(e.cor, (porCorMap.get(e.cor) || 0) + q);
        porFilialMap.set(e.filial, (porFilialMap.get(e.filial) || 0) + q);
      }

      const porCor = Array.from(porCorMap.entries())
        .map(([cor, qtd]) => ({ cor, nome: cores[cor] || cor, qtd }))
        .sort((a, b) => b.qtd - a.qtd);
      const porFilial = Array.from(porFilialMap.entries())
        .map(([filial, qtd]) => ({ filial, qtd }))
        .sort((a, b) => b.qtd - a.qtd);

      return NextResponse.json({ ref, total, porCor, porFilial });
    }

    // Totais por produto_pai (para casar com produtos.ref na lista)
    const totals: Record<string, number> = {};
    for (const e of estoque) {
      const pai = String(e.produto_pai).trim();
      totals[pai] = (totals[pai] || 0) + (Number(e.estoque_total) || 0);
    }
    return NextResponse.json({ totals });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erro ao consultar estoque do Linx." }, { status: 502 });
  }
}
