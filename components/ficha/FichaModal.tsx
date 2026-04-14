"use client";
import { useState, useRef, useEffect } from "react";
import { uploadImage, deleteImage } from "@/lib/storage";
import { fetchFicha, upsertFicha, saveFichaImagem, fetchPontosByTabelaNome, fetchGraduacoesByTabelaNome, fetchCadastros, fetchAviamentos, fetchTecidos } from "@/lib/db";
import FichaPDF from "./FichaPDF";

type Props = { row: any; onClose: () => void; onSave: (r: any) => void };

export default function FichaModal({ row, onClose, onSave }: Props) {
  const [tab, setTab] = useState<"ficha" | "estamparia" | "liberacao">("ficha");
  const [img, setImg] = useState<string | null>(null);
  const [imgModelo, setImgModelo] = useState<string | null>(null);
  const [up, setUp] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fichaId, setFichaId] = useState<number | null>(null);
  const [showPrint, setShowPrint] = useState(false);
  const fr = useRef<HTMLInputElement>(null);
  const mrr = useRef<HTMLInputElement>(null);

  const [tec, setTec] = useState<any[]>([]);
  const [avi, setAvi] = useState<any[]>([]);
  const [pil, setPil] = useState<any[]>([{ num: "Piloto 1", lacre: "", envio: "", receb: "", prova: "", status: "" }, { num: "Piloto 2", lacre: "", envio: "", receb: "", prova: "", status: "" }, { num: "Piloto 3", lacre: "", envio: "", receb: "", prova: "", status: "" }]);
  const [obs, setObs] = useState("");
  const [sap, setSap] = useState(false);
  const [asq, setAsq] = useState("");
  const [corOpts, setCorOpts] = useState<string[]>([]);
  const [avCad, setAvCad] = useState<any[]>([]);
  const [tecCad, setTecCad] = useState<any[]>([]);
  const [estamparia, setEstamparia] = useState<any>({ tecnicas: [] });
  const [varCodigos, setVarCodigos] = useState<{ var01: string; var02: string; var03: string; var04: string }>({ var01: "", var02: "", var03: "", var04: "" });
  const [statusLib, setStatusLib] = useState("");

  const [pts, setPts] = useState<any[]>([]);
  const [grad, setGrad] = useState<any[]>([]);
  const [pv, setPv] = useState<Record<string, { p1: string; p2: string; p3: string }>>({});
  const [an, setAn] = useState<Record<string, { texto: string; video: string }>>({ p1: { texto: "", video: "" }, p2: { texto: "", video: "" }, p3: { texto: "", video: "" } });

  /* Tabela especial (por produto) */
  const [tEsp, setTEsp] = useState(false);
  const [ptsEsp, setPtsEsp] = useState<any[]>([]);
  const [gradEsp, setGradEsp] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [ficha, cadastros, aviCad, tecs] = await Promise.all([fetchFicha(row.ref), fetchCadastros(), fetchAviamentos(), fetchTecidos()]);
      setCorOpts(cadastros.cor || []);
      setAvCad(aviCad);
      setTecCad(tecs);
      if (ficha) {
        setFichaId(ficha.id); setImg(ficha.imagem_url); setImgModelo(ficha.imagem_modelo);
        const ficTec = ficha.tecidos || [];
        setTec(ficTec.length > 0 ? ficTec : row.tecido ? [{ artigo: row.tecido, forn: row.forn_tecido || "", preco: 0, cores: ["", "", "", ""] }] : []);
        setAvi(ficha.aviamentos || []);
        if (ficha.pilotagem?.length) setPil(ficha.pilotagem);
        setObs(ficha.observacoes || "");
        if (ficha.provas) setPv(ficha.provas);
        if (ficha.anotacoes) setAn(prev => ({ ...prev, ...ficha.anotacoes }));
        if (ficha.estamparia) setEstamparia(ficha.estamparia);
        if (ficha.pantones) setVarCodigos({ var01: ficha.pantones.var01 || "", var02: ficha.pantones.var02 || "", var03: ficha.pantones.var03 || "", var04: ficha.pantones.var04 || "" });
        if (ficha.statusLiberacao) setStatusLib(ficha.statusLiberacao);
        if (ficha.tabelaEspecialAtiva) { setTEsp(true); setPtsEsp(ficha.pontosEspeciais || []); setGradEsp(ficha.gradEspecial || []); }
      }
      /* Se não há ficha e o produto tem tecido, cria linha inicial */
      if (!ficha && row.tecido) {
        setTec([{ artigo: row.tecido, forn: row.forn_tecido || "", preco: 0, cores: ["", "", "", ""] }]);
      }
      if (row.tab_medidas) {
        const [p, g] = await Promise.all([
          fetchPontosByTabelaNome(row.tab_medidas),
          fetchGraduacoesByTabelaNome(row.tab_medidas),
        ]);
        setPts(p);
        setGrad(g);
        if (!ficha?.provas) { const init: any = {}; p.forEach((pt: any) => { init[pt.cod] = { p1: "", p2: "", p3: "" }; }); setPv(init); }
      }
    })();
  }, [row.ref, row.tab_medidas]);

  const hi = async (e: any, fd: string, s: (u: string) => void) => { const file = e.target.files?.[0]; if (!file) return; setUp(true); const url = await uploadImage(file, `${row.ref}/${fd}`); if (url) { s(url); if (fichaId) await saveFichaImagem(fichaId, fd, url); } setUp(false); };
  const deleteImg = async () => { if (img) await deleteImage(img); setImg(null); if (fichaId) await saveFichaImagem(fichaId, "imagem_url", ""); };
  const deleteImgModelo = async () => { if (imgModelo) await deleteImage(imgModelo); setImgModelo(null); if (fichaId) await saveFichaImagem(fichaId, "imagem_modelo", ""); };

  const save = async () => {
    setSaving(true);
    const fichaData = { id: fichaId, tecidos: tec, aviamentos: avi, observacoes: obs, imagem_url: img, imagem_modelo: imgModelo, provas: pv, anotacoes: an, pantones: varCodigos, statusLiberacao: statusLib, tabelaEspecialAtiva: tEsp, pontosEspeciais: tEsp ? ptsEsp : undefined, gradEspecial: tEsp ? gradEsp : undefined };
    const newId = await upsertFicha(row.ref, fichaData);
    if (newId) setFichaId(newId);
    onSave({ ...row, ficha: { ...fichaData, id: newId || fichaId } });
    setSaving(false);
  };

  const exportPDF = () => { setShowPrint(true); setTimeout(() => { window.print(); setTimeout(() => setShowPrint(false), 500); }, 200); };

  const compOf = (nome: string) => tecCad.find((t: any) => t.nome === nome)?.comp || "";
  const avT = avi.reduce((s: number, a: any) => s + (a.valor * a.qtd), 0);
  const utc = (ti: number, ci: number, v: string) => setTec(p => p.map((t: any, i: number) => { if (i !== ti) return t; const c = [...(t.cores || [])]; while (c.length < 4) c.push(""); c[ci] = v; return { ...t, cores: c }; }));
  const addTec = () => setTec(p => [...p, { artigo: "", forn: "", preco: 0, cores: ["", "", "", ""] }]);
  const rmTec = (i: number) => setTec(p => p.filter((_, j) => j !== i));
  const utcField = (i: number, k: string, v: any) => setTec(p => p.map((t, j) => j === i ? { ...t, [k]: v } : t));
  const ua = (i: number, k: string, v: any) => setAvi(p => p.map((a, j) => j === i ? { ...a, [k]: v } : a));
  const ra = (i: number) => setAvi(p => p.filter((_, j) => j !== i));
  const aa = (a: any) => { setAvi(p => [...p, { item: a.nome, cod: a.cod, qtd: 1, valor: a.preco, local: "", var01: "", var02: "", var03: "", var04: "" }]); setSap(false); setAsq(""); };
  const fa = asq ? avCad.filter((a: any) => (a.cod + a.nome).toLowerCase().includes(asq.toLowerCase())) : avCad;
  const gd = (t: string, m: string) => { if (!m) return ""; const a = parseFloat(t), b = parseFloat(m); if (isNaN(a) || isNaN(b)) return ""; const d = b - a; return d === 0 ? "0" : d > 0 ? `+${d.toFixed(1)}` : d.toFixed(1); };
  const gc = (t: string, m: string) => { if (!m) return ""; const d = parseFloat(m) - parseFloat(t); if (isNaN(d)) return ""; return Math.abs(d) > 1 ? "text-[var(--system-red)] font-semibold" : d === 0 ? "text-[var(--system-green)]" : "text-[var(--system-orange)]"; };
  const tm = row.tab_medidas || "";
  const hasEstamparia = (estamparia?.tecnicas || []).length > 0;

  /* ── Tabela Especial helpers ── */
  const fmtN = (n: number) => n % 1 === 0 ? n.toString() : n.toFixed(1).replace(/\.0$/, "");
  const autoCalc = (r: any) => {
    const m = parseFloat(String(r.m).replace(",", ".")), a1 = parseFloat(String(r.a1).replace(",", ".")), a2 = parseFloat(String(r.a2).replace(",", "."));
    if (isNaN(m) || isNaN(a1) || isNaN(a2)) return r;
    return { ...r, p: fmtN(m - a1), pp: fmtN(m - 2 * a1), g: fmtN(m + a2), gg: fmtN(m + 2 * a2) };
  };
  const toggleEsp = () => {
    if (!tEsp) {
      if (!ptsEsp.length && pts.length) setPtsEsp(pts.map(p => ({ ...p })));
      if (!gradEsp.length && grad.length) setGradEsp(grad.map(g => autoCalc({ ...g })));
    }
    setTEsp(!tEsp);
  };
  const updGradEsp = (i: number, k: string, v: string) => {
    setGradEsp(prev => prev.map((g, j) => {
      if (j !== i) return g;
      const upd = { ...g, [k]: v };
      if (["m", "a1", "a2"].includes(k)) return autoCalc(upd);
      return upd;
    }));
  };
  const updPtsEsp = (i: number, k: string, v: string) => {
    setPtsEsp(prev => prev.map((p, j) => j === i ? { ...p, [k]: v } : p));
  };
  /* pontos ativos e grad ativos (especial ou original) */
  const ptsAtivo = tEsp ? ptsEsp : pts;
  const gradAtivo = tEsp ? gradEsp : grad;

  // Print mode — render only the PDF component
  if (showPrint) {
    return (
      <div className="print-overlay">
        <FichaPDF row={row} tec={tec} avi={avi} pil={pil} pts={tEsp ? ptsEsp : pts} grad={tEsp ? gradEsp : grad} pv={pv} an={an} img={img} imgModelo={imgModelo} hasEstamparia={hasEstamparia} estamparia={estamparia} pantones={varCodigos} obs={obs} statusLib={statusLib} tecCad={tecCad} tabelaEspecial={tEsp} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8 overflow-y-auto bg-black/30 backdrop-blur-[6px] no-print" onClick={onClose}>
      <div className="bg-[var(--bg-primary)] rounded-2xl w-full max-w-[980px] shadow-[0_24px_80px_rgba(0,0,0,0.18)] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[var(--separator)]">
          <div className="seg-control">
            {([["ficha", "Ficha técnica"], ["estamparia", "Estamparia"], ["liberacao", "Liberação"]] as [string, string][]).map(([id, l]) => (
              <button key={id} onClick={() => setTab(id as any)} className={`seg-btn ${tab === id ? "active" : ""}`}>{l}</button>
            ))}
          </div>
          <div className="flex gap-2.5 items-center">
            {(up || saving) && <span className="text-[12px] text-[var(--system-blue)] animate-pulse font-medium">{saving ? "Salvando..." : "Enviando..."}</span>}
            <button onClick={exportPDF} className="text-[13px] font-medium text-[var(--system-blue)] hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
              <svg className="inline mr-1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exportar PDF
            </button>
            <button onClick={save} className="apple-btn-primary">Salvar</button>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--label-secondary)]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        </div>

        {/* ═══ FICHA TÉCNICA ═══ */}
        {tab === "ficha" && (<div className="px-6 py-6 space-y-5">
          <div className="bg-[#1c3654] text-white rounded-xl px-5 py-3 flex items-center justify-between">
            <span className="text-[13px] font-bold">FICHA TÉCNICA</span>
            <span className="text-[11px] font-semibold bg-white/15 px-3 py-0.5 rounded-full">{row.piloto_most || "MOSTRUÁRIO"}</span>
            <span className="text-[12px]"><span className="text-white/50">Coleção</span> <span className="font-semibold ml-1">{row.colecao}</span></span>
          </div>
          <div className="apple-card">
            <div className="grid grid-cols-2">{([["Referência", row.ref], ["Descrição", row.desc], ["Tecido", row.tecido], ["Forn. tecido", row.forn_tecido], ["Composição", compOf(row.tecido)], ["Operação", row.operacao], ["Fornecedor", row.fornecedor], ["Estilista", row.estilista], ["Tab. medidas", row.tab_medidas]] as [string, any][]).map(([l, v]) => <F key={l} l={l} v={v} />)}</div>
            <div className="grid grid-cols-4">{([["Drop", row.drop], ["Grade", row.grade], ["Tipo", row.tipo], ["Linha", row.linha]] as [string, any][]).map(([l, v]) => <F key={l} l={l} v={v} />)}</div>
            <div className="border-t border-[var(--separator)]" />
            <div className="grid grid-cols-3">{([["Grupo", row.grupo], ["Subgrupo", row.subgrupo], ["Categoria", row.categoria], ["Subcategoria", row.subcategoria], ["Tipo", row.tipo]] as [string, any][]).map(([l, v]) => <F key={l} l={l} v={v} />)}<div /></div>
          </div>
          <div className="apple-card bg-[var(--bg-secondary)] cursor-pointer hover:border-[var(--system-blue)] relative" onClick={() => fr.current?.click()}>
            <div className="aspect-[16/9] max-h-[380px] flex items-center justify-center">{img ? <img src={img} alt="Desenho" className="w-full h-full object-contain p-3" /> : <div className="text-center"><svg className="mx-auto mb-2 text-[var(--label-quaternary)]" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg><p className="text-[13px] text-[var(--label-tertiary)]">Desenho técnico</p></div>}</div>
            {img && <button onClick={e => { e.stopPropagation(); deleteImg(); }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>}
          </div>
          <input ref={fr} type="file" accept="image/*" className="hidden" onChange={e => hi(e, "imagem_url", setImg)} />

          <div className="apple-card overflow-x-auto"><table className="plm-table"><thead><tr><th className="px-4">Artigo</th><th className="w-24">Fornec.</th><th className="w-36">Composição</th><th className="text-center w-16">Preço</th><th className="text-center w-[140px]">Var 01</th><th className="text-center w-[140px]">Var 02</th><th className="text-center w-[140px]">Var 03</th><th className="text-center w-[140px]">Var 04</th><th className="w-8"></th></tr></thead><tbody>{tec.map((t: any, ti: number) => { const cs = t.cores || ["", "", "", ""]; while (cs.length < 4) cs.push(""); return (<tr key={ti}><td className="px-4"><span className="text-[var(--label-tertiary)] text-[11px] mr-1.5">Tec.{String(ti + 1).padStart(2, "0")}</span>{tecCad.length > 0 ? <select value={t.artigo} onChange={e => { const sel = tecCad.find((tc: any) => tc.nome === e.target.value); utcField(ti, "artigo", e.target.value); if (sel) utcField(ti, "forn", sel.forn || ""); }} className="text-[13px] font-semibold border-none bg-transparent outline-none cursor-pointer">{!t.artigo && <option value="">Selecionar tecido</option>}{tecCad.map((tc: any) => <option key={tc.nome} value={tc.nome}>{tc.nome}</option>)}</select> : <span className="font-semibold">{t.artigo}</span>}</td><td className="text-[12px] text-[var(--label-secondary)]">{t.forn}</td><td className="text-[12px] text-[var(--label-secondary)] px-3">{compOf(t.artigo) || "—"}</td><td className="text-center tabnum">{t.preco > 0 ? t.preco.toFixed(2) : "—"}</td>{cs.slice(0, 4).map((c: string, ci: number) => (<td key={ci} className="px-1.5 py-1.5"><select value={c} onChange={e => utc(ti, ci, e.target.value)} className={`w-full text-[12px] px-2 py-1.5 rounded-lg border outline-none cursor-pointer ${c ? "border-[var(--system-blue)] bg-[rgba(0,122,255,0.06)] text-[var(--system-blue)] font-medium" : "border-[var(--separator-opaque)] text-[var(--label-quaternary)]"}`}><option value="">Selecionar</option>{corOpts.map(x => <option key={x} value={x}>{x}</option>)}</select></td>))}<td className="text-center"><button onClick={() => rmTec(ti)} className="text-[var(--label-quaternary)] hover:text-[var(--system-red)]">×</button></td></tr>); })}</tbody><tfoot><tr className="border-t border-[var(--separator-opaque)] bg-[var(--bg-secondary)]"><td colSpan={3} className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--label-secondary)] whitespace-nowrap">Pantone / Código</td><td />{(["var01","var02","var03","var04"] as const).map(k => (<td key={k} className="px-1.5 py-1.5"><input type="text" value={varCodigos[k]} onChange={e => setVarCodigos(prev => ({ ...prev, [k]: e.target.value }))} placeholder="P. 000 C" className="w-full text-[12px] px-2 py-1.5 rounded-lg border border-[var(--separator-opaque)] outline-none focus:border-[var(--system-blue)] text-center font-mono tracking-wide" /></td>))}<td /></tr></tfoot></table></div>
          <button onClick={addTec} className="apple-btn-secondary">+ Adicionar tecido</button>

          <div className="pt-5 border-t-2 border-[#1c3654]">
            <div className="bg-[#1c3654] text-white rounded-xl px-5 py-3 flex items-center justify-between mb-4"><span className="text-[13px] font-bold">AVIAMENTAÇÃO</span></div>
            <div className="apple-card overflow-x-auto mb-3"><table className="plm-table"><thead><tr><th className="px-4">Matéria prima</th><th className="w-24">Código</th><th className="text-center w-12">Qtd</th><th className="text-right w-16">Valor</th><th className="min-w-[200px]">Localização</th><th className="text-center w-28">Var 01</th><th className="text-center w-28">Var 02</th><th className="text-center w-28">Var 03</th><th className="text-center w-28">Var 04</th><th className="w-8"></th></tr></thead><tbody>{avi.map((a: any, i: number) => (<tr key={i}><td className="font-medium px-4">{a.item}</td><td className="font-mono text-[11px] text-[var(--label-secondary)]">{a.cod}</td><td className="text-center px-1"><input type="number" value={a.qtd} onChange={e => ua(i, "qtd", parseInt(e.target.value) || 1)} className="w-11 text-center text-[13px] border border-[var(--separator-opaque)] rounded-md px-1 py-1 outline-none" /></td><td className="text-right tabnum">{a.valor > 0 ? a.valor.toFixed(2) : "—"}</td><td className="px-1 py-1"><textarea value={a.local} onChange={e => ua(i, "local", e.target.value)} rows={2} className="w-full text-[12px] border border-[var(--separator-opaque)] rounded-lg px-2.5 py-1.5 outline-none resize-none leading-tight" placeholder="Localização..." /></td>{["var01", "var02", "var03", "var04"].map(k => (<td key={k} className="px-1 py-1"><select value={a[k] || ""} onChange={e => ua(i, k, e.target.value)} className="w-full text-[11px] border border-[var(--separator-opaque)] rounded-md px-1.5 py-1 outline-none"><option value="">—</option>{corOpts.map(c => <option key={c} value={c}>{c}</option>)}<option value="BRANCO">BRANCO</option><option value="CRU">CRU</option><option value="PRETO">PRETO</option></select></td>))}<td className="text-center"><button onClick={() => ra(i)} className="text-[var(--label-quaternary)] hover:text-[var(--system-red)]">×</button></td></tr>))}{avi.length > 0 && <tr className="border-t border-[var(--separator-opaque)]"><td colSpan={3} className="px-4 py-2.5 font-bold">Total</td><td className="text-right tabnum font-bold py-2.5">R$ {avT.toFixed(2)}</td><td colSpan={6} /></tr>}</tbody></table></div>
            {!sap ? <button onClick={() => setSap(true)} className="apple-btn-secondary mb-4">+ Adicionar aviamento</button> : (
              <div className="apple-card p-3.5 mb-4 bg-[rgba(0,122,255,0.03)] border-[var(--system-blue)]"><div className="flex gap-2 mb-2"><input type="text" value={asq} onChange={e => setAsq(e.target.value)} placeholder="Buscar aviamento..." className="apple-input flex-1" autoFocus /><button onClick={() => { setSap(false); setAsq(""); }} className="text-[13px] text-[var(--label-secondary)] px-2">Cancelar</button></div><div className="max-h-[240px] overflow-y-auto overscroll-y-contain border border-[var(--separator-opaque)] rounded-xl bg-[var(--bg-primary)]">{fa.map((a: any) => (<button key={a.cod} onClick={() => aa(a)} className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-[var(--bg-secondary)] border-b border-[var(--separator)] flex justify-between"><span><span className="font-mono text-[11px] text-[var(--label-tertiary)] mr-2">{a.cod}</span><span className="font-medium">{a.nome}</span></span><span className="tabnum text-[var(--label-secondary)]">{a.preco > 0 ? `R$ ${a.preco.toFixed(2)}` : "—"}</span></button>))}</div></div>
            )}
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--label-secondary)] mb-2">Observações</div>
            <textarea value={obs} onChange={e => setObs(e.target.value)} placeholder="Observações técnicas, instruções especiais..." rows={3} className="apple-input w-full resize-none" />
          </div>
        </div>)}

        {/* ═══ ESTAMPARIA ═══ */}
        {tab === "estamparia" && (<div className="px-6 py-6 space-y-5">
          <div className="bg-[#1c3654] text-white rounded-xl px-5 py-3 flex items-center justify-between"><span className="text-[13px] font-bold">ESTAMPARIA</span></div>
          <div className="grid grid-cols-2 gap-5">{["Frente", "Costas"].map(s => (<div key={s} className="apple-card bg-[var(--bg-secondary)] aspect-[4/3] flex items-center justify-center"><div className="text-center"><svg className="mx-auto mb-2 text-[var(--label-quaternary)]" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg><p className="text-[13px] text-[var(--label-tertiary)]">{s}</p></div></div>))}</div>
        </div>)}

        {/* ═══ LIBERAÇÃO ═══ */}
        {tab === "liberacao" && (<div className="px-6 py-6 space-y-5">
          <div className="bg-[#1c3654] text-white rounded-xl px-5 py-3 flex items-center justify-between"><span className="text-[13px] font-bold">TABELA DE MEDIDAS — LIBERAÇÃO</span><span className="text-[12px]"><span className="text-white/50">Coleção</span> <span className="font-semibold ml-1">{row.colecao}</span></span></div>
          <div className="apple-card"><div className="grid grid-cols-2">{([["Referência", row.ref], ["Descrição", row.desc], ["Tabela base", tm], ["Tamanho", "M"], ["Tecido", row.tecido], ["Fornecedor", row.fornecedor], ["Estilista", row.estilista], ["Grade", row.grade]] as [string, any][]).map(([l, v]) => <F key={l} l={l} v={v} />)}</div></div>

          <div className="apple-card px-5 py-3.5 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--label-secondary)]">Status da liberação</span>
            <div className="flex gap-2">
              {([
                ["REPROVADO",              "Reprovado",           "bg-[rgba(255,59,48,0.12)] text-[#d70015] border-[rgba(255,59,48,0.25)]"],
                ["APROVADO COM RESTRIÇÃO", "Aprov. c/ restrição", "bg-[rgba(255,204,0,0.18)] text-[#856500]  border-[rgba(255,204,0,0.35)]"],
                ["APROVADO",              "Aprovado",            "bg-[rgba(52,199,89,0.14)] text-[#248a3d] border-[rgba(52,199,89,0.25)]"],
              ] as [string, string, string][]).map(([val, label, cls]) => (
                <button key={val} onClick={() => setStatusLib(prev => prev === val ? "" : val)}
                  className={`px-3.5 py-1 rounded-full text-[12px] font-semibold border transition-all ${statusLib === val ? cls : "border-[var(--separator-opaque)] text-[var(--label-quaternary)] bg-transparent hover:border-[var(--label-tertiary)]"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {!tm ? <div className="apple-card p-16 text-center"><p className="text-[16px] font-medium text-[var(--label-secondary)]">Nenhuma tabela selecionada</p></div> : (<>

            {/* Toggle tabela especial */}
            <div className="apple-card px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--label-secondary)]">Tabela de medidas</span>
                {tEsp && <span className="text-[10px] font-bold uppercase tracking-[0.06em] px-2.5 py-0.5 rounded-full bg-[rgba(255,159,10,0.14)] text-[#c77c00]">Especial</span>}
              </div>
              <button onClick={toggleEsp} className={`px-3.5 py-1 rounded-full text-[12px] font-semibold border transition-all ${tEsp ? "bg-[rgba(255,159,10,0.14)] text-[#c77c00] border-[rgba(255,159,10,0.3)]" : "border-[var(--separator-opaque)] text-[var(--label-tertiary)] hover:border-[var(--label-secondary)]"}`}>
                {tEsp ? "Desativar especial" : "Ativar tabela especial"}
              </button>
            </div>

            {/* Tabela de medidas (pontos) */}
            <div className="apple-card overflow-x-auto"><table className="plm-table"><thead>
              <tr><th colSpan={3} className="border-b-0" /><th colSpan={2} className="text-center !text-[var(--system-blue)] border-b border-blue-100 !bg-[rgba(0,122,255,0.04)] py-1.5">Prova 1</th><th colSpan={2} className="text-center border-b py-1.5">Prova 2</th><th colSpan={2} className="text-center border-b py-1.5">Prova 3</th><th className="border-b-0" /></tr>
              <tr><th className="text-center w-12">Cód</th><th>Descrição</th><th className="text-center w-16">{tEsp ? <span className="text-[var(--system-orange)]">Tabela</span> : "Tabela"}</th><th className="text-center w-16 !bg-[rgba(0,122,255,0.04)] !text-[var(--system-blue)]">Med.</th><th className="text-center w-14 !bg-[rgba(0,122,255,0.04)] !text-[var(--system-blue)]">Dif.</th><th className="text-center w-16">Med.</th><th className="text-center w-14">Dif.</th><th className="text-center w-16">Med.</th><th className="text-center w-14">Dif.</th><th className="text-center w-24">Tol.</th></tr>
            </thead><tbody>{ptsAtivo.map((p: any, pi: number) => { const v = pv[p.cod] || { p1: "", p2: "", p3: "" }; return (<tr key={p.cod}>
              <td className="text-center font-bold text-[var(--label-secondary)] px-3">{p.cod}</td>
              <td className="font-medium px-3">{p.desc}</td>
              <td className={`text-center tabnum font-semibold px-1 ${tEsp ? "bg-[rgba(255,159,10,0.04)]" : ""}`}>{tEsp
                ? <input type="text" value={p.tabela} onChange={e => updPtsEsp(pi, "tabela", e.target.value)} className="w-14 text-center text-[13px] tabnum border border-[rgba(255,159,10,0.4)] rounded-md px-1 py-1 outline-none focus:border-[var(--system-orange)] bg-[rgba(255,159,10,0.04)]" />
                : p.tabela
              }</td>
              {(["p1", "p2", "p3"] as const).map(pk => { const val = v[pk]; const d = gd(p.tabela, val); const cl = gc(p.tabela, val); return [<td key={pk} className={`px-1 py-1 ${pk === "p1" ? "bg-[rgba(0,122,255,0.02)]" : ""}`}><input type="text" value={val} onChange={e => { setPv(prev => ({ ...prev, [p.cod]: { ...v, [pk]: e.target.value } })); }} className="w-14 text-center text-[13px] tabnum border border-[var(--separator-opaque)] rounded-md px-1 py-1 outline-none focus:border-[var(--system-blue)]" placeholder="—" /></td>, <td key={pk + "d"} className={`text-center tabnum text-[12px] ${cl} ${pk === "p1" ? "bg-[rgba(0,122,255,0.02)]" : ""}`}>{d || "—"}</td>]; })}
              <td className="text-center text-[12px] text-[var(--label-secondary)] px-2">{p.tol}</td>
            </tr>); })}</tbody></table></div>

            {/* Graduação */}
            {gradAtivo.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--label-secondary)]">Graduação — {tEsp ? "Especial" : tm}</span>
                  {tEsp && <span className="text-[10px] text-[var(--system-orange)]">Edite M e ampliações — PP, P, G, GG são calculados</span>}
                </div>
                <div className="apple-card overflow-hidden overflow-x-auto">
                  <table className="plm-table">
                    <thead><tr>
                      <th>Descrição</th><th className="text-center w-16">PP</th><th className="text-center w-16">P</th>
                      <th className="text-center w-16 !bg-[rgba(0,122,255,0.06)] !text-[var(--system-blue)]">M</th>
                      <th className="text-center w-16">G</th><th className="text-center w-16">GG</th>
                      <th className="text-center w-14">Ampl. ←</th><th className="text-center w-14">Ampl. →</th>
                      <th className="text-center w-24">Tolerância</th>
                    </tr></thead>
                    <tbody>{gradAtivo.map((g: any, i: number) => (
                      <tr key={i}>
                        <td className="font-medium px-3">{g.desc}</td>
                        <td className="text-center tabnum px-2" style={tEsp ? { background: "rgba(0,122,255,0.02)", color: "var(--label-tertiary)" } : {}}>{g.pp}</td>
                        <td className="text-center tabnum px-2" style={tEsp ? { background: "rgba(0,122,255,0.02)", color: "var(--label-tertiary)" } : {}}>{g.p}</td>
                        <td className={`text-center tabnum font-bold px-1 ${tEsp ? "bg-[rgba(255,159,10,0.04)]" : "bg-[rgba(0,122,255,0.03)]"}`}>{tEsp
                          ? <input type="text" value={g.m} onChange={e => updGradEsp(i, "m", e.target.value)} className="w-14 text-center text-[13px] tabnum font-bold border border-[rgba(255,159,10,0.4)] rounded-md px-1 py-1 outline-none focus:border-[var(--system-orange)] bg-[rgba(255,159,10,0.04)]" />
                          : g.m
                        }</td>
                        <td className="text-center tabnum px-2" style={tEsp ? { background: "rgba(0,122,255,0.02)", color: "var(--label-tertiary)" } : {}}>{g.g}</td>
                        <td className="text-center tabnum px-2" style={tEsp ? { background: "rgba(0,122,255,0.02)", color: "var(--label-tertiary)" } : {}}>{g.gg}</td>
                        <td className={`text-center tabnum text-[12px] px-1 border-l border-[var(--separator)] ${tEsp ? "" : "text-[var(--label-secondary)]"}`}>{tEsp
                          ? <input type="text" value={g.a1} onChange={e => updGradEsp(i, "a1", e.target.value)} className="w-12 text-center text-[12px] tabnum border border-[rgba(255,159,10,0.4)] rounded-md px-1 py-1 outline-none focus:border-[var(--system-orange)] bg-[rgba(255,159,10,0.04)]" />
                          : g.a1
                        }</td>
                        <td className={`text-center tabnum text-[12px] px-1 ${tEsp ? "" : "text-[var(--label-secondary)]"}`}>{tEsp
                          ? <input type="text" value={g.a2} onChange={e => updGradEsp(i, "a2", e.target.value)} className="w-12 text-center text-[12px] tabnum border border-[rgba(255,159,10,0.4)] rounded-md px-1 py-1 outline-none focus:border-[var(--system-orange)] bg-[rgba(255,159,10,0.04)]" />
                          : g.a2
                        }</td>
                        <td className="text-center text-[12px] text-[var(--label-secondary)] px-2">{g.tol}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                <p className="text-[11px] text-[var(--label-tertiary)] mt-2">{tEsp ? "PP, P, G, GG são calculados automaticamente a partir de M e das ampliações. As tabelas originais nos cadastros não são afetadas." : "Ampliação: diferença entre tamanhos (←M / M→)"}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-5">
              <div><div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--label-secondary)] mb-1.5">Modo de medir</div><div className="apple-card bg-[var(--bg-secondary)] aspect-[4/3] flex items-center justify-center"><div className="text-center"><svg className="mx-auto mb-1 text-[var(--label-quaternary)]" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg><p className="text-[12px] text-[var(--label-tertiary)]">Cadastrado na tabela</p></div></div></div>
              <div><div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--label-secondary)] mb-1.5">Modelo</div><div className="relative"><div className="apple-card bg-[var(--bg-secondary)] aspect-[4/3] flex items-center justify-center cursor-pointer hover:border-[var(--system-blue)] overflow-hidden" onClick={() => mrr.current?.click()}>{imgModelo ? <img src={imgModelo} alt="Modelo" className="w-full h-full object-contain p-1" /> : <div className="text-center"><svg className="mx-auto mb-1 text-[var(--label-quaternary)]" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg><p className="text-[12px] text-[var(--label-tertiary)]">Clique para enviar</p></div>}</div>{imgModelo && <button onClick={e => { e.stopPropagation(); deleteImgModelo(); }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors z-10"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>}</div><input ref={mrr} type="file" accept="image/*" className="hidden" onChange={e => hi(e, "imagem_modelo", setImgModelo)} /></div>
            </div>
            <div className="space-y-3">{([1, 2, 3] as const).map(n => { const k = `p${n}` as "p1" | "p2" | "p3"; const a = an[k] || { texto: "", video: "" }; return (<div key={n} className="apple-card p-4"><div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--label-secondary)] mb-2">Anotações — Prova {n}</div><textarea value={a.texto} onChange={e => setAn(prev => ({ ...prev, [k]: { ...a, texto: e.target.value } }))} placeholder="Anotações..." className="apple-input w-full resize-none h-14 mb-2" /><div className="flex items-center gap-2"><span className="text-[11px] text-[var(--label-tertiary)]">Vídeo:</span><input type="text" value={a.video} onChange={e => setAn(prev => ({ ...prev, [k]: { ...a, video: e.target.value } }))} placeholder="https://..." className="apple-input flex-1 text-[12px]" /></div></div>); })}</div>
          </>)}
        </div>)}
      </div>
    </div>
  );
}

function F({ l, v }: { l: string; v: any }) { return <div className="flex items-baseline gap-2.5 px-4 py-2 border-b border-r border-[var(--separator)]"><span className="text-[11px] text-[var(--label-secondary)] whitespace-nowrap font-medium">{l}:</span><span className="text-[13px] font-semibold">{v || "—"}</span></div>; }
