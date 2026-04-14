import { getSupabase } from "./supabase";
const sb = () => getSupabase();

// ══ CADASTROS ══
export async function fetchCadastros() {
  const { data, error } = await sb().from("cadastros").select("*").order("nome");
  if (error) console.error("fetchCadastros:", error);
  const g: Record<string, string[]> = {};
  (data || []).forEach((i: any) => { if (!g[i.tabela]) g[i.tabela] = []; g[i.tabela].push(i.nome); });
  return g;
}
export async function addCadastro(tabela: string, nome: string) {
  const { error } = await sb().from("cadastros").insert({ tabela, nome });
  if (error) console.error("addCadastro:", error);
}
export async function removeCadastro(tabela: string, nome: string) {
  const { error } = await sb().from("cadastros").delete().eq("tabela", tabela).eq("nome", nome);
  if (error) console.error("removeCadastro:", error);
}

// ══ TECIDOS ══
export async function fetchTecidos() {
  const { data, error } = await sb().from("tecidos").select("*").order("nome");
  if (error) console.error("fetchTecidos:", error);
  return (data || []).map((t: any) => ({ nome: t.nome, forn: t.fornecedor, comp: t.composicao, preco: t.preco || "" }));
}
export async function addTecido(t: { nome: string; forn: string; comp: string; preco: string }) {
  const { error } = await sb().from("tecidos").insert({ nome: t.nome, fornecedor: t.forn, composicao: t.comp, preco: t.preco ? parseFloat(t.preco) : null });
  if (error) console.error("addTecido:", error);
}
export async function removeTecido(nome: string) {
  const { error } = await sb().from("tecidos").delete().eq("nome", nome);
  if (error) console.error("removeTecido:", error);
}

// ══ AVIAMENTOS ══
export async function fetchAviamentos() {
  const { data, error } = await sb().from("aviamentos").select("*").order("nome");
  if (error) console.error("fetchAviamentos:", error);
  return (data || []).map((a: any) => ({ cod: a.codigo, nome: a.nome, preco: Number(a.preco) || 0 }));
}
export async function addAviamento(a: { cod: string; nome: string; preco: number }) {
  const { error } = await sb().from("aviamentos").insert({ codigo: a.cod, nome: a.nome, preco: a.preco });
  if (error) console.error("addAviamento:", error);
}
export async function removeAviamento(cod: string) {
  const { error } = await sb().from("aviamentos").delete().eq("codigo", cod);
  if (error) console.error("removeAviamento:", error);
}

// ══ PRODUTOS ══
export async function fetchProdutos() {
  const { data, error } = await sb().from("produtos").select("*").order("ref");
  if (error) console.error("fetchProdutos:", error);
  return (data || []).map((p: any) => ({
    id: p.id, ref: p.ref, desc: p.descricao || "", tecido: p.tecido || "",
    forn_tecido: p.forn_tecido || "", status: p.status || "",
    piloto_most: p.piloto_most || "", colecao: p.colecao || "",
    grupo: p.grupo || "", subgrupo: p.subgrupo || "",
    operacao: p.operacao || "", fornecedor: p.fornecedor || "",
    grade: p.grade || "", categoria: p.categoria || "",
    subcategoria: p.subcategoria || "", lavagem: p.lavagem || "",
    tab_medidas: p.tab_medidas || "", tipo: p.tipo || "",
    linha: p.linha || "", drop: p.drop_num || "", estilista: p.estilista || "",
  }));
}
export async function insertProduto(p: any) {
  const { data, error } = await sb().from("produtos").insert({
    ref: p.ref || "", descricao: p.desc || "", tecido: p.tecido || "",
    forn_tecido: p.forn_tecido || "", status: p.status || "DESENVOLVIMENTO",
    piloto_most: p.piloto_most || "", colecao: p.colecao || "",
    grupo: p.grupo || "", subgrupo: p.subgrupo || "",
    operacao: p.operacao || "", fornecedor: p.fornecedor || "",
    grade: p.grade || "", categoria: p.categoria || "",
    subcategoria: p.subcategoria || "", lavagem: p.lavagem || "",
    tab_medidas: p.tab_medidas || "", tipo: p.tipo || "",
    linha: p.linha || "", drop_num: p.drop || "", estilista: p.estilista || "",
  }).select().single();
  if (error) console.error("insertProduto:", error);
  return data;
}
export async function updateProdutoField(id: number, field: string, value: any) {
  const m: Record<string, string> = { desc: "descricao", drop: "drop_num" };
  const { error } = await sb().from("produtos").update({ [m[field] || field]: value }).eq("id", id);
  if (error) console.error("updateProdutoField:", error);
}
export async function deleteProduto(id: number) {
  const { error } = await sb().from("produtos").delete().eq("id", id);
  if (error) console.error("deleteProduto:", error);
}

