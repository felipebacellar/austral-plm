import { getSupabase } from "./supabase";
const sb = () => getSupabase();

// ── Cache simples em memória com TTL de 5 minutos ─────────────────────────
const _cache: Record<string, { data: any; exp: number }> = {};
const TTL = 5 * 60 * 1000;
function fromCache<T>(key: string): T | null {
  const c = _cache[key];
  return c && Date.now() < c.exp ? c.data : null;
}
function toCache(key: string, data: any) {
  _cache[key] = { data, exp: Date.now() + TTL };
}
export function invalidateCache(key?: string) {
  if (key) delete _cache[key]; else Object.keys(_cache).forEach(k => delete _cache[k]);
}

// ══ CADASTROS ══
export async function fetchCadastros() {
  const cached = fromCache<Record<string, string[]>>("cadastros");
  if (cached) return cached;
  const { data, error } = await sb().from("cadastros").select("*").order("nome");
  if (error) console.error("fetchCadastros:", error);
  const g: Record<string, string[]> = {};
  (data || []).forEach((i: any) => { if (!g[i.tabela]) g[i.tabela] = []; g[i.tabela].push(i.nome); });
  toCache("cadastros", g);
  return g;
}
export async function addCadastro(tabela: string, nome: string) {
  const { error } = await sb().from("cadastros").insert({ tabela, nome });
  if (error) console.error("addCadastro:", error);
  invalidateCache("cadastros");
}
export async function removeCadastro(tabela: string, nome: string) {
  const { error } = await sb().from("cadastros").delete().eq("tabela", tabela).eq("nome", nome);
  if (error) console.error("removeCadastro:", error);
  invalidateCache("cadastros");
}

// ══ TECIDOS ══
export async function fetchTecidos() {
  const cached = fromCache<any[]>("tecidos");
  if (cached) return cached;
  const { data, error } = await sb().from("tecidos").select("*").order("nome");
  if (error) console.error("fetchTecidos:", error);
  const result = (data || []).map((t: any) => ({ nome: t.nome, forn: t.fornecedor, comp: t.composicao, preco: t.preco || "" }));
  toCache("tecidos", result);
  return result;
}
export async function addTecido(t: { nome: string; forn: string; comp: string; preco: string }) {
  const { error } = await sb().from("tecidos").insert({ nome: t.nome, fornecedor: t.forn, composicao: t.comp, preco: t.preco ? parseFloat(t.preco) : null });
  if (error) console.error("addTecido:", error);
  invalidateCache("tecidos");
}
export async function removeTecido(nome: string) {
  const { error } = await sb().from("tecidos").delete().eq("nome", nome);
  if (error) console.error("removeTecido:", error);
  invalidateCache("tecidos");
}

// ══ AVIAMENTOS ══
export async function fetchAviamentos() {
  const cached = fromCache<any[]>("aviamentos");
  if (cached) return cached;
  const { data, error } = await sb().from("aviamentos").select("*").order("nome");
  if (error) console.error("fetchAviamentos:", error);
  const result = (data || []).map((a: any) => ({ cod: a.codigo, nome: a.nome, preco: Number(a.preco) || 0, localizacao_padrao: a.localizacao_padrao || "", imagem: a.imagem || "", cores_disponiveis: a.cores_disponiveis || [], fornecedor: a.fornecedor || "", codigo_fornecedor: a.codigo_fornecedor || "" }));
  toCache("aviamentos", result);
  return result;
}
export async function addAviamento(a: { cod: string; nome: string; preco: number; localizacao_padrao?: string }) {
  const { error } = await sb().from("aviamentos").insert({ codigo: a.cod, nome: a.nome, preco: a.preco, localizacao_padrao: a.localizacao_padrao || "" });
  if (error) console.error("addAviamento:", error);
  invalidateCache("aviamentos");
}
export async function updateAviamento(cod: string, data: { localizacao_padrao?: string; imagem?: string; nome?: string; preco?: number; cores_disponiveis?: string[]; fornecedor?: string; codigo_fornecedor?: string }) {
  const { error } = await sb().from("aviamentos").update(data).eq("codigo", cod);
  if (error) console.error("updateAviamento:", error);
  invalidateCache("aviamentos");
}
export async function removeAviamento(cod: string) {
  const { error } = await sb().from("aviamentos").delete().eq("codigo", cod);
  if (error) console.error("removeAviamento:", error);
  invalidateCache("aviamentos");
}

