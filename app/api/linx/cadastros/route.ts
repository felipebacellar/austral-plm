import { NextResponse } from "next/server";
import { getProdutos, getTamanhos } from "@/lib/linx";
import { requireAuth } from "@/lib/supabase-server";

// GET /api/linx/cadastros
// Retorna os valores distintos do Linx para os cadastros que a API do Linx
// realmente fornece hoje: grupo, subgrupo, categoria, coleção (nome), grade e
// fornecedor (= fabricante do Linx). Valores em MAIÚSCULAS, para casar com a
// convenção do PLM. A chave do Linx nunca sai do servidor.
export async function GET() {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  try {
    const [produtos, tamanhos] = await Promise.all([getProdutos(), getTamanhos()]);

    const uniqUpper = (vals: (string | undefined | null)[]) =>
      Array.from(new Set(vals.map(v => String(v ?? "").trim().toUpperCase()).filter(Boolean))).sort((a, b) => a.localeCompare(b, "pt-BR"));

    const cadastros = {
      grupo:      uniqUpper(produtos.map(p => p.grupo)),
      subgrupo:   uniqUpper(produtos.map(p => p.subgrupo)),
      categoria:  uniqUpper(produtos.map(p => p.categoria)),
      // Coleção: usa o nome descritivo (colecao_nome); cai para o código se vazio.
      colecao:    uniqUpper(produtos.map(p => p.colecao_nome || p.colecao)),
      grade:      uniqUpper(Object.keys(tamanhos)),
      // Fornecedor: o Linx só tem "fabricante" — mapeado a pedido da usuária.
      fornecedor: uniqUpper(produtos.map(p => p.fabricante)),
    };

    return NextResponse.json({ cadastros });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erro ao consultar cadastros do Linx." }, { status: 502 });
  }
}