// ══ FICHAS TÉCNICAS ══
export async function fetchFicha(ref: string) {
  const { data, error } = await sb().from("fichas_tecnicas").select("*").eq("produto_ref", ref).maybeSingle();
  if (error || !data) return null;
  const fid = data.id;
  const [tec, avi, pil, prv, ant] = await Promise.all([
    sb().from("ficha_tecidos").select("*").eq("ficha_id", fid).order("id"),
    sb().from("ficha_aviamentos").select("*").eq("ficha_id", fid).order("id"),
    sb().from("ficha_pilotagem").select("*").eq("ficha_id", fid).order("id"),
    sb().from("ficha_provas").select("*").eq("ficha_id", fid),
    sb().from("ficha_anotacoes").select("*").eq("ficha_id", fid),
  ]);
  return {
    id: fid, produto_ref: data.produto_ref,
    imagem_url: data.imagem_url || null, imagem_modelo: data.imagem_modelo || null,
    observacoes: data.observacoes || "", obsFechamento: data.obs_fechamento || "", ncm: data.ncm || "",
    pantones: (data.pantones as Record<string,string>) || {},
    statusLiberacao: data.status_liberacao || "",
    tecidos: (tec.data || []).map((t: any) => ({ artigo: t.artigo, forn: t.fornecedor, preco: Number(t.preco) || 0, cores: t.cores || [] })),
    aviamentos: (avi.data || []).map((a: any) => ({ item: a.item, cod: a.codigo, qtd: a.qtd, valor: Number(a.valor) || 0, local: a.localizacao || "", var01: a.var01 || "", var02: a.var02 || "", var03: a.var03 || "", var04: a.var04 || "" })),
    pilotagem: (pil.data || []).map((p: any) => ({ num: p.num, lacre: p.lacre || "", envio: p.data_envio || "", receb: p.data_recebimento || "", prova: p.data_prova || "", status: p.status || "" })),
    provas: Object.fromEntries((prv.data || []).map((p: any) => [p.ponto_cod, { p1: p.prova1, p2: p.prova2, p3: p.prova3 }])),
    anotacoes: Object.fromEntries((ant.data || []).map((a: any) => [`p${a.prova_num}`, { texto: a.anotacao || "", video: a.video_link || "" }])),
    estamparia: { tecnicas: [] }, // TODO: estamparia table
    tabelaEspecialAtiva: data.tabela_especial_ativa || false,
    pontosEspeciais: [] as any[],
    gradEspecial: [] as any[],
  };
  if (result.tabelaEspecialAtiva) {
    const [pe, ge] = await Promise.all([
      sb().from("ficha_pontos_especiais").select("*").eq("ficha_id", fid).order("ordem"),
      sb().from("ficha_graduacao_especial").select("*").eq("ficha_id", fid).order("ordem"),
    ]);
    result.pontosEspeciais = (pe.data || []).map((p: any) => ({ cod: p.cod, desc: p.descricao, tabela: p.valor_base, tol: p.tolerancia }));
    result.gradEspecial = (ge.data || []).map((g: any) => ({ desc: g.descricao, pp: g.pp, p: g.p, m: g.m, g: g.g, gg: g.gg, a1: g.ampliacao_esq, a2: g.ampliacao_dir, tol: g.tolerancia }));
  }
  return result;
}

export async function saveFichaImagem(fichaId: number, field: string, url: string) {
  const { error } = await sb().from("fichas_tecnicas").update({ [field]: url }).eq("id", fichaId);
  if (error) console.error("saveFichaImagem:", error);
}

