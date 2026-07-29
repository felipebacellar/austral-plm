import { NextRequest, NextResponse } from "next/server";
import { getEstoque, getCores, getPedidosProduto } from "@/lib/linx";
import type { LinxPedidoProduto } from "@/lib/linx";
import { requireAuth } from "@/lib/supabase-server";

// GET /api/linx/estoque
//   (sem params)  -> { totals: {ref: atual}, futuros: {ref: aReceber} }  — para a lista
//   ?ref=XXXX     -> { ref, total, futuro, porCor, porFilial, pedidos } — detalhe de um SKU
//
// "futuro / a receber" = soma da quantidade_pendente dos pedidos de compra/
// produção ainda não entregues (endpoint /pedidos-produto do Linx).
// A chave do Linx nunca sai do servidor: o browser fala só com esta rota.
export async function GET(req: NextRequest) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const ref = req.nextUrl.searchParams.get("ref")?.trim();

  try {
    // Pedidos podem não existir em ambientes antigos — não derruba o estoque.
    const [estoque, pedidos] = await Promise.all([
      getEstoque(),
      getPedidosProduto().catch(() => [] as LinxPedidoProduto[]),
    ]);

    // Detalhe de um único SKU (por cor e por filial + pedidos a receber)
    if (ref) {
      const doProduto = estoque.filter(e => String(e.produto_pai).trim() === ref);
      const pedidosRef = pedidos.filter(
        p => String(p.produto_pai).trim() === ref && (Number(p.quantidade_pendente) || 0) > 0,
      );

      if (doProduto.length === 0 && pedidosRef.length === 0) {
        return NextResponse.json({ ref, total: 0, futuro: 0, porCor: [], porFilial: [], pedidos: [], semDados: true });
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

      let futuro = 0;
      const pedidosOut = pedidosRef
        .map(p => {
          const qtd = Number(p.quantidade_pendente) || 0;
          futuro += qtd;
          return {
            numero: String(p.numero_pedido || "").trim(),
            cor: p.cor,
            corNome: cores[p.cor] || p.cor,
            qtd,
            data: p.data_programada || "",
            fornecedor: p.fornecedor || "",
            situacao: p.situacao || "",
          };
        })
        .sort((a, b) => String(a.data).localeCompare(String(b.data)));

      return NextResponse.json({ ref, total, futuro, porCor, porFilial, pedidos: pedidosOut });
    }

    // Totais por produto_pai (para casar com produtos.ref na lista)
    const totals: Record<string, number> = {};
    for (const e of estoque) {
      const pai = String(e.produto_pai).trim();
      totals[pai] = (totals[pai] || 0) + (Number(e.estoque_total) || 0);
    }
    // Futuro (a receber) por produto_pai
    const futuros: Record<string, number> = {};
    for (const p of pedidos) {
      const q = Number(p.quantidade_pendente) || 0;
      if (q <= 0) continue;
      const pai = String(p.produto_pai).trim();
      futuros[pai] = (futuros[pai] || 0) + q;
    }
    return NextResponse.json({ totals, futuros });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erro ao consultar estoque do Linx." }, { status: 502 });
  }
}
