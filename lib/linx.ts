import "server-only";

// Cliente da API de dados do Linx (roda no servidor do BI, fora da rede da Vercel).
// SERVER-SIDE APENAS — nunca importar este arquivo de um componente "use client".
// A chave (LINX_API_KEY) nunca deve ser exposta ao navegador nem usar prefixo NEXT_PUBLIC_.

const BASE_URL = process.env.LINX_API_BASE_URL || "https://bi.austral.com.br/api/linx";

export type LinxProduto = {
  produto_pai: string;
  colecao: string;
  colecao_nome: string;
  grupo: string;
  subgrupo: string;
  categoria: string;
  fabricante: string;
};

export type LinxEstoqueItem = {
  produto_pai: string;
  cor: string;
  filial: string;
  descricao: string;
  grade: string;
  colecao: string;
  estoque_total: number;
  est_1: number;
  est_2: number;
  est_3: number;
  est_4: number;
  est_5: number;
  est_6: number;
};

export type LinxCustos = Record<string, number>;
export type LinxCores = Record<string, string>;
export type LinxTamanhos = Record<string, string[]>;
export type LinxHealth = { ok: boolean; service: string; linx_configured: boolean };

async function fetchLinx<T>(path: string, params?: Record<string, string | undefined>): Promise<T> {
  const key = process.env.LINX_API_KEY;
  if (!key) throw new Error("LINX_API_KEY não configurada no servidor.");

  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v) url.searchParams.set(k, v);
    }
  }

  const res = await fetch(url.toString(), {
    headers: { "X-API-Key": key },
    cache: "no-store",
  });

  if (res.status === 401) throw new Error("Linx API: chave inválida ou não autorizada (401).");
  if (res.status === 503) throw new Error("Linx API: servidor do BI está sem a chave configurada (503).");
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Linx API: erro ${res.status} em ${path}${body ? ` — ${body.slice(0, 300)}` : ""}`);
  }

  return res.json() as Promise<T>;
}

export async function getHealth(): Promise<LinxHealth> {
  const key = process.env.LINX_API_KEY;
  const url = `${BASE_URL}/health`;
  const res = await fetch(url, key ? { headers: { "X-API-Key": key }, cache: "no-store" } : { cache: "no-store" });
  if (!res.ok) throw new Error(`Linx API: erro ${res.status} em /health`);
  return res.json() as Promise<LinxHealth>;
}

export async function getProdutos(): Promise<LinxProduto[]> {
  return fetchLinx<LinxProduto[]>("/produtos");
}

export async function getEstoque(filiais?: string[]): Promise<LinxEstoqueItem[]> {
  return fetchLinx<LinxEstoqueItem[]>("/estoque", { filiais: filiais?.join(",") });
}

export async function getCustos(produtos?: string[]): Promise<LinxCustos> {
  return fetchLinx<LinxCustos>("/custos", { produtos: produtos?.join(",") });
}

export async function getCores(): Promise<LinxCores> {
  return fetchLinx<LinxCores>("/cores");
}

export async function getTamanhos(): Promise<LinxTamanhos> {
  return fetchLinx<LinxTamanhos>("/tamanhos");
}