export async function upsertFicha(ref: string, f: any) {
  let fid = f.id;
  if (!fid) {
    const { data, error } = await sb().from("fichas_tecnicas").insert({
      produto_ref: ref, observacoes: f.observacoes || "", obs_fechamento: f.obsFechamento || "",
      ncm: f.ncm || "", imagem_url: f.imagem_url || "", imagem_modelo: f.imagem_modelo || "",
      pantones: f.pantones || {},
      status_liberacao: f.statusLiberacao || "",
    }).select().single();
    if (error) { console.error("upsertFicha:", error); return null; }
    fid = data.id;
  } else {
    await sb().from("fichas_tecnicas").update({
      observacoes: f.observacoes || "", obs_fechamento: f.obsFechamento || "",
      ncm: f.ncm || "", imagem_url: f.imagem_url || "", imagem_modelo: f.imagem_modelo || "",
      pantones: f.pantones || {},
      status_liberacao: f.statusLiberacao || "",
    }).eq("id", fid);
  }
  // Tecidos
  await sb().from("ficha_tecidos").delete().eq("ficha_id", fid);
  if (f.tecidos?.length) await sb().from("ficha_tecidos").insert(f.tecidos.map((t: any) => ({ ficha_id: fid, artigo: t.artigo, fornecedor: t.forn || "", preco: t.preco || 0, cores: t.cores || [] })));
  // Aviamentos
  await sb().from("ficha_aviamentos").delete().eq("ficha_id", fid);
  if (f.aviamentos?.length) await sb().from("ficha_aviamentos").insert(f.aviamentos.map((a: any) => ({ ficha_id: fid, item: a.item, codigo: a.cod, qtd: a.qtd || 1, valor: a.valor || 0, localizacao: a.local || "", var01: a.var01 || "", var02: a.var02 || "", var03: a.var03 || "", var04: a.var04 || "" })));
  // Provas
  if (f.provas) for (const [cod, v] of Object.entries(f.provas) as any) await sb().from("ficha_provas").upsert({ ficha_id: fid, ponto_cod: cod, prova1: v.p1 || "", prova2: v.p2 || "", prova3: v.p3 || "" }, { onConflict: "ficha_id,ponto_cod" });
  // Anotações
  if (f.anotacoes) for (const [k, v] of Object.entries(f.anotacoes) as any) { const n = parseInt(k.replace("p", "")); if (!isNaN(n)) await sb().from("ficha_anotacoes").upsert({ ficha_id: fid, prova_num: n, anotacao: v.texto || "", video_link: v.video || "" }, { onConflict: "ficha_id,prova_num" }); }
  // Tabela especial
  if (f.tabelaEspecialAtiva !== undefined) {
    await sb().from("fichas_tecnicas").update({ tabela_especial_ativa: f.tabelaEspecialAtiva }).eq("id", fid);
  }
  if (f.tabelaEspecialAtiva && f.pontosEspeciais) {
    await sb().from("ficha_pontos_especiais").delete().eq("ficha_id", fid);
    if (f.pontosEspeciais.length) await sb().from("ficha_pontos_especiais").insert(f.pontosEspeciais.map((p: any, i: number) => ({ ficha_id: fid, cod: p.cod, descricao: p.desc, valor_base: p.tabela || "", tolerancia: p.tol || "1,0 + OU -", ordem: i })));
  }
  if (f.tabelaEspecialAtiva && f.gradEspecial) {
    await sb().from("ficha_graduacao_especial").delete().eq("ficha_id", fid);
    if (f.gradEspecial.length) await sb().from("ficha_graduacao_especial").insert(f.gradEspecial.map((g: any, i: number) => ({ ficha_id: fid, descricao: g.desc, pp: g.pp || "", p: g.p || "", m: g.m || "", g: g.g || "", gg: g.gg || "", ampliacao_esq: g.a1 || "", ampliacao_dir: g.a2 || "", tolerancia: g.tol || "1,0 + OU -", ordem: i })));
  }
  return fid;
}