// ══ PRODUTOS ══
export async function fetchProdutos() {
  const [prodsRes, tecidosRes] = await Promise.all([
    sb().from("produtos").select("*").order("ref"),
    sb().from("tecidos").select("nome, composicao"),
  ]);
  const { data, error } = prodsRes;
  if (error) console.error("fetchProdutos:", error);

  const tecidoCompMap: Record<string, string> = {};
  (tecidosRes.data || []).forEach((t: any) => { if (t.composicao) tecidoCompMap[t.nome] = t.composicao; });
  return (data || []).map((p: any) => ({
    id: p.id, ref: p.ref, desc: p.descricao || "", tecido: p.tecido || "",
    composicao: p.composicao || tecidoCompMap[p.tecido] || "",
    forn_tecido: p.forn_tecido || "", status: p.status || "",
    piloto_most: p.piloto_most || "", colecao: p.colecao || "",
    grupo: p.grupo || "", subgrupo: p.subgrupo || "",
    operacao: p.operacao || "", fornecedor: p.fornecedor || "",
    grade: p.grade || "", categoria: p.categoria || "",
    subcategoria: p.subcategoria || "", lavagem: p.lavagem || "",
    tab_medidas: p.tab_medidas || "", tipo: p.tipo || "",
    linha: p.linha || "", drop: p.drop_num || "", estilista: p.estilista || "",
    custo_inicial:   p.custo_inicial  != null ? Number(p.custo_inicial)  : null,
    markup_inicial:  p.markup_inicial != null ? Number(p.markup_inicial) : null,
    preco_target:    p.preco_target   != null ? Number(p.preco_target)   : null,
    custo_final:     p.custo_final    != null ? Number(p.custo_final)    : null,
    varejo_final:    p.varejo_final   != null ? Number(p.varejo_final)   : null,
    status_preco:    p.status_preco   || "",
    status_compras:  p.status_compras || "",
    qtd_compra1:     p.qtd_compra1    != null ? Number(p.qtd_compra1)  : null,
    pedido1:         p.pedido1        || "",
    data_entrega1:   p.data_entrega1  || "",
    qtd_compra2:     p.qtd_compra2    != null ? Number(p.qtd_compra2)  : null,
    pedido2:         p.pedido2        || "",
    data_entrega2:   p.data_entrega2  || "",
  }));
}
export async function insertProduto(p: any): Promise<{ data: any; error: string | null }> {
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
  return { data, error: error ? (error.message || "Erro ao criar produto") : null };
}
export async function updateProdutoField(id: number, field: string, value: any): Promise<string | null> {
  const m: Record<string, string> = { desc: "descricao", drop: "drop_num" };
  const { error } = await sb().from("produtos").update({ [m[field] || field]: value }).eq("id", id);
  if (error) { console.error("updateProdutoField:", error); return error.message || "Erro ao salvar"; }
  return null;
}
export async function deleteProduto(id: number): Promise<string | null> {
  const { error } = await sb().from("produtos").delete().eq("id", id);
  if (error) { console.error("deleteProduto:", error); return error.message || "Erro ao excluir"; }
  return null;
}
export async function cloneProduto(sourceId: number, newRef: string): Promise<{ data: any; error: string | null }> {
  const { data: src, error: fetchErr } = await sb().from("produtos").select("*").eq("id", sourceId).single();
  if (fetchErr || !src) return { data: null, error: "Produto original não encontrado" };
  const { id: _id, ref: _ref, created_at: _ca, updated_at: _ua, ...rest } = src;
  const { data, error } = await sb().from("produtos").insert({ ...rest, ref: newRef, status: "DESENVOLVIMENTO" }).select().single();
  if (error) { console.error("cloneProduto:", error); return { data: null, error: error.message || "Erro ao clonar" }; }
  return { data, error: null };
}
export async function bulkUpdateStatus(ids: number[], status: string): Promise<string | null> {
  const { error } = await sb().from("produtos").update({ status }).in("id", ids);
  if (error) { console.error("bulkUpdateStatus:", error); return error.message || "Erro ao atualizar status"; }
  return null;
}

