"use client";
import { useState, useRef, useEffect } from "react";
import { uploadImage, deleteImage } from "@/lib/storage";
import { fetchFicha, upsertFicha, saveFichaImagem, fetchPontosByTabelaNome, fetchGraduacoesByTabelaNome, fetchCadastros, fetchAviamentos, fetchTecidos } from "@/lib/db";
import { classificarNCM } from "@/lib/ncm";
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
  const [showExportDlg, setShowExportDlg] = useState(false);
  const [exportSections, setExportSections] = useState<{ ficha: boolean; estamparia: boolean; liberacao: boolean }>({ ficha: true, estamparia: true, liberacao: true });
  const fr = useRef<HTMLInputElement>(null);
  const mrr = useRef<HTMLInputElement>(null);
  const estImgRef = useRef<HTMLInputElement>(null);
  const [estImgTarget, setEstImgTarget] = useState<{ type: string; key: string } | null>(null);

  const [tec, setTec] = useState<any[]>([]);
  const [avi, setAvi] = useState<any[]>([]);
  const [pil, setPil] = useState<any[]>([{ num: "Piloto 1", lacre: "", envio: "", receb: "", prova: "", status: "" }, { num: "Piloto 2", lacre: "", envio: "", receb: "", prova: "", status: "" }, { num: "Piloto 3", lacre: "", envio: "", receb: "", prova: "", status: "" }]);
  const [obs, setObs] = useState("");
  const [sap, setSap] = useState(false);
  const [asq, setAsq] = useState("");
  const [corOpts, setCorOpts] = useState<string[]>([]);
  const [avCad, setAvCad] = useState<any[]>([]);
  const [tecCad, setTecCad] = useState<any[]>([]);
  const [estamparia, setEstamparia] = useState<any>({ artes: [{ posicao: "FRENTE", imagem: "", largura: "", localizacao: "" }, { posicao: "COSTAS", imagem: "", largura: "", localizacao: "" }, { posicao: "TAGLESS", imagem: "", largura: "", localizacao: "" }], tecnicas: [], simulacoes: { var01: { nome: "", imgSim: "", imgFoto: "", status: "" }, var02: { nome: "", imgSim: "", imgFoto: "", status: "" }, var03: { nome: "", imgSim: "", imgFoto: "", status: "" }, var04: { nome: "", imgSim: "", imgFoto: "", status: "" } }, observacoes: "" });
  const [varCodigos, setVarCodigos] = useState<{ var01: string; var02: string; var03: string; var04: string }>({ var01: "", var02: "", var03: "", var04: "" });
  const [statusLib, setStatusLib] = useState("");

  const [pts, setPts] = useState<any[]>([]);
  const [grad, setGrad] = useState<any[]>([]);
  const [pv, setPv] = useState<Record<string, { p1: string; p2: string; p3: string }>>({});
  const [an, setAn] = useState<Record<string, { texto: string; video: string }>>({ p1: { texto: "", video: "" }, p2: { texto: "", video: "" }, p3: { texto: "", video: "" } });

  /* NCM */
  const [ncm, setNcm] = useState("");
  const [ncmJust, setNcmJust] = useState("");
  const [ncmLoading, setNcmLoading] = useState(false);

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
        if (ficha.ncm) setNcm(ficha.ncm);
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
    const fichaData = { id: fichaId, tecidos: tec, aviamentos: avi, observacoes: obs, imagem_url: img, imagem_modelo: imgModelo, provas: pv, anotacoes: an, pantones: varCodigos, statusLiberacao: statusLib, ncm, estamparia, tabelaEspecialAtiva: tEsp, pontosEspeciais: tEsp ? ptsEsp : undefined, gradEspecial: tEsp ? gradEsp : undefined };
    const newId = await upsertFicha(row.ref, fichaData);
    if (newId) setFichaId(newId);
    onSave({ ...row, ficha: { ...fichaData, id: newId || fichaId } });
    setSaving(false);
  };

  const exportPDF = () => { setShowExportDlg(true); };
  const doExport = () => { setShowExportDlg(false); setShowPrint(true); document.body.classList.add("printing-pdf"); setTimeout(() => { window.print(); setTimeout(() => { setShowPrint(false); document.body.classList.remove("printing-pdf"); }, 500); }, 200); };

  const compOf = (nome: string) => tecCad.find((t: any) => t.nome === nome)?.comp || "";

  const gerarNcm = () => {
    setNcmLoading(true);
    try {
      const result = classificarNCM({
        grupo: row.grupo || "",
        subgrupo: row.subgrupo || "",
        categoria: row.categoria || "",
        tecido: row.tecido || "",
        composicao: compOf(row.tecido),
        descricao: row.desc || "",
      });
      setNcm(result.ncm);
      setNcmJust(result.justificativa);
    } catch {
      setNcmJust("Erro ao classificar NCM.");
    }
    setNcmLoading(false);
  };

  const avT = avi.reduce((s: number, a: any) => s + (a.valor * a.qtd), 0);
  const utc = (ti: number, ci: number, v: string) => setTec(p => p.map((t: any, i: number) => { if (i !== ti) return t; const c = [...(t.cores || [])]; while (c.length < 4) c.push(""); c[ci] = v; return { ...t, cores: c }; }));
  const ua = (i: number, k: string, v: any) => setAvi(p => p.map((a, j) => j === i ? { ...a, [k]: v } : a));
  const ra = (i: number) => setAvi(p => p.filter((_, j) => j !== i));
  const aa = (a: any) => { setAvi(p => [...p, { item: a.nome, cod: a.cod, qtd: 1, valor: a.preco, local: "", var01: "", var02: "", var03: "", var04: "" }]); setSap(false); setAsq(""); };
  const fa = asq ? avCad.filter((a: any) => (a.cod + a.nome).toLowerCase().includes(asq.toLowerCase())) : avCad;
  const gd = (t: string, m: string) => { if (!m) return ""; const a = parseFloat(t), b = parseFloat(m); if (isNaN(a) || isNaN(b)) return ""; const d = b - a; return d === 0 ? "0" : d > 0 ? `+${d.toFixed(1)}` : d.toFixed(1); };
  const gc = (t: string, m: string) => { if (!m) return ""; const d = parseFloat(m) - parseFloat(t); if (isNaN(d)) return ""; return Math.abs(d) > 1 ? "text-[var(--system-red)] font-semibold" : d === 0 ? "text-[var(--system-green)]" : "text-[var(--system-orange)]"; };
  const tm = row.tab_medidas || "";
  const hasEstamparia = (estamparia?.tecnicas || []).length > 0 || (estamparia?.artes || []).some((a: any) => a.imagem || a.largura || a.localizacao);

  /* ── Estamparia helpers ── */
  const updArte = (posicao: string, field: string, value: string) => setEstamparia((prev: any) => ({ ...prev, artes: (prev.artes || []).map((a: any) => a.posicao === posicao ? { ...a, [field]: value } : a) }));
  const updTecnica = (i: number, field: string, value: string) => setEstamparia((prev: any) => ({ ...prev, tecnicas: prev.tecnicas.map((t: any, j: number) => j === i ? { ...t, [field]: value } : t) }));
  const addTecnica = () => setEstamparia((prev: any) => ({ ...prev, tecnicas: [...prev.tecnicas, { tecnica: "", var01: "", var02: "", var03: "", var04: "" }] }));
  const removeTecnica = (i: number) => setEstamparia((prev: any) => ({ ...prev, tecnicas: prev.tecnicas.filter((_: any, j: number) => j !== i) }));
  const updSim = (vk: string, field: string, value: string) => setEstamparia((prev: any) => ({ ...prev, simulacoes: { ...prev.simulacoes, [vk]: { ...(prev.simulacoes?.[vk] || {}), [field]: value } } }));
  const handleEstImg = async (e: any) => { const file = e.target.files?.[0]; if (!file || !estImgTarget) return; setUp(true); const url = await uploadImage(file, `${row.ref}/estamparia/${estImgTarget.key}`); if (url) { if (estImgTarget.type === "arte") updArte(estImgTarget.key, "imagem", url); else if (estImgTarget.type === "sim") updSim(estImgTarget.key, "imgSim", url); else if (estImgTarget.type === "foto") updSim(estImgTarget.key, "imgFoto", url); } setUp(false); setEstImgTarget(null); if (estImgRef.current) estImgRef.current.value = ""; };
  const triggerEstImg = (type: string, key: string) => { setEstImgTarget({ type, key }); setTimeout(() => estImgRef.current?.click(), 0); };
  const deleteEstImg = async (type: string, key: string, url: string) => { if (url) await deleteImage(url); if (type === "arte") updArte(key, "imagem", ""); else if (type === "sim") updSim(key, "imgSim", ""); else if (type === "foto") updSim(key, "imgFoto", ""); };
  const TECNICAS_OPTS = ["SILK ZERO TOQUE", "SILK TRADICIONAL", "SILK HD", "SUBLIMAÇÃO", "TRANSFER", "DTF", "DTG", "BORDADO", "LASER", "HOT STAMPING"];

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
        <FichaPDF row={row} tec={tec} avi={avi} pil={pil} pts={tEsp ? ptsEsp : pts} grad={tEsp ? gradEsp : grad} pv={pv} an={an} img={img} imgModelo={imgModelo} hasEstamparia={hasEstamparia} estamparia={estamparia} pantones={varCodigos} obs={obs} statusLib={statusLib} tecCad={tecCad} tabelaEspecial={tEsp} sections={exportSections} ncm={ncm} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-8 overflow-y-auto bg-black/30 backdrop-blur-[6px] no-print" onClick={onClose}>
      <div className="bg-[var(--bg-primary)] rounded-2xl w-full max-w-[980px] shadow-[0_24px_80px_rgba(0,0,0,0.18)] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-[var(--separator)] gap-2.5">
          <div className="seg-control overflow-x-auto">
            {([["ficha", "Ficha técnica"], ["estamparia", "Estamparia"], ["liberacao", "Liberação"]] as [string, string][]).map(([id, l]) => (
              <button key={id} onClick={() => setTab(id as any)} className={`seg-btn whitespace-nowrap ${tab === id ? "active" : ""}`}>{l}</button>
            ))}
          </div>
          <div className="flex gap-2 sm:gap-2.5 items-center justify-end flex-shrink-0">
            {(up || saving) && <span className="text-[12px] text-[var(--system-blue)] animate-pulse font-medium">{saving ? "Salvando..." : "Enviando..."}</span>}
            <button onClick={exportPDF} className="text-[12px] sm:text-[13px] font-medium text-[var(--system-blue)] hover:bg-blue-50 px-2 sm:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
              <svg className="inline mr-1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span className="hidden sm:inline">Exportar </span>PDF
            </button>
            <button onClick={save} className="apple-btn-primary text-[12px] sm:text-[13px] !px-3 sm:!px-5">Salvar</button>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--label-secondary)] flex-shrink-0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        </div>

        {/* ═══ EXPORT DIALOG ═══ */}
        {showExportDlg && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-[4px]" onClick={() => setShowExportDlg(false)}>
            <div className="bg-[var(--bg-primary)] rounded-2xl w-[calc(100%-32px)] max-w-[380px] shadow-[0_24px_80px_rgba(0,0,0,0.2)] overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="px-6 pt-5 pb-3 border-b border-[var(--separator)]">
                <h3 className="text-[16px] font-bold">Exportar PDF</h3>
                <p className="text-[12px] text-[var(--label-secondary)] mt-1">Selecione as seções para exportar:</p>
              </div>
              <div className="px-6 py-4 space-y-3">
                {([["ficha", "Ficha Técnica", "Dados do produto, tecidos, aviamentos, pilotagem"], ["estamparia", "Estamparia", "Artes, técnicas, simulações e fotos"], ["liberacao", "Liberação", "Tabela de medidas, provas e graduação"]] as [string, string, string][]).map(([key, label, desc]) => (
                  <label key={key} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${(exportSections as any)[key] ? "border-[var(--system-blue)] bg-[rgba(0,122,255,0.04)]" : "border-[var(--separator-opaque)] hover:border-[var(--label-tertiary)]"}`}>
                    <input type="checkbox" checked={(exportSections as any)[key]} onChange={e => setExportSections(prev => ({ ...prev, [key]: e.target.checked }))} className="mt-0.5 w-4 h-4 accent-[var(--system-blue)]" />
                    <div>
                      <div className="text-[13px] font-semibold">{label}</div>
                      <div className="text-[11px] text-[var(--label-tertiary)]">{desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="px-6 pb-5 flex gap-2.5 justify-end">
                <button onClick={() => setShowExportDlg(false)} className="apple-btn-secondary">Cancelar</button>
                <button onClick={doExport} disabled={!exportSections.ficha && !exportSections.estamparia && !exportSections.liberacao} className="apple-btn-primary disabled:opacity-40">Exportar</button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ FICHA TÉCNICA ═══ */}
        {tab === "ficha" && (<div className="px-3 sm:px-6 py-4 sm:py-6 space-y-5">
          <div className="bg-[#1c3654] text-white rounded-xl px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[13px] font-bold">FICHA TÉCNICA</span>
            <span className="text-[11px] font-semibold bg-white/15 px-3 py-0.5 rounded-full">{row.piloto_most || "MOSTRUÁRIO"}</span>
            <span className="text-[12px]"><span className="text-white/50">Coleção</span> <span className="font-semibold ml-1">{row.colecao}</span></span>
          </div>
          <div className="apple-card">
            <div className="grid grid-cols-1 sm:grid-cols-2">{([["Referência", row.ref], ["Descrição", row.desc], ["Tecido", row.tecido], ["Forn. tecido", row.forn_tecido], ["Composição", compOf(row.tecido)], ["Operação", row.operacao], ["Fornecedor", row.fornecedor], ["Estilista", row.estilista], ["Tab. medidas", row.tab_medidas]] as [string, any][]).map(([l, v]) => <F key={l} l={l} v={v} />)}</div>
            <div className="grid grid-cols-2 sm:grid-cols-4">{([["Drop", row.drop], ["Grade", row.grade], ["Tipo", row.tipo], ["Linha", row.linha]] as [string, any][]).map(([l, v]) => <F key={l} l={l} v={v} />)}</div>
            <div className="border-t border-[var(--separator)]" />
            <div className="grid grid-cols-2 sm:grid-cols-3">{([["Grupo", row.grupo], ["Subgrupo", row.subgrupo], ["Categoria", row.categoria], ["Subcategoria", row.subcategoria], ["Tipo", row.tipo]] as [string, any][]).map(([l, v]) => <F key={l} l={l} v={v} />)}<div /></div>
            <div className="border-t border-[var(--separator)]" />
            <div className="px-4 py-3 flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-[11px] text-[var(--label-secondary)] font-medium whitespace-nowrap">NCM:</span>
              <input type="text" value={ncm} onChange={e => { setNcm(e.target.value); setNcmJust(""); }} placeholder="0000.00.00" className="w-[120px] sm:w-[140px] text-[13px] font-mono font-semibold tabnum border border-[var(--separator-opaque)] rounded-lg px-3 py-1.5 outline-none focus:border-[var(--system-blue)]" />
              <button onClick={gerarNcm} disabled={ncmLoading} className="apple-btn-secondary text-[12px] !py-1.5 !px-3 flex items-center gap-1.5">
                {ncmLoading ? <span className="animate-pulse">Gerando...</span> : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>Gerar NCM</>}
              </button>
              {ncmJust && <span className="text-[11px] text-[var(--label-tertiary)] truncate w-full sm:w-auto sm:flex-1" title={ncmJust}>{ncmJust}</span>}
            </div>
          </div>
          <div className="apple-card bg-[var(--bg-secondary)] cursor-pointer hover:border-[var(--system-blue)] relative" onClick={() => fr.current?.click()}>
            <div className="aspect-[16/9] max-h-[380px] flex items-center justify-center">{img ? <img src={img} alt="Desenho" className="w-full h-full object-contain p-3" /> : <div className="text-center"><svg className="mx-auto mb-2 text-[var(--label-quaternary)]" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg><p className="text-[13px] text-[var(--label-tertiary)]">Desenho técnico</p></div>}</div>
            {img && <button onClick={e => { e.stopPropagation(); deleteImg(); }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>}
          </div>
          <input ref={fr} type="file" accept="image/*" className="hidden" onChange={e => hi(e, "imagem_url", setImg)} />

          <div className="apple-card overflow-x-auto"><table className="plm-table"><thead><tr><th className="px-4">Artigo</th><th className="w-24">Fornec.</th><th className="w-36">Composição</th><th className="text-center w-16">Preço</th><th className="text-center w-[140px]">Var 01</th><th className="text-center w-[140px]">Var 02</th><th className="text-center w-[140px]">Var 03</th><th className="text-center w-[140px]">Var 04</th></tr></thead><tbody>{tec.map((t: any, ti: number) => { const cs = t.cores || ["", "", "", ""]; while (cs.length < 4) cs.push(""); return (<tr key={ti}><td className="px-4"><span className="text-[var(--label-tertiary)] text-[11px] mr-1.5">Tec.{String(ti + 1).padStart(2, "0")}</span><span className="font-semibold">{t.artigo}</span></td><td>{t.forn}</td><td className="text-[12px] text-[var(--label-secondary)] px-3">{compOf(t.artigo) || "—"}</td><td className="text-center tabnum">{t.preco > 0 ? t.preco.toFixed(2) : "—"}</td>{cs.slice(0, 4).map((c: string, ci: number) => (<td key={ci} className="px-1.5 py-1.5"><select value={c} onChange={e => utc(ti, ci, e.target.value)} className={`w-full text-[12px] px-2 py-1.5 rounded-lg border outline-none cursor-pointer ${c ? "border-[var(--system-blue)] bg-[rgba(0,122,255,0.06)] text-[var(--system-blue)] font-medium" : "border-[var(--separator-opaque)] text-[var(--label-quaternary)]"}`}><option value="">Selecionar</option>{corOpts.map(x => <option key={x} value={x}>{x}</option>)}</select></td>))}</tr>); })}</tbody><tfoot><tr className="border-t border-[var(--separator-opaque)] bg-[var(--bg-secondary)]"><td colSpan={3} className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--label-secondary)] whitespace-nowrap">Pantone / Código</td><td />{(["var01","var02","var03","var04"] as const).map(k => (<td key={k} className="px-1.5 py-1.5"><input type="text" value={varCodigos[k]} onChange={e => setVarCodigos(prev => ({ ...prev, [k]: e.target.value }))} placeholder="P. 000 C" className="w-full text-[12px] px-2 py-1.5 rounded-lg border border-[var(--separator-opaque)] outline-none focus:border-[var(--system-blue)] text-center font-mono tracking-wide" /></td>))}</tr></tfoot></table></div>

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
        {tab === "estamparia" && (<div className="px-3 sm:px-6 py-4 sm:py-6 space-y-5">
          {/* Header */}
          <div className="bg-[#1c3654] text-white rounded-xl px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[13px] font-bold">FICHA TECNICA DE ESTAMPARIA</span>
            <span className="text-[11px] font-semibold bg-white/15 px-3 py-0.5 rounded-full">{row.piloto_most || "MOSTRUÁRIO"}</span>
            <span className="text-[12px]"><span className="text-white/50">Coleção</span> <span className="font-semibold ml-1">{row.colecao}</span></span>
          </div>

          {/* Product info */}
          <div className="apple-card">
            <div className="grid grid-cols-1 sm:grid-cols-2">{([["Referência", row.ref], ["Descrição", row.desc], ["Operação", row.operacao], ["Fornecedor", row.fornecedor], ["Estilista", row.estilista], ["Grade", row.grade], ["Drop", row.drop], ["Tecido", row.tecido]] as [string, any][]).map(([l, v]) => <F key={l} l={l} v={v} />)}</div>
          </div>

          {/* Artes: FRENTE + COSTAS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {(estamparia.artes || []).filter((a: any) => a.posicao !== "TAGLESS").map((arte: any) => (
              <div key={arte.posicao} className="space-y-2.5">
                <div className="bg-[#1c3654] text-white rounded-lg px-4 py-2 text-center"><span className="text-[12px] font-bold tracking-wide">ARTE {arte.posicao}</span></div>
                <div className="apple-card bg-[var(--bg-secondary)] aspect-[4/3] flex items-center justify-center cursor-pointer hover:border-[var(--system-blue)] relative overflow-hidden" onClick={() => triggerEstImg("arte", arte.posicao)}>
                  {arte.imagem ? <img src={arte.imagem} alt={`Arte ${arte.posicao}`} className="w-full h-full object-contain p-3" /> : <div className="text-center"><svg className="mx-auto mb-2 text-[var(--label-quaternary)]" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg><p className="text-[13px] text-[var(--label-tertiary)]">Clique para enviar</p></div>}
                  {arte.imagem && <button onClick={e => { e.stopPropagation(); deleteEstImg("arte", arte.posicao, arte.imagem); }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>}
                </div>
                <input type="text" value={arte.largura} onChange={e => updArte(arte.posicao, "largura", e.target.value)} placeholder="Ex: 34CM LARG." className="apple-input w-full text-[12px]" />
                <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--label-secondary)]">Localização</div>
                <textarea value={arte.localizacao} onChange={e => updArte(arte.posicao, "localizacao", e.target.value)} placeholder="Descreva a localização da estampa..." rows={3} className="apple-input w-full resize-none text-[12px]" />
              </div>
            ))}
          </div>

          {/* TAGLESS */}
          {(() => { const tg = (estamparia.artes || []).find((a: any) => a.posicao === "TAGLESS"); if (!tg) return null; return (
            <div className="space-y-2.5">
              <div className="bg-[#1c3654] text-white rounded-lg px-4 py-2 text-center"><span className="text-[12px] font-bold tracking-wide">TAGLESS</span></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="apple-card bg-[var(--bg-secondary)] aspect-[3/2] flex items-center justify-center cursor-pointer hover:border-[var(--system-blue)] relative overflow-hidden" onClick={() => triggerEstImg("arte", "TAGLESS")}>
                  {tg.imagem ? <img src={tg.imagem} alt="Tagless" className="w-full h-full object-contain p-3" /> : <div className="text-center"><svg className="mx-auto mb-2 text-[var(--label-quaternary)]" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg><p className="text-[13px] text-[var(--label-tertiary)]">Clique para enviar</p></div>}
                  {tg.imagem && <button onClick={e => { e.stopPropagation(); deleteEstImg("arte", "TAGLESS", tg.imagem); }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>}
                </div>
                <div className="space-y-2">
                  <input type="text" value={tg.largura} onChange={e => updArte("TAGLESS", "largura", e.target.value)} placeholder="Ex: 5,5CM" className="apple-input w-full text-[12px]" />
                  <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--label-secondary)]">Localização</div>
                  <textarea value={tg.localizacao} onChange={e => updArte("TAGLESS", "localizacao", e.target.value)} placeholder="Ex: Tagless centralizado na parte interna das costas a 1,5cm do cobre gola" rows={3} className="apple-input w-full resize-none text-[12px]" />
                </div>
              </div>
            </div>
          ); })()}

          {/* Técnicas de Estamparia */}
          <div className="pt-5 border-t-2 border-[#1c3654]">
            <div className="bg-[#1c3654] text-white rounded-xl px-5 py-3 flex items-center justify-between mb-4"><span className="text-[13px] font-bold">TÉCNICA DE ESTAMPARIA</span></div>
            <div className="apple-card overflow-x-auto">
              <table className="plm-table">
                <thead><tr>
                  <th className="text-center w-10">#</th>
                  <th className="min-w-[180px]">Técnica de Estamparia</th>
                  <th className="text-center w-[140px]">Variante 01{tec[0]?.cores?.[0] ? <div className="text-[10px] font-normal text-[var(--label-tertiary)]">{tec[0].cores[0]}</div> : null}</th>
                  <th className="text-center w-[140px]">Variante 02{tec[0]?.cores?.[1] ? <div className="text-[10px] font-normal text-[var(--label-tertiary)]">{tec[0].cores[1]}</div> : null}</th>
                  <th className="text-center w-[140px]">Variante 03{tec[0]?.cores?.[2] ? <div className="text-[10px] font-normal text-[var(--label-tertiary)]">{tec[0].cores[2]}</div> : null}</th>
                  <th className="text-center w-[140px]">Variante 04{tec[0]?.cores?.[3] ? <div className="text-[10px] font-normal text-[var(--label-tertiary)]">{tec[0].cores[3]}</div> : null}</th>
                  <th className="w-8"></th>
                </tr></thead>
                <tbody>{(estamparia.tecnicas || []).map((t: any, i: number) => (
                  <tr key={i}>
                    <td className="text-center font-bold text-[var(--label-secondary)]">{i + 1}</td>
                    <td className="px-1 py-1.5"><select value={t.tecnica} onChange={e => updTecnica(i, "tecnica", e.target.value)} className="w-full text-[12px] px-2 py-1.5 rounded-lg border border-[var(--separator-opaque)] outline-none focus:border-[var(--system-blue)]"><option value="">Selecionar técnica</option>{TECNICAS_OPTS.map(o => <option key={o} value={o}>{o}</option>)}</select></td>
                    {(["var01", "var02", "var03", "var04"] as const).map(k => (
                      <td key={k} className="px-1 py-1.5"><input type="text" value={t[k] || ""} onChange={e => updTecnica(i, k, e.target.value)} placeholder="Cor / Pantone" className="w-full text-[12px] text-center px-2 py-1.5 rounded-lg border border-[var(--separator-opaque)] outline-none focus:border-[var(--system-blue)]" /></td>
                    ))}
                    <td className="text-center"><button onClick={() => removeTecnica(i)} className="text-[var(--label-quaternary)] hover:text-[var(--system-red)] text-[16px]">×</button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <button onClick={addTecnica} className="apple-btn-secondary mt-3">+ Adicionar técnica</button>
          </div>

          {/* Simulações e Fotos por Variante */}
          <div className="pt-5 border-t-2 border-[#1c3654]">
            <div className="bg-[#1c3654] text-white rounded-xl px-5 py-3 flex items-center justify-between mb-4"><span className="text-[13px] font-bold">SIMULAÇÕES E FOTOS</span></div>
            <div className="space-y-5">
              {(["var01", "var02", "var03", "var04"] as const).map((vk, vi) => {
                const corName = tec[0]?.cores?.[vi] || "";
                const sim = estamparia.simulacoes?.[vk] || { nome: "", imgSim: "", imgFoto: "", status: "" };
                return (
                  <div key={vk} className="apple-card p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[14px] font-bold">Variante {String(vi + 1).padStart(2, "0")}</span>
                        {corName && <span className="text-[12px] font-semibold px-3 py-0.5 rounded-full bg-[rgba(0,122,255,0.08)] text-[var(--system-blue)]">{corName}</span>}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {([
                          ["PENDENTE", "Pendente", "border-[var(--separator-opaque)] text-[var(--label-tertiary)] bg-transparent"],
                          ["LIBERADA DIRETO MOSTRUÁRIO", "Liberada", "bg-[rgba(52,199,89,0.14)] text-[#248a3d] border-[rgba(52,199,89,0.25)]"],
                          ["LIBERADA COM AJUSTE", "c/ Ajuste", "bg-[rgba(255,204,0,0.18)] text-[#856500] border-[rgba(255,204,0,0.35)]"],
                          ["REPROVADA", "Reprovada", "bg-[rgba(255,59,48,0.12)] text-[#d70015] border-[rgba(255,59,48,0.25)]"],
                        ] as [string, string, string][]).map(([val, label, cls]) => (
                          <button key={val} onClick={() => updSim(vk, "status", sim.status === val ? "" : val)} className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${sim.status === val ? cls : "border-[var(--separator-opaque)] text-[var(--label-quaternary)] bg-transparent hover:border-[var(--label-tertiary)]"}`}>{label}</button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--label-secondary)]">Simulação</div>
                        <div className="apple-card bg-[var(--bg-secondary)] aspect-[4/3] flex items-center justify-center cursor-pointer hover:border-[var(--system-blue)] relative overflow-hidden" onClick={() => triggerEstImg("sim", vk)}>
                          {sim.imgSim ? <img src={sim.imgSim} alt={`Simulação ${vk}`} className="w-full h-full object-contain p-2" /> : <div className="text-center"><svg className="mx-auto mb-1 text-[var(--label-quaternary)]" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg><p className="text-[12px] text-[var(--label-tertiary)]">Simulação</p></div>}
                          {sim.imgSim && <button onClick={e => { e.stopPropagation(); deleteEstImg("sim", vk, sim.imgSim); }} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--label-secondary)]">Foto</div>
                        <div className="apple-card bg-[var(--bg-secondary)] aspect-[4/3] flex items-center justify-center cursor-pointer hover:border-[var(--system-blue)] relative overflow-hidden" onClick={() => triggerEstImg("foto", vk)}>
                          {sim.imgFoto ? <img src={sim.imgFoto} alt={`Foto ${vk}`} className="w-full h-full object-contain p-2" /> : <div className="text-center"><svg className="mx-auto mb-1 text-[var(--label-quaternary)]" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg><p className="text-[12px] text-[var(--label-tertiary)]">Foto</p></div>}
                          {sim.imgFoto && <button onClick={e => { e.stopPropagation(); deleteEstImg("foto", vk, sim.imgFoto); }} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Observações */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--label-secondary)] mb-2">Observações</div>
            <textarea value={estamparia.observacoes || ""} onChange={e => setEstamparia((prev: any) => ({ ...prev, observacoes: e.target.value }))} placeholder="Observações de estamparia..." rows={3} className="apple-input w-full resize-none" />
          </div>

          {/* Hidden file input for estamparia uploads */}
          <input ref={estImgRef} type="file" accept="image/*" className="hidden" onChange={handleEstImg} />
        </div>)}

        {/* ═══ LIBERAÇÃO ═══ */}
        {tab === "liberacao" && (<div className="px-3 sm:px-6 py-4 sm:py-6 space-y-5">
          <div className="bg-[#1c3654] text-white rounded-xl px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-2"><span className="text-[13px] font-bold">TABELA DE MEDIDAS — LIBERAÇÃO</span><span className="text-[12px]"><span className="text-white/50">Coleção</span> <span className="font-semibold ml-1">{row.colecao}</span></span></div>
          <div className="apple-card"><div className="grid grid-cols-1 sm:grid-cols-2">{([["Referência", row.ref], ["Descrição", row.desc], ["Tabela base", tm], ["Tamanho", "M"], ["Tecido", row.tecido], ["Fornecedor", row.fornecedor], ["Estilista", row.estilista], ["Grade", row.grade]] as [string, any][]).map(([l, v]) => <F key={l} l={l} v={v} />)}</div></div>

          <div className="apple-card px-4 sm:px-5 py-3.5 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--label-secondary)]">Status da liberação</span>
            <div className="flex flex-wrap gap-2">
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
            <div className="apple-card px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-2">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