// ══ TABELAS DE MEDIDAS ══
export async function fetchTabelasMedidas() {
  const { data, error } = await sb().from("tabelas_medidas").select("id, nome").order("nome");
  if (error) console.error("fetchTabelasMedidas:", error);
  return data || [];
}
export async function fetchTabelaPontos(tabelaId: number) {
  const { data, error } = await sb().from("tabela_medida_pontos").select("*").eq("tabela_id", tabelaId).order("ordem");
  if (error) console.error("fetchTabelaPontos:", error);
  return data || [];
}
export async function fetchGraduacoes(tabelaId: number) {
  const { data, error } = await sb().from("graduacoes").select("*").eq("tabela_id", tabelaId).order("ordem");
  if (error) console.error("fetchGraduacoes:", error);
  return data || [];
}
export async function createTabelaMedidas(nome: string) {
  const { data, error } = await sb().from("tabelas_medidas").insert({ nome }).select().single();
  if (error) console.error("createTabelaMedidas:", error);
  return data;
}
export async function deleteTabelaMedidas(id: number) {
  const { error } = await sb().from("tabelas_medidas").delete().eq("id", id);
  if (error) console.error("deleteTabelaMedidas:", error);
}
export async function upsertPontos(tabelaId: number, pontos: any[]) {
  await sb().from("tabela_medida_pontos").delete().eq("tabela_id", tabelaId);
  if (pontos.length) { const rows = pontos.map((p, i) => ({ tabela_id: tabelaId, cod: p.cod, descricao: p.desc || p.descricao, valor_base: p.tabela || p.valor_base || "", tolerancia: p.tol || p.tolerancia || "1,0 + OU -", ordem: i })); await sb().from("tabela_medida_pontos").insert(rows); }
}
export async function upsertGraduacoes(tabelaId: number, grads: any[]) {
  await sb().from("graduacoes").delete().eq("tabela_id", tabelaId);
  if (grads.length) { const rows = grads.map((g, i) => ({ tabela_id: tabelaId, descricao: g.desc || g.descricao, pp: g.pp || "", p: g.p || "", m: g.m || "", g: g.g || "", gg: g.gg || "", ampliacao_esq: g.a1 || g.ampliacao_esq || "", ampliacao_dir: g.a2 || g.ampliacao_dir || "", tolerancia: g.tol || g.tolerancia || "1,0 + OU -", ordem: i })); await sb().from("graduacoes").insert(rows); }
}
export async function fetchPontosByTabelaNome(nome: string) {
  const { data: tab } = await sb().from("tabelas_medidas").select("id").eq("nome", nome).maybeSingle();
  if (!tab) return [];
  const { data } = await sb().from("tabela_medida_pontos").select("*").eq("tabela_id", tab.id).order("ordem");
  return (data || []).map((p: any) => ({ cod: p.cod, desc: p.descricao, tabela: p.valor_base, tol: p.tolerancia }));
}

export async function fetchGraduacoesByTabelaNome(nome: string) {
  const { data: tab } = await sb().from("tabelas_medidas").select("id").eq("nome", nome).maybeSingle();
  if (!tab) return [];
  const { data } = await sb().from("graduacoes").select("*").eq("tabela_id", tab.id).order("ordem");
  return (data || []).map((g: any) => ({ desc: g.descricao, pp: g.pp, p: g.p, m: g.m, g: g.g, gg: g.gg, a1: g.ampliacao_esq, a2: g.ampliacao_dir, tol: g.tolerancia }));
}

// Fetch only tables that have at least 1 point
export async function fetchTabelasComPontos() {
  const { data, error } = await sb().rpc('get_tabelas_com_pontos').order('nome' as any);
  if (error) {
    // Fallback: fetch all tables then filter client-side
    const tabelas = await fetchTabelasMedidas();
    const withPts: any[] = [];
    for (const t of tabelas) {
      const { count } = await sb().from("tabela_medida_pontos").select("*", { count: "exact", head: true }).eq("tabela_id", t.id);
      if (count && count > 0) withPts.push(t);
    }
    return withPts.map((t: any) => t.nome);
  }
  return (data || []).map((t: any) => t.nome);
}

// Fetch all product variants (ref -> cores[]) from ficha_tecidos
export async function fetchAllVariantes(): Promise<Record<string, string[]>> {
  const { data: fichas } = await sb().from("fichas_tecnicas").select("produto_ref");
  if (!fichas?.length) return {};

  const { data: tecidos } = await sb().from("ficha_tecidos").select("ficha_id, cores, fichas_tecnicas!inner(produto_ref)").order("id");
  
  const result: Record<string, string[]> = {};
  (tecidos || []).forEach((t: any) => {
    const ref = (t as any).fichas_tecnicas?.produto_ref;
    if (!ref || !t.cores?.length) return;
    if (!result[ref]) result[ref] = [];
    t.cores.forEach((c: string) => { if (c && !result[ref].includes(c)) result[ref].push(c); });
  });
  return result;
}
