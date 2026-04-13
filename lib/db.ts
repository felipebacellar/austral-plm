import { getSupabase } from "./supabase";

// ── Produtos (tabela de desenvolvimento) ──

export async function fetchProdutos() {
  const { data, error } = await getSupabase()
    .from("produtos")
    .select("*")
    .order("ref", { ascending: true });
  if (error) console.error("fetchProdutos:", error);
  return data || [];
}

export async function upsertProduto(produto: any) {
  const { data, error } = await getSupabase()
    .from("produtos")
    .upsert(produto, { onConflict: "id" })
    .select()
    .single();
  if (error) console.error("upsertProduto:", error);
  return data;
}

export async function insertProduto(produto: any) {
  const { id, ...rest } = produto;
  const { data, error } = await getSupabase()
    .from("produtos")
    .insert(rest)
    .select()
    .single();
  if (error) console.error("insertProduto:", error);
  return data;
}

export async function deleteProduto(id: number) {
  const { error } = await getSupabase().from("produtos").delete().eq("id", id);
  if (error) console.error("deleteProduto:", error);
}

export async function updateProdutoField(id: number, field: string, value: any) {
  const { error } = await getSupabase()
    .from("produtos")
    .update({ [field]: value })
    .eq("id", id);
  if (error) console.error("updateProdutoField:", error);
}

// ── Cadastros auxiliares ──

export async function fetchCadastros() {
  const { data, error } = await getSupabase()
    .from("cadastros")
    .select("*")
    .order("nome", { ascending: true });
  if (error) console.error("fetchCadastros:", error);

  // Group by tabela
  const grouped: Record<string, string[]> = {};
  (data || []).forEach((item: any) => {
    if (!grouped[item.tabela]) grouped[item.tabela] = [];
    grouped[item.tabela].push(item.nome);
  });
  return grouped;
}

export async function addCadastro(tabela: string, nome: string) {
  const { error } = await getSupabase()
    .from("cadastros")
    .insert({ tabela, nome });
  if (error) console.error("addCadastro:", error);
}

export async function removeCadastro(tabela: string, nome: string) {
  const { error } = await getSupabase()
    .from("cadastros")
    .delete()
    .eq("tabela", tabela)
    .eq("nome", nome);
  if (error) console.error("removeCadastro:", error);
}

// ── Tecidos ──

export async function fetchTecidos() {
  const { data, error } = await getSupabase()
    .from("tecidos")
    .select("*")
    .order("nome", { ascending: true });
  if (error) console.error("fetchTecidos:", error);
  return (data || []).map((t: any) => ({
    nome: t.nome,
    forn: t.fornecedor,
    comp: t.composicao,
    preco: t.preco || "",
  }));
}

export async function addTecido(tecido: { nome: string; forn: string; comp: string; preco: string }) {
  const { error } = await getSupabase()
    .from("tecidos")
    .insert({
      nome: tecido.nome,
      fornecedor: tecido.forn,
      composicao: tecido.comp,
      preco: tecido.preco ? parseFloat(tecido.preco) : null,
    });
  if (error) console.error("addTecido:", error);
}

export async function removeTecido(nome: string) {
  const { error } = await getSupabase().from("tecidos").delete().eq("nome", nome);
  if (error) console.error("removeTecido:", error);
}

// ── Fichas técnicas ──

export async function fetchFicha(produtoRef: string) {
  const { data, error } = await getSupabase()
    .from("fichas_tecnicas")
    .select(`
      *,
      ficha_tecidos(*),
      ficha_aviamentos(*),
      ficha_pilotagem(*)
    `)
    .eq("produto_ref", produtoRef)
    .maybeSingle();
  if (error) console.error("fetchFicha:", error);
  return data;
}

export async function saveFichaImagem(fichaId: number, field: string, url: string) {
  const { error } = await getSupabase()
    .from("fichas_tecnicas")
    .update({ [field]: url })
    .eq("id", fichaId);
  if (error) console.error("saveFichaImagem:", error);
}
