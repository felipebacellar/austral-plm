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

// Cadastros que o Linx fornece hoje (valores em MAIÚSCULAS, já distintos).
// subcategoria/linha vêm vazios até o BI incluir no /produtos.
export type LinxCadastros = {
  grupo: string[];
  subgrupo: string[];
  categoria: string[];
  colecao: string[];
  grade: string[];
  fornecedor: string[];
  subcategoria: string[];
  linha: string[];
};

export async function fetchLinxCadastros(): Promise<LinxCadastros> {
  const res = await fetch("/api/linx/cadastros");
  if (!res.ok) throw new Error("Falha ao carregar cadastros do Linx.");
  const json = await res.json();
  return json.cadastros as LinxCadastros;
}

export type LinxAviamentoCorItem = { cor: string; ref_cor_fabricante?: string };
export type LinxAviamentoItem = { codigo: string; nome: string; fornecedor?: string; custo?: number; unidade?: string; referencia_fabricante?: string; cores?: LinxAviamentoCorItem[] };

// Retorna { available, aviamentos }. available=false = endpoint ainda não
// publicado pelo BI (a tela mostra aviso em vez de erro).
export async function fetchLinxAviamentos(): Promise<{ available: boolean; aviamentos: LinxAviamentoItem[] }> {
  const res = await fetch("/api/linx/aviamentos");
  if (!res.ok) throw new Error("Falha ao carregar aviamentos do Linx.");
  return res.json();
}
