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

// ── Tabelas de medidas ──

export async function fetchTabelasMedidas() {
  const sb = getSupabase();
  const { data: tabelas, error } = await sb
    .from("tabelas_medidas")
    .select("id, nome")
    .order("nome");
  if (error) { console.error("fetchTabelasMedidas:", error); return []; }
  return tabelas || [];
}

export async function fetchTabelaPontos(tabelaId: number) {
  const { data, error } = await getSupabase()
    .from("tabela_medida_pontos")
    .select("*")
    .eq("tabela_id", tabelaId)
    .order("ordem");
  if (error) console.error("fetchTabelaPontos:", error);
  return data || [];
}

export async function fetchGraduacoes(tabelaId: number) {
  const { data, error } = await getSupabase()
    .from("graduacoes")
    .select("*")
    .eq("tabela_id", tabelaId)
    .order("ordem");
  if (error) console.error("fetchGraduacoes:", error);
  return data || [];
}

export async function createTabelaMedidas(nome: string) {
  const { data, error } = await getSupabase()
    .from("tabelas_medidas")
    .insert({ nome })
    .select()
    .single();
  if (error) console.error("createTabelaMedidas:", error);
  return data;
}

export async function deleteTabelaMedidas(id: number) {
  const { error } = await getSupabase()
    .from("tabelas_medidas")
    .delete()
    .eq("id", id);
  if (error) console.error("deleteTabelaMedidas:", error);
}

export async function upsertPontos(tabelaId: number, pontos: any[]) {
  const sb = getSupabase();
  // Delete existing
  await sb.from("tabela_medida_pontos").delete().eq("tabela_id", tabelaId);
  // Insert all
  if (pontos.length > 0) {
    const rows = pontos.map((p, i) => ({
      tabela_id: tabelaId,
      cod: p.cod,
      descricao: p.desc || p.descricao,
      valor_base: p.tabela || p.valor_base || "",
      tolerancia: p.tol || p.tolerancia || "1,0 + OU -",
      ordem: i,
    }));
    const { error } = await sb.from("tabela_medida_pontos").insert(rows);
    if (error) console.error("upsertPontos:", error);
  }
}

export async function upsertGraduacoes(tabelaId: number, grads: any[]) {
  const sb = getSupabase();
  await sb.from("graduacoes").delete().eq("tabela_id", tabelaId);
  if (grads.length > 0) {
    const rows = grads.map((g, i) => ({
      tabela_id: tabelaId,
      descricao: g.desc || g.descricao,
      pp: g.pp || "",
      p: g.p || "",
      m: g.m || "",
      g: g.g || "",
      gg: g.gg || "",
      ampliacao_esq: g.a1 || g.ampliacao_esq || "",
      ampliacao_dir: g.a2 || g.ampliacao_dir || "",
      tolerancia: g.tol || g.tolerancia || "1,0 + OU -",
      ordem: i,
    }));
    const { error } = await sb.from("graduacoes").insert(rows);
    if (error) console.error("upsertGraduacoes:", error);
  }
}
