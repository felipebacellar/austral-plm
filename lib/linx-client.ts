// Helpers client-side para consumir a rota interna /api/linx/* (que por sua vez
// fala com o Linx server-side). A chave do Linx NUNCA passa por aqui.

export type EstoqueDetalhe = {
  ref: string;
  total: number;
  porCor: { cor: string; nome: string; qtd: number }[];
  porFilial: { filial: string; qtd: number }[];
  semDados?: boolean;
};

export async function fetchEstoqueTotals(): Promise<Record<string, number>> {
  const res = await fetch("/api/linx/estoque");
  if (!res.ok) throw new Error("Falha ao carregar estoque do Linx.");
  const json = await res.json();
  return (json.totals || {}) as Record<string, number>;
}

export async function fetchEstoqueDetalhe(ref: string): Promise<EstoqueDetalhe> {
  const res = await fetch(`/api/linx/estoque?ref=${encodeURIComponent(ref)}`);
  if (!res.ok) throw new Error("Falha ao carregar estoque do SKU.");
  return res.json() as Promise<EstoqueDetalhe>;
}
