"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { uploadImage } from "@/lib/storage";
import {
  fetchTabelasMedidas, fetchTabelaPontos, fetchGraduacoes,
  createTabelaMedidas, deleteTabelaMedidas,
  upsertPontos, upsertGraduacoes,
} from "@/lib/db";

type Tabela = { id: number; nome: string };
type Ponto = { cod: string; desc: string; tabela: string; tol: string };
type Grad = { desc: string; pp: string; p: string; m: string; g: string; gg: string; a1: string; a2: string; tol: string };

export default function MedidasView() {
  const [tabelas, setTabelas] = useState<Tabela[]>([]);
  const [sel, setSel] = useState<Tabela | null>(null);
  const [sec, setSec] = useState<"base" | "grad">("base");
  const [pontos, setPontos] = useState<Ponto[]>([]);
  const [grad, setGrad] = useState<Grad[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [im1, setIm1] = useState<string | null>(null);
  const r1 = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<any>(null);

  // Load all tables on mount
  useEffect(() => {
    loadTabelas();
  }, []);

  const loadTabelas = async () => {
    setLoading(true);
    const data = await fetchTabelasMedidas();
    setTabelas(data);
    setLoading(false);
  };

  // Load points + grad when table selected
  const selectTable = async (t: Tabela) => {
    setSel(t);
    setSec("base");
    setIm1(null);
    const [pts, grd] = await Promise.all([
      fetchTabelaPontos(t.id),
      fetchGraduacoes(t.id),
    ]);
    setPontos(pts.map((p: any) => ({ cod: p.cod, desc: p.descricao, tabela: p.valor_base, tol: p.tolerancia })));
    setGrad(grd.map((g: any) => ({ desc: g.descricao, pp: g.pp, p: g.p, m: g.m, g: g.g, gg: g.gg, a1: g.ampliacao_esq, a2: g.ampliacao_dir, tol: g.tolerancia })));
  };

  // Auto-save with debounce
  const scheduleSave = useCallback((type: "pontos" | "grad", data: any[]) => {
    if (!sel) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      if (type === "pontos") await upsertPontos(sel.id, data);
      else await upsertGraduacoes(sel.id, data);
      setSaving(false);
    }, 800);
  }, [sel]);

  // Point CRUD
  const addPonto = () => {
    const next = String.fromCharCode(65 + pontos.length);
    const updated = [...pontos, { cod: next, desc: "", tabela: "", tol: "1,0 + OU -" }];
    setPontos(updated);
    scheduleSave("pontos", updated);
  };
  const updatePonto = (i: number, field: string, val: string) => {
    const updated = pontos.map((p, j) => j === i ? { ...p, [field]: val } : p);
    setPontos(updated);
    scheduleSave("pontos", updated);
  };
  const removePonto = (i: number) => {
    const updated = pontos.filter((_, j) => j !== i);
    setPontos(updated);
    scheduleSave("pontos", updated);
  };

  // Grad CRUD
  const addGrad = () => {
    const updated = [...grad, { desc: "", pp: "", p: "", m: "", g: "", gg: "", a1: "", a2: "", tol: "1,0 + OU -" }];
    setGrad(updated);
    scheduleSave("grad", updated);
  };
  const updateGrad = (i: number, field: string, val: string) => {
    const updated = grad.map((r, j) => j === i ? { ...r, [field]: val } : r);
    setGrad(updated);
    scheduleSave("grad", updated);
  };
  const removeGrad = (i: number) => {
    const updated = grad.filter((_, j) => j !== i);
    setGrad(updated);
    scheduleSave("grad", updated);
  };

  // Create / delete table
  const handleCreate = async () => {
    const name = newName.trim().toUpperCase();
    if (!name) return;
    const result = await createTabelaMedidas(name);
    if (result) {
      await loadTabelas();
      setSel({ id: result.id, nome: result.nome });
      setPontos([]);
      setGrad([]);
      setSec("base");
    }
    setNewName("");
    setShowNew(false);
  };

  const handleDelete = async () => {
    if (!sel || !confirm(`Excluir tabela "${sel.nome}"?`)) return;
    await deleteTabelaMedidas(sel.id);
    setSel(null);
    setPontos([]);
    setGrad([]);
    await loadTabelas();
  };

  const hi = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file || !sel) return;
    const url = await uploadImage(file, `medidas/${sel.nome}/modo_de_medir`);
    if (url) setIm1(url);
  };

  const filteredTabelas = search ? tabelas.filter(t => t.nome.toLowerCase().includes(search.toLowerCase())) : tabelas;
  const ic = "w-full text-[13px] border border-[var(--separator-opaque)] rounded-md px-2 py-1 outline-none focus:border-[var(--system-blue)]";

  return (
    <div className="flex gap-8 min-h-[400px]">
      {/* Sidebar */}
      <div className="w-[240px] flex-shrink-0">
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--label-secondary)]">Tabelas de medidas</span>
          {saving && <span className="text-[10px] text-[var(--system-blue)] animate-pulse">Salvando...</span>}
        </div>
        <div className="mb-2 px-1"><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar tabela..." className="apple-input w-full text-[12px] py-1.5" /></div>
        <nav className="flex flex-col gap-0.5 max-h-[480px] overflow-y-auto">
          {loading ? <div className="px-3 py-4 text-[13px] text-[var(--label-tertiary)]">Carregando...</div> :
            filteredTabelas.map(t => (
              <button key={t.id} onClick={() => selectTable(t)}
                className={`text-left px-3 py-[7px] rounded-lg text-[13px] transition-all flex justify-between items-center gap-2 ${sel?.id === t.id ? "font-semibold bg-[rgba(0,122,255,0.08)] text-[var(--system-blue)]" : "text-[var(--label-primary)] hover:bg-[var(--bg-secondary)]"}`}>
                <span className="truncate">{t.nome}</span>
              </button>
            ))}
        </nav>
        <p className="text-[10px] text-[var(--label-quaternary)] px-3 mt-2">{filteredTabelas.length} de {tabelas.length} tabelas</p>

        {!showNew ? (
          <button onClick={() => setShowNew(true)} className="apple-btn-secondary w-full mt-3 text-[12px]">+ Nova tabela</button>
        ) : (
          <div className="mt-3 px-1">
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleCreate()}
              placeholder="Nome da tabela..." className="apple-input w-full text-[12px] py-1.5 mb-1.5" autoFocus />
            <div className="flex gap-1.5">
              <button onClick={handleCreate} className="apple-btn-primary flex-1 text-[12px] py-1.5">Criar</button>
              <button onClick={() => { setShowNew(false); setNewName(""); }} className="apple-input text-[12px] py-1.5 px-3 cursor-pointer text-center">Cancelar</button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {!sel ? (
          <div className="flex items-center justify-center h-full text-[var(--label-tertiary)]">{loading ? "Carregando..." : "Selecione ou crie uma tabela"}</div>
        ) : (
          <div>
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-[22px] font-bold tracking-[-0.02em]">{sel.nome}</h3>
              <button onClick={handleDelete} className="text-[12px] text-[var(--system-red)] hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors">Excluir tabela</button>
            </div>
            <p className="text-[13px] text-[var(--label-tertiary)] mb-4">Base M · {pontos.length} pontos{grad.length > 0 ? " · Graduação disponível" : ""}</p>

            <div className="seg-control mb-5">
              <button onClick={() => setSec("base")} className={`seg-btn ${sec === "base" ? "active" : ""}`}>Tabela base (M)</button>
              <button onClick={() => setSec("grad")} className={`seg-btn ${sec === "grad" ? "active" : ""}`}>Graduação</button>
            </div>

            {sec === "base" && (<div>
              <div className="mb-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--label-secondary)] mb-1.5">Modo de medir</div>
                <div className="border border-dashed border-[var(--separator-opaque)] rounded-xl bg-[var(--bg-secondary)] aspect-[16/9] max-h-[260px] flex items-center justify-center cursor-pointer hover:border-[var(--system-blue)] transition-colors overflow-hidden" onClick={() => r1.current?.click()}>
                  {im1 ? <img src={im1} alt="Modo de medir" className="w-full h-full object-contain p-1" /> :
                    <div className="text-center p-3"><svg className="mx-auto mb-1.5 text-[var(--label-quaternary)]" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg><p className="text-[12px] text-[var(--label-tertiary)]">Modo de medir</p><p className="text-[10px] text-[var(--label-quaternary)] mt-0.5">Clique para enviar</p></div>}
                </div>
                <input ref={r1} type="file" accept="image/*" className="hidden" onChange={hi} />
              </div>
              <div className="apple-card overflow-hidden mb-3">
                <table className="plm-table"><thead><tr><th className="text-center w-14">Cód</th><th>Descrição</th><th className="text-center w-20">Tabela (M)</th><th className="text-center w-28">Tolerância</th><th className="w-8"></th></tr></thead>
                  <tbody>{pontos.map((p, i) => (<tr key={i}>
                    <td className="px-1 py-1"><input type="text" value={p.cod} onChange={e => updatePonto(i, "cod", e.target.value)} className={`${ic} w-12 text-center font-bold`} /></td>
                    <td className="px-1 py-1"><input type="text" value={p.desc} onChange={e => updatePonto(i, "desc", e.target.value)} className={`${ic} font-medium`} placeholder="Descrição do ponto" /></td>
                    <td className="px-1 py-1"><input type="text" value={p.tabela} onChange={e => updatePonto(i, "tabela", e.target.value)} className={`${ic} w-16 text-center tabnum font-semibold`} placeholder="—" /></td>
                    <td className="px-1 py-1"><input type="text" value={p.tol} onChange={e => updatePonto(i, "tol", e.target.value)} className={`${ic} w-24 text-center text-[12px]`} /></td>
                    <td className="text-center"><button onClick={() => removePonto(i)} className="text-[var(--label-quaternary)] hover:text-[var(--system-red)] transition-colors">×</button></td>
                  </tr>))}
                    {pontos.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-[var(--label-tertiary)]">Nenhum ponto cadastrado</td></tr>}
                  </tbody></table>
              </div>
              <button onClick={addPonto} className="apple-btn-secondary text-[12px]">+ Adicionar ponto</button>
            </div>)}

            {sec === "grad" && (<div>
              <div className="apple-card overflow-hidden overflow-x-auto mb-3">
                <table className="plm-table"><thead><tr>
                  <th>Descrição</th><th className="text-center w-16">PP</th><th className="text-center w-16">P</th>
                  <th className="text-center w-16 !bg-[rgba(0,122,255,0.06)] !text-[var(--system-blue)]">M</th>
                  <th className="text-center w-16">G</th><th className="text-center w-16">GG</th>
                  <th className="text-center w-14">Ampl. ←</th><th className="text-center w-14">Ampl. →</th>
                  <th className="text-center w-24">Tolerância</th><th className="w-8"></th>
                </tr></thead>
                  <tbody>{grad.map((r, i) => (<tr key={i}>
                    <td className="px-1 py-1"><input type="text" value={r.desc} onChange={e => updateGrad(i, "desc", e.target.value)} className={`${ic} font-medium`} placeholder="Descrição" /></td>
                    {(["pp", "p", "m", "g", "gg"] as const).map(sz => (
                      <td key={sz} className={`px-1 py-1 ${sz === "m" ? "bg-[rgba(0,122,255,0.03)]" : ""}`}>
                        <input type="text" value={r[sz]} onChange={e => updateGrad(i, sz, e.target.value)} className={`${ic} w-14 text-center tabnum ${sz === "m" ? "font-bold" : ""}`} placeholder="—" />
                      </td>
                    ))}
                    <td className="px-1 py-1"><input type="text" value={r.a1} onChange={e => updateGrad(i, "a1", e.target.value)} className={`${ic} w-12 text-center tabnum text-[12px]`} /></td>
                    <td className="px-1 py-1"><input type="text" value={r.a2} onChange={e => updateGrad(i, "a2", e.target.value)} className={`${ic} w-12 text-center tabnum text-[12px]`} /></td>
                    <td className="px-1 py-1"><input type="text" value={r.tol} onChange={e => updateGrad(i, "tol", e.target.value)} className={`${ic} w-20 text-center text-[12px]`} /></td>
                    <td className="text-center"><button onClick={() => removeGrad(i)} className="text-[var(--label-quaternary)] hover:text-[var(--system-red)] transition-colors">×</button></td>
                  </tr>))}
                    {grad.length === 0 && <tr><td colSpan={10} className="py-8 text-center text-[var(--label-tertiary)]">Nenhuma graduação cadastrada</td></tr>}
                  </tbody></table>
              </div>
              <button onClick={addGrad} className="apple-btn-secondary text-[12px]">+ Adicionar linha</button>
              <p className="text-[11px] text-[var(--label-tertiary)] mt-3">Ampliação: diferença entre tamanhos (←M / M→)</p>
            </div>)}
          </div>
        )}
      </div>
    </div>
  );
}