// ══ COMPRAS POR VARIANTE ══
export async function fetchVarianteCompras(): Promise<Record<string, any>> {
  const { data, error } = await sb().from("produto_variante_compras").select("*");
  if (error) console.error("fetchVarianteCompras:", error);
  const map: Record<string, any> = {};
  (data || []).forEach((r: any) => {
    map[`${r.produto_id}:${r.cor}`] = r;
  });
  return map;
}

export async function upsertVarianteCompra(produtoId: number, cor: string, field: string, value: any) {
  // Use upsert: inserts if not exists, updates only the specified field on conflict
  const { error } = await sb()
    .from("produto_variante_compras")
    .upsert(
      { produto_id: produtoId, cor, [field]: value },
      { onConflict: "produto_id,cor" }
    );
  if (error) console.error("upsertVarianteCompra:", { produtoId, cor, field, value, error });
}

// ══ FICHAS TÉCNICAS ══
export async function fetchFichasColecoes(ref: string): Promise<string[]> {
  const { data } = await sb().from("fichas_tecnicas").select("colecao").eq("produto_ref", ref).not("colecao", "is", null);
  return (data || []).map((f: any) => f.colecao).filter(Boolean);
}

export async function fetchFicha(ref: string, colecao?: string | null) {
  let q = sb().from("fichas_tecnicas").select("*").eq("produto_ref", ref);
  if (colecao) q = q.eq("colecao", colecao);
  else q = q.is("colecao", null);
  const { data, error } = await q.maybeSingle();
  if (error || !data) return null;
  const fid = data.id;
  const [tec, avi, pil, prv, ant] = await Promise.all([
    sb().from("ficha_tecidos").select("*").eq("ficha_id", fid).order("id"),
    sb().from("ficha_aviamentos").select("*").eq("ficha_id", fid).order("id"),
    sb().from("ficha_pilotagem").select("*").eq("ficha_id", fid).order("id"),
    sb().from("ficha_provas").select("*").eq("ficha_id", fid),
    sb().from("ficha_anotacoes").select("*").eq("ficha_id", fid),
  ]);
  const result: any = {
    id: fid, produto_ref: data.produto_ref,
    imagem_url: data.imagem_url || null,
    imagem_modelo: data.imagem_modelo || null,
    imagem_modo_medir: data.imagem_modo_medir || null,
    observacoes: data.observacoes || "", obsFechamento: data.obs_fechamento || "", ncm: data.ncm || "",
    pantones: (data.pantones as Record<string,string>) || {},
    statusLiberacao: data.status_liberacao || "",
    provaInfo: data.prova_info || null,
    custoDet: data.custo_det || null,
    obsCusto: data.obs_custo || "",
    tingimento: data.tingimento || null,
    qtdMost: {
      var01: data.qtd_most_var01 ?? null, var02: data.qtd_most_var02 ?? null,
      var03: data.qtd_most_var03 ?? null, var04: data.qtd_most_var04 ?? null,
      var05: data.qtd_most_var05 ?? null, var06: data.qtd_most_var06 ?? null,
    },
    tecidos: (tec.data || []).map((t: any) => ({ artigo: t.artigo, forn: t.fornecedor, preco: Number(t.preco) || 0, cores: t.cores || [] })),
    aviamentos: (avi.data || []).map((a: any) => ({ item: a.item, cod: a.codigo, qtd: a.qtd, valor: Number(a.valor) || 0, local: a.localizacao || "", var01: a.var01 || "", var02: a.var02 || "", var03: a.var03 || "", var04: a.var04 || "" })),
    pilotagem: (pil.data || []).map((p: any) => ({ num: p.num, lacre: p.lacre || "", envio: p.data_envio || "", receb: p.data_recebimento || "", prova: p.data_prova || "", status: p.status || "" })),
    provas: Object.fromEntries((prv.data || []).map((p: any) => [p.ponto_cod, { p1: p.prova1, p2: p.prova2, p3: p.prova3 }])),
    anotacoes: Object.fromEntries((ant.data || []).map((a: any) => [`p${a.prova_num}`, { texto: a.anotacao || "", video: a.video_link || "" }])),
    estamparia: data.estamparia && Object.keys(data.estamparia).length > 0 ? data.estamparia : { artes: [{ posicao: "FRENTE", imagem: "", largura: "", localizacao: "" }, { posicao: "COSTAS", imagem: "", largura: "", localizacao: "" }, { posicao: "TAGLESS", imagem: "", largura: "", localizacao: "" }], tecnicas: [], simulacoes: { var01: { nome: "", imgSim: "", imgFoto: "", status: "" }, var02: { nome: "", imgSim: "", imgFoto: "", status: "" }, var03: { nome: "", imgSim: "", imgFoto: "", status: "" }, var04: { nome: "", imgSim: "", imgFoto: "", status: "" } }, observacoes: "" },
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

export async function upsertFicha(ref: string, f: any, colecao?: string | null) {
  // Campos base (sempre existem)
  const fichaBase = {
    observacoes: f.observacoes || "", obs_fechamento: f.obsFechamento || "",
    ncm: f.ncm || "", imagem_url: f.imagem_url || "", imagem_modelo: f.imagem_modelo || "",
    pantones: f.pantones || {}, estamparia: f.estamparia || {},
    status_liberacao: f.statusLiberacao || "",
    qtd_most_var01: f.qtdMost?.var01 ?? null, qtd_most_var02: f.qtdMost?.var02 ?? null,
    qtd_most_var03: f.qtdMost?.var03 ?? null, qtd_most_var04: f.qtdMost?.var04 ?? null,
    qtd_most_var05: f.qtdMost?.var05 ?? null, qtd_most_var06: f.qtdMost?.var06 ?? null,
  };
  // Campos extras (requerem migration SQL)
  const fichaExtras = {
    imagem_modo_medir: f.imagem_modo_medir || "",
    prova_info: f.provaInfo || null,
    custo_det: f.custoDet || null,
    obs_custo: f.obsCusto || "",
    tingimento: f.tingimento || null,
  };
  let fid = f.id;
  if (!fid) {
    // Tenta inserir com todos os campos; se falhar por coluna ausente, insere sem extras
    let result = await sb().from("fichas_tecnicas").insert({
      produto_ref: ref, colecao: colecao || null, ...fichaBase, ...fichaExtras,
    }).select().single();
    if (result.error) {
      result = await sb().from("fichas_tecnicas").insert({
        produto_ref: ref, colecao: colecao || null, ...fichaBase,
      }).select().single();
    }
    if (result.error) { console.error("upsertFicha insert:", result.error); return null; }
    fid = result.data.id;
  } else {
    // Update com todos os campos
    let { error } = await sb().from("fichas_tecnicas").update({ ...fichaBase, ...fichaExtras }).eq("id", fid);
    // Se falhou (coluna não existe), tenta só com campos base
    if (error) await sb().from("fichas_tecnicas").update(fichaBase).eq("id", fid);
  }
  // Tecidos
  await sb().from("ficha_tecidos").delete().eq("ficha_id", fid);
  if (f.tecidos?.length) await sb().from("ficha_tecidos").insert(f.tecidos.map((t: any) => ({ ficha_id: fid, artigo: t.artigo, fornecedor: t.forn || "", preco: t.preco || 0, cores: t.cores || [] })));
  // Aviamentos
  await sb().from("ficha_aviamentos").delete().eq("ficha_id", fid);
  if (f.aviamentos?.length) await sb().from("ficha_aviamentos").insert(f.aviamentos.map((a: any) => ({ ficha_id: fid, item: a.item, codigo: a.cod, qtd: a.qtd || 1, valor: a.valor || 0, localizacao: a.local || "", var01: a.var01 || "", var02: a.var02 || "", var03: a.var03 || "", var04: a.var04 || "" })));
  // Pilotagem
  await sb().from("ficha_pilotagem").delete().eq("ficha_id", fid);
  if (f.pilotagem?.length) await sb().from("ficha_pilotagem").insert(f.pilotagem.map((p: any) => ({ ficha_id: fid, num: p.num || "", lacre: p.lacre || "", data_envio: p.envio || null, data_recebimento: p.receb || null, data_prova: p.prova || null, status: p.status || "" })));
  // Provas — delete+insert (mais confiável que upsert com onConflict)
  await sb().from("ficha_provas").delete().eq("ficha_id", fid);
  if (f.provas && Object.keys(f.provas).length > 0) {
    const provasRows = Object.entries(f.provas)
      .filter(([, v]: any) => v.p1 || v.p2 || v.p3)
      .map(([cod, v]: any) => ({ ficha_id: fid, ponto_cod: cod, prova1: v.p1 || "", prova2: v.p2 || "", prova3: v.p3 || "" }));
    if (provasRows.length) await sb().from("ficha_provas").insert(provasRows);
  }
  // Anotações
  if (f.anotacoes) for (const [k, v] of Object.entries(f.anotacoes) as any) { const n = parseInt(k.replace("p", "")); if (!isNaN(n)) await sb().from("ficha_anotacoes").upsert({ ficha_id: fid, prova_num: n, anotacao: v.texto || "", video_link: v.video || "" }, { onConflict: "ficha_id,prova_num" }); }
  // Tabela especial
  if (f.tabelaEspecialAtiva !== undefined) await sb().from("fichas_tecnicas").update({ tabela_especial_ativa: f.tabelaEspecialAtiva }).eq("id", fid);
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

// ══ EXPLOSÃO DE AVIAMENTOS ══
export async function fetchExplosaoData() {
  const [fichasRes, avFichasRes, avLibRes, comprasVarRes] = await Promise.all([
    sb().from("fichas_tecnicas").select("id, produto_ref, qtd_most_var01, qtd_most_var02, qtd_most_var03, qtd_most_var04, qtd_most_var05, qtd_most_var06"),
    sb().from("ficha_aviamentos").select("ficha_id, codigo, qtd, valor, localizacao, var01"),
    sb().from("aviamentos").select("codigo, nome, fornecedor, preco, imagem, codigo_fornecedor"),
    sb().from("produto_variante_compras").select("produto_id, cor, qtd_compra1, qtd_compra2"),
  ]);
  if (fichasRes.error) console.error("fetchExplosaoData fichas:", fichasRes.error);
  if (avFichasRes.error) console.error("fetchExplosaoData avFichas:", avFichasRes.error);
  if (avLibRes.error) console.error("fetchExplosaoData avLib:", avLibRes.error);
  if (comprasVarRes.error) console.error("fetchExplosaoData comprasVar:", comprasVarRes.error);
  return {
    fichas: (fichasRes.data || []) as { id: number; produto_ref: string; qtd_most_var01: number|null; qtd_most_var02: number|null; qtd_most_var03: number|null; qtd_most_var04: number|null; qtd_most_var05: number|null; qtd_most_var06: number|null }[],
    avFichas: (avFichasRes.data || []) as { ficha_id: number; codigo: string; qtd: number; valor: number; localizacao: string; var01: string }[],
    avLib: (avLibRes.data || []) as { codigo: string; nome: string; fornecedor: string; preco: number; imagem: string; codigo_fornecedor: string }[],
    comprasVar: (comprasVarRes.data || []) as { produto_id: number; cor: string; qtd_compra1: number|null; qtd_compra2: number|null }[],
  };
}

// ══ TABELAS DE MEDIDAS ══
export async function fetchTabelasMedidas() {
  // Tenta buscar com imagem_modo_medir; se a coluna não existir, busca só id e nome
  const { data, error } = await sb().from("tabelas_medidas").select("id, nome, imagem_modo_medir").order("nome");
  if (error) {
    const { data: fallback } = await sb().from("tabelas_medidas").select("id, nome").order("nome");
    return fallback || [];
  }
  return data || [];
}
export async function saveTabelaImagemModoMedir(id: number, url: string) {
  const { error } = await sb().from("tabelas_medidas").update({ imagem_modo_medir: url }).eq("id", id);
  if (error) console.error("saveTabelaImagemModoMedir (coluna pode não existir ainda):", error);
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
  const { data: tecidos } = await sb().from("ficha_tecidos").select("ficha_id, cores, fichas_tecnicas!inner(produto_ref, colecao)").order("id");
  const result: Record<string, string[]> = {};
  (tecidos || []).forEach((t: any) => {
    const ref = t.fichas_tecnicas?.produto_ref;
    if (!ref || !t.cores?.length) return;
    if (!result[ref]) result[ref] = [];
    t.cores.forEach((c: string) => { if (c && !result[ref].includes(c)) result[ref].push(c); });
  });
  return result;
}

// Fetch season-specific variants for classic refs: ref -> colecao -> cores[]
export async function fetchVariantesPorColecao(): Promise<Record<string, Record<string, string[]>>> {
  const { data: tecidos } = await sb().from("ficha_tecidos").select("cores, fichas_tecnicas!inner(produto_ref, colecao)").order("id");
  const result: Record<string, Record<string, string[]>> = {};
  (tecidos || []).forEach((t: any) => {
    const ref = t.fichas_tecnicas?.produto_ref;
    const col = t.fichas_tecnicas?.colecao;
    if (!ref || !col || !t.cores?.length) return;
    if (!result[ref]) result[ref] = {};
    if (!result[ref][col]) result[ref][col] = [];
    t.cores.forEach((c: string) => { if (c && !result[ref][col].includes(c)) result[ref][col].push(c); });
  });
  return result;
}

// ══ CONTROLE DE FLUXO ══
export async function fetchControleFluxo() {
  const { data, error } = await sb().from("controle_fluxo").select("*");
  if (error) console.error("fetchControleFluxo:", error);
  return (data || []) as Record<string, any>[];
}

export async function upsertControleFluxo(produto_ref: string, field: string, value: string | null) {
  const { error } = await sb()
    .from("controle_fluxo")
    .upsert({ produto_ref, [field]: value || null, updated_at: new Date().toISOString() }, { onConflict: "produto_ref" });
  if (error) console.error("upsertControleFluxo:", error);
}

// ══ MAPA DE COLEÇÃO ══
export async function fetchMapaColecao() {
  const [prodsRes, fichasRes, tecidosRes, ficTecidosRes] = await Promise.all([
    sb().from("produtos").select("*").order("grupo").order("ref"),
    sb().from("fichas_tecnicas").select("produto_ref, imagem_url, imagem_modelo"),
    sb().from("tecidos").select("nome, composicao"),
    sb().from("ficha_tecidos").select("ficha_id, cores, fichas_tecnicas!inner(produto_ref, colecao)"),
  ]);
  if (prodsRes.error) console.error("fetchMapaColecao:", prodsRes.error);

  const imgMap: Record<string, string> = {};
  const fotoMap: Record<string, string> = {};
  (fichasRes.data || []).forEach((f: any) => {
    if (f.imagem_url) imgMap[f.produto_ref] = f.imagem_url;
    if (f.imagem_modelo) fotoMap[f.produto_ref] = f.imagem_modelo;
  });

  const tecidoCompMap: Record<string, string> = {};
  (tecidosRes.data || []).forEach((t: any) => { if (t.composicao) tecidoCompMap[t.nome] = t.composicao; });

  const coresMap: Record<string, string[]> = {};
  const fichasPorColecaoMap: Record<string, Record<string, string[]>> = {};
  (ficTecidosRes.data || []).forEach((t: any) => {
    const ref = t.fichas_tecnicas?.produto_ref;
    const fichaColecao = t.fichas_tecnicas?.colecao;
    if (!ref || !t.cores?.length) return;
    if (fichaColecao) {
      if (!fichasPorColecaoMap[ref]) fichasPorColecaoMap[ref] = {};
      if (!fichasPorColecaoMap[ref][fichaColecao]) fichasPorColecaoMap[ref][fichaColecao] = [];
      t.cores.forEach((c: string) => { if (c && !fichasPorColecaoMap[ref][fichaColecao].includes(c)) fichasPorColecaoMap[ref][fichaColecao].push(c); });
    } else {
      if (!coresMap[ref]) coresMap[ref] = [];
      t.cores.forEach((c: string) => { if (c && !coresMap[ref].includes(c)) coresMap[ref].push(c); });
    }
  });

  return (prodsRes.data || []).map((p: any) => ({
    id: p.id, ref: p.ref, desc: p.descricao || "",
    tecido: p.tecido || "", forn_tecido: p.forn_tecido || "",
    composicao: p.composicao || tecidoCompMap[p.tecido] || "",
    fornecedor: p.fornecedor || "", colecao: p.colecao || "",
    grupo: p.grupo || "", subgrupo: p.subgrupo || "", operacao: p.operacao || "",
    categoria: p.categoria || "", subcategoria: p.subcategoria || "",
    tab_medidas: p.tab_medidas || "", tipo: p.tipo || "",
    linha: p.linha || "", drop: p.drop_num || "", estilista: p.estilista || "",
    piloto_most: p.piloto_most || "", status: p.status || "",
    imagem_url: imgMap[p.ref] || "",
    imagem_modelo: fotoMap[p.ref] || "",
    cores: coresMap[p.ref] || [],
    fichas_por_colecao: fichasPorColecaoMap[p.ref] || {},
  }));
}

// ══ MAPA DE ENTREGAS ══
export async function fetchMapaEntregas() {
  const [prodsRes, fichasRes, tecidosRes, varComprasRes] = await Promise.all([
    sb().from("produtos").select("*"),
    sb().from("fichas_tecnicas").select("produto_ref, imagem_url, imagem_modelo"),
    sb().from("tecidos").select("nome, composicao"),
    sb().from("produto_variante_compras").select("*"),
  ]);

  const imgMap: Record<string, string> = {};
  const fotoMap: Record<string, string> = {};
  (fichasRes.data || []).forEach((f: any) => {
    if (f.imagem_url) imgMap[f.produto_ref] = f.imagem_url;
    if (f.imagem_modelo) fotoMap[f.produto_ref] = f.imagem_modelo;
  });

  const tecidoCompMap: Record<string, string> = {};
  (tecidosRes.data || []).forEach((t: any) => { if (t.composicao) tecidoCompMap[t.nome] = t.composicao; });

  const prodMap: Record<number, any> = {};
  (prodsRes.data || []).forEach((p: any) => { prodMap[p.id] = p; });

  const entryMap: Record<string, any> = {};

  (varComprasRes.data || []).forEach((vc: any) => {
    const prod = prodMap[vc.produto_id];
    if (!prod) return;
    const base = {
      ref: prod.ref, desc: prod.descricao || "", status: prod.status || "",
      tecido: prod.tecido || "", composicao: prod.composicao || tecidoCompMap[prod.tecido] || "",
      forn_tecido: prod.forn_tecido || "", fornecedor: prod.fornecedor || "",
      colecao: prod.colecao || "", grupo: prod.grupo || "", subgrupo: prod.subgrupo || "",
      operacao: prod.operacao || "", categoria: prod.categoria || "",
      subcategoria: prod.subcategoria || "", tipo: prod.tipo || "",
      linha: prod.linha || "", drop: prod.drop_num || "", estilista: prod.estilista || "",
      imagem_url: imgMap[prod.ref] || "", imagem_modelo: fotoMap[prod.ref] || "",
    };
    if (vc.data_entrega1 && (vc.qtd_compra1 || 0) > 0) {
      const key = `${prod.ref}|${vc.data_entrega1}|1`;
      if (!entryMap[key]) entryMap[key] = { ...base, data_entrega: vc.data_entrega1, compra_num: 1, variantes: [] };
      if (vc.cor) entryMap[key].variantes.push({ cor: vc.cor, qtd: vc.qtd_compra1 || 0, pedido: vc.pedido1 || "" });
    }
    if (vc.data_entrega2 && (vc.qtd_compra2 || 0) > 0) {
      const key = `${prod.ref}|${vc.data_entrega2}|2`;
      if (!entryMap[key]) entryMap[key] = { ...base, data_entrega: vc.data_entrega2, compra_num: 2, variantes: [] };
      if (vc.cor) entryMap[key].variantes.push({ cor: vc.cor, qtd: vc.qtd_compra2 || 0, pedido: vc.pedido2 || "" });
    }
  });

  return Object.values(entryMap).sort((a: any, b: any) =>
    a.data_entrega.localeCompare(b.data_entrega) || a.ref.localeCompare(b.ref)
  );
}
