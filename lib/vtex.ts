import "server-only";

// Busca imagens de produto na API pública de catálogo da VTEX (loja Austral).
// É a mesma API pública que o site/BI usam para exibir as fotos — sem chave,
// dados públicos do catálogo. SERVER-SIDE (mantém o padrão do projeto e evita CORS).
const VTEX_BASE = process.env.VTEX_BASE_URL || "https://austral.vtexcommercestable.com.br";

export type FotosProduto = { frente: string | null; costas: string | null };

export async function getFotosProduto(ref: string): Promise<FotosProduto> {
  const code = String(ref || "").trim();
  if (!code) return { frente: null, costas: null };

  const url = `${VTEX_BASE}/api/catalog_system/pub/products/search/${encodeURIComponent(code)}`;
  const res = await fetch(url, { next: { revalidate: 3600 } }); // cache 1h
  if (!res.ok) return { frente: null, costas: null };

  const arr = await res.json();
  if (!Array.isArray(arr) || arr.length === 0) return { frente: null, costas: null };

  // A busca por texto pode trazer produtos de outros códigos; ficamos só com os
  // cujo productReference começa com "<ref>_" (variantes de cor do mesmo produto pai).
  const matches = arr.filter((p: any) => String(p?.productReference || "").startsWith(code));
  const pool = matches.length ? matches : arr;

  for (const p of pool) {
    const imgs = p?.items?.[0]?.images || [];
    if (imgs.length) {
      return {
        frente: imgs[0]?.imageUrl || null,
        costas: imgs[1]?.imageUrl || null, // [0]=frente, [1]=costas (confirmado com exemplo real)
      };
    }
  }
  return { frente: null, costas: null };
}
