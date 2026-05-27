"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import InlineCell from "@/components/ui/InlineCell";
import COLUMNS from "@/lib/columns";
import { fetchCadastros, fetchTecidos, fetchTabelasComPontos, updateProdutoField, insertProduto, deleteProduto } from "@/lib/db";
import { useAuth } from "@/lib/auth-context";

type Props = { rows: any[]; setRows: (fn: any) => void; onOpenFicha: (row: any) => void; userEmail?: string; readOnly?: boolean; permPrefix?: string; hiddenColumns?: string[] };
const FC = COLUMNS.filter(c => c.type === "select" && c.cad && c.key !== "colecao");
const ALWAYS_VISIBLE = ["ref"];

// ── Colunas de status exclusivas de Compras ───────────────────────────────
const STATUS_PRECO_OPTS = ["SEM CUSTO","CUSTO SOLICITADO","EM NEGOCIAÇÃO","CUSTO FECHADO"];
const STATUS_COMPRAS_OPTS = ["PEDIDO MOST. COLOCADO","MOSTRUÁRIO ENTREGUE","PED. DE PRODUÇÃO COLOCADO","PRODUÇÃO ENTREGUE"];
const SP_PRECO_STYLE: Record<string,{bg:string;color:string}> = {
  "SEM CUSTO":         {bg:"rgba(142,142,147,0.15)",color:"var(--label-secondary)"},
  "CUSTO SOLICITADO":  {bg:"rgba(255,149,0,0.15)",  color:"#b86a00"},
  "EM NEGOCIAÇÃO":     {bg:"rgba(0,122,255,0.12)",  color:"var(--system-blue)"},
  "CUSTO FECHADO":     {bg:"rgba(52,199,89,0.15)",  color:"#1a7a35"},
};
const SP_COMPRAS_STYLE: Record<string,{bg:string;color:string}> = {
  "PEDIDO MOST. COLOCADO":     {bg:"rgba(255,149,0,0.12)",  color:"#b86a00"},
  "MOSTRUÁRIO ENTREGUE":       {bg:"rgba(90,120,255,0.12)", color:"#3a4ec4"},
  "PED. DE PRODUÇÃO COLOCADO": {bg:"rgba(175,82,222,0.12)", color:"#7c2eaa"},
  "PRODUÇÃO ENTREGUE":         {bg:"rgba(52,199,89,0.15)",  color:"#1a7a35"},
};
const COMPRAS_STATUS_COLS = [
  {key:"status_preco",   label:"Status Preço",   width:165, opts:STATUS_PRECO_OPTS,   styles:SP_PRECO_STYLE},
  {key:"status_compras", label:"Status Compras", width:210, opts:STATUS_COMPRAS_OPTS, styles:SP_COMPRAS_STYLE},
];

// ── Colunas financeiras exclusivas de Compras ──────────────────────────────
const PRICE_COLS = [
  { key: "custo_inicial",   label: "Custo inicial",    width: 115, computed: false },
  { key: "markup_inicial",  label: "Markup inicial",   width: 115, computed: false },
  { key: "_varejo_ini",     label: "$ Varejo inicial", width: 125, computed: true  },
  { key: "preco_target",    label: "$ Target",         width: 105, computed: false },
  { key: "_markup_target",  label: "Markup target",    width: 115, computed: true  },
  { key: "custo_final",     label: "Custo final",      width: 105, computed: false },
  { key: "_markup_final",   label: "Markup final",     width: 110, computed: true  },
  { key: "varejo_final",    label: "$ Varejo final",   width: 120, computed: false },
];
const MULT_KEYS = new Set(["markup_inicial", "_markup_target", "_markup_final"]);

function getPriceVal(key: string, row: any): number | null {
  const n = (k: string) => { const v = parseFloat(row[k]); return isNaN(v) || row[k] == null ? null : v; };
  if (key === "_varejo_ini")    { const c = n("custo_inicial"),  m = n("markup_inicial"); return c !== null && m !== null ? c * m : null; }
  if (key === "_markup_target") { const t = n("preco_target"),   c = n("custo_inicial");  return t !== null && c !== null && c > 0 ? t / c : null; }
  if (key === "_markup_final")  { const v = n("varejo_final"),   c = n("custo_final");    return v !== null && c !== null && c > 0 ? v / c : null; }
  return n(key);
}
function fmtBRL(v: number | null, isMult = false): string {
  if (v === null) return "—";
  const s = v.toFixed(2).replace(".", ",");
  return isMult ? s + "×" : "R$ " + s;
}

export default function DevTable({ rows, setRows, onOpenFicha, userEmail, readOnly = false, permPrefix = "", hiddenColumns = [] }: Props) {
  const { user } = useAuth();
  const isAdmin = user?.user_metadata?.role === "admin";
  const perms: Record<string, boolean> = user?.user_metadata?.permissions || {};
  const canEdit   = (key: string) => isAdmin || perms[permPrefix + key] === true;
  const canAdd    = isAdmin || perms[permPrefix + "can_add"] === true;
  const canDelete = isAdmin || perms[permPrefix + "can_delete"] === true;

  const colsStorageKey = `plm_cols_${permPrefix || "estilo"}`;

  const [cad, setCad] = useState<Record<string, any>>({});
  const [q, setQ] = useState("");
  const [fl, setFl] = useState<Record<string,string>>({});
  const [sf, setSf] = useState(false);
  const [colecaoAtiva, setColecaoAtiva] = useState<string | null>(null);
  const [dupAlert, setDupAlert] = useState<string|null>(null);
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem(`plm_cols_${permPrefix || "estilo"}`) || "{}"); }
    catch { return {}; }
  });
  const [showColMenu, setShowColMenu] = useState(false);
  const colMenuRef = useRef<HTMLDivElement>(null);
  const ac = Object.values(fl).filter(Boolean).length;

  // Column visibility helpers
  const isColVisible = (key: string) => {
    if (ALWAYS_VISIBLE.includes(key)) return true;
    if (hiddenColumns.includes(key)) return false;
    return visibleCols[key] !== false;
  };
  const toggleCol = (key: string) => setVisibleCols(p => ({ ...p, [key]: !isColVisible(key) }));
  const toggleableCols = [
    ...COLUMNS.filter(c => !ALWAYS_VISIBLE.includes(c.key) && !hiddenColumns.includes(c.key)),
    ...(permPrefix === "compras_" ? [...COMPRAS_STATUS_COLS, ...PRICE_COLS] : []),
  ];
  const hiddenCount = toggleableCols.filter(c => !isColVisible(c.key)).length;

  const toggleSort = (k: string) => {
    setSort(prev => {
      if (!prev || prev.key !== k) return { key: k, dir: "asc" };
      if (prev.dir === "asc") return { key: k, dir: "desc" };
      return null; // terceiro clique: remove ordenação
    });
  };

  useEffect(() => {
    (async () => {
      const [cadastros, tecidos, tabNomes] = await Promise.all([
        fetchCadastros(), fetchTecidos(), fetchTabelasComPontos(),
      ]);
      setCad({ ...cadastros, tecido: tecidos.map((t: any) => t.nome), tab_medidas: tabNomes, _tecidoData: tecidos });
    })();
  }, []);

  useEffect(() => {
    localStorage.setItem(colsStorageKey, JSON.stringify(visibleCols));
  }, [visibleCols, colsStorageKey]);

  useEffect(() => {
    if (!showColMenu) return;
    const handler = (e: MouseEvent) => {
      if (colMenuRef.current && !colMenuRef.current.contains(e.target as Node)) setShowColMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showColMenu]);

  const colecoes = useMemo(() => [...new Set(rows.map((r: any) => r.colecao).filter(Boolean))].sort((a, b) => String(b).localeCompare(String(a), "pt-BR", { numeric: true })), [rows]);

  const filtered = useMemo(() => {
    let r = rows;
    if (colecaoAtiva) r = r.filter((x: any) => x.colecao === colecaoAtiva);
    Object.entries(fl).forEach(([k,v]) => { if(v) r = r.filter((x:any) => x[k]===v); });
    if(q) { const s=q.toLowerCase(); r = r.filter((x:any) => (x.ref+x.desc+x.tecido+x.fornecedor+x.forn_tecido+x.estilista+x.tab_medidas).toLowerCase().includes(s)); }
    if (sort) {
      const col = COLUMNS.find(c => c.key === sort.key);
      const isNum = col?.type === "number";
      r = [...r].sort((a, b) => {
        const av = a[sort.key] ?? "", bv = b[sort.key] ?? "";
        if (isNum) {
          const an = parseFloat(av) || 0, bn = parseFloat(bv) || 0;
          return sort.dir === "asc" ? an - bn : bn - an;
        }
        const cmp = String(av).localeCompare(String(bv), "pt-BR", { numeric: true, sensitivity: "base" });
        return sort.dir === "asc" ? cmp : -cmp;
      });
    }
    return r;
  }, [rows, fl, q, sort, colecaoAtiva]);

  const upd = async (id:number, k:string, v:string|number) => {
    // Validate unique ref
    if (k === "ref" && v) {
      const dup = rows.find((r:any) => r.ref === v && r.id !== id);
      if (dup) {
        setDupAlert(`Referência "${v}" já existe no produto "${dup.desc}"`);
        setTimeout(() => setDupAlert(null), 4000);
        return; // Don't save
      }
    }

    setRows((p:any[]) => p.map((r:any) => {
      if(r.id!==id) return r;
      const u={...r,[k]:v};
      if(k==="tecido"){const t=(cad._tecidoData||[]).find((t:any)=>t.nome===v);if(t)u.forn_tecido=t.forn;}
      return u;
    }));
    await updateProdutoField(id, k, v);
    if(k==="tecido"){const t=(cad._tecidoData||[]).find((t:any)=>t.nome===v);if(t)await updateProdutoField(id,"forn_tecido",t.forn);}
  };

  const add = async () => {
    const blank: any = {};
    COLUMNS.forEach(c => { if(c.type!=="action") blank[c.key] = ""; });
    blank.status = "DESENVOLVIMENTO";
    // Don't set ref — user must fill it in
    const result = await insertProduto(blank);
    if(result) {
      const newRow = { ...blank, id: result.id, ref: result.ref || "" };
      setRows((p:any) => [...p, newRow]);
    }
  };

  const del = async (id:number) => {
    if (!confirm("Excluir este SKU?")) return;
    setRows((p:any[]) => p.filter((r:any) => r.id!==id));
    await deleteProduto(id);
  };

  const opts = (k:string):string[] => cad[k] || [];
  const uv = (k:string):string[] => [...new Set(rows.map((r:any)=>r[k]).filter(Boolean))].sort();
  const sf2 = (k:string,v:string) => setFl(p=>{const n={...p};if(v)n[k]=v;else delete n[k];return n;});

  return (
    <div>
      {/* Banner modo visualização ou compras */}
      {(readOnly || permPrefix) && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(0,122,255,0.06)", border: "1px solid rgba(0,122,255,0.18)", borderRadius: 10, padding: "10px 16px", marginBottom: 16, fontSize: 13, color: "var(--system-blue)", fontWeight: 500 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          {readOnly
            ? <>Modo visualização — edição disponível apenas em <strong style={{ marginLeft: 4 }}>Estilo › Desenvolvimento</strong></>
            : <>Seção Compras — campos editáveis conforme permissões atribuídas</>}
        </div>
      )}
      {/* Seletor de coleção */}
      {colecoes.length > 0 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--label-tertiary)] mr-1">Coleção</span>
          <button
            onClick={() => setColecaoAtiva(null)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all border ${colecaoAtiva === null ? "bg-[var(--label-primary)] text-[var(--bg-primary)] border-[var(--label-primary)]" : "bg-transparent text-[var(--label-secondary)] border-[var(--separator)] hover:border-[var(--label-tertiary)]"}`}
          >
            Todas
          </button>
          {colecoes.map((col: string) => (
            <button
              key={col}
              onClick={() => setColecaoAtiva(col === colecaoAtiva ? null : col)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all border ${colecaoAtiva === col ? "bg-[var(--system-blue)] text-white border-[var(--system-blue)]" : "bg-transparent text-[var(--label-secondary)] border-[var(--separator)] hover:border-[var(--system-blue)] hover:text-[var(--system-blue)]"}`}
            >
              {col}
            </button>
          ))}
        </div>
      )}

      {/* Duplicate ref alert */}
      {dupAlert && (
        <div className="mb-3 px-4 py-3 rounded-xl bg-[rgba(255,59,48,0.08)] border border-[rgba(255,59,48,0.2)] text-[var(--system-red)] text-[13px] font-medium flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {dupAlert}
        </div>
      )}

      <div className="flex gap-2 mb-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-0 sm:min-w-[240px]">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--label-tertiary)] pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Buscar referência, descrição, tecido, fornecedor..." value={q} onChange={e=>setQ(e.target.value)} className="apple-input w-full !pl-10 pr-3"/>
        </div>
        <button onClick={()=>setSf(!sf)} className={`apple-input flex items-center gap-2 cursor-pointer transition-all ${sf||ac>0?"!border-[var(--system-blue)] !bg-blue-50 text-[var(--system-blue)] font-semibold":""}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>
          Filtros{ac>0&&<span className="bg-[var(--system-blue)] text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">{ac}</span>}
        </button>
        {/* Column visibility toggle */}
        <div className="relative" ref={colMenuRef}>
          <button onClick={()=>setShowColMenu(v=>!v)} className={`apple-input flex items-center gap-2 cursor-pointer transition-all ${showColMenu||hiddenCount>0?"!border-[var(--system-blue)] !bg-blue-50 text-[var(--system-blue)] font-semibold":""}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            Colunas{hiddenCount>0&&<span className="bg-[var(--system-blue)] text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">{hiddenCount}</span>}
          </button>
          {showColMenu&&(
            <div className="absolute top-full left-0 mt-1 z-50 apple-card p-3 shadow-xl" style={{minWidth:260,maxHeight:380,overflowY:"auto"}}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--label-secondary)]">Mostrar colunas</span>
                <div className="flex gap-2">
                  <button onClick={()=>setVisibleCols(Object.fromEntries(toggleableCols.map(c=>[c.key,true])))} className="text-[11px] text-[var(--system-blue)] font-medium">Todas</button>
                  <span className="text-[var(--separator)]">·</span>
                  <button onClick={()=>setVisibleCols(Object.fromEntries(toggleableCols.map(c=>[c.key,false])))} className="text-[11px] text-[var(--label-tertiary)] font-medium">Nenhuma</button>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[var(--bg-secondary)] cursor-not-allowed opacity-60 select-none">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  <span className="text-[12px] text-[var(--label-secondary)]">Referência</span>
                  <span className="ml-auto text-[10px] text-[var(--label-quaternary)]">sempre visível</span>
                </label>
                {toggleableCols.map(c=>(
                  <label key={c.key} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--bg-secondary)] cursor-pointer select-none">
                    <input type="checkbox" checked={isColVisible(c.key)} onChange={()=>toggleCol(c.key)} className="w-3.5 h-3.5 accent-[var(--system-blue)]"/>
                    <span className="text-[12px] text-[var(--label-primary)]">{c.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        {!readOnly && canAdd && <button onClick={add} className="apple-btn-primary">+ Novo SKU</button>}
        {!readOnly && !isAdmin && <span style={{ fontSize: 11, color: "var(--label-tertiary)" }}>Apenas campos com permissão podem ser editados</span>}
      </div>

      {sf&&(<div className="apple-card p-4 mb-4 bg-[var(--bg-secondary)]"><div className="flex items-center justify-between mb-3"><span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--label-secondary)]">Filtrar por</span>{ac>0&&<button onClick={()=>{setFl({});setQ("");}} className="text-[12px] text-[var(--system-blue)] font-medium">Limpar todos</button>}</div><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">{FC.map(c=>(<div key={c.key}><label className="text-[11px] text-[var(--label-secondary)] mb-1 block font-medium">{c.label}</label><select value={fl[c.key]||""} onChange={e=>sf2(c.key,e.target.value)} className={`apple-select w-full text-[12px] py-1.5 ${fl[c.key]?"!border-[var(--system-blue)] !bg-blue-50/60 text-[var(--system-blue)] font-semibold":""}`}><option value="">Todos</option>{uv(c.key).map(v=><option key={v}>{v}</option>)}</select></div>))}</div></div>)}

      {ac>0&&!sf&&(<div className="flex flex-wrap gap-1.5 mb-3">{Object.entries(fl).map(([k,v])=>{if(!v)return null;const c=COLUMNS.find(x=>x.key===k);return(<span key={k} className="inline-flex items-center gap-1 bg-blue-50 text-[var(--system-blue)] rounded-lg px-2.5 py-1 text-[12px] font-medium"><span className="text-blue-300">{c?.label}:</span>{v}<button onClick={()=>sf2(k,"")} className="ml-0.5 text-blue-300 hover:text-[var(--system-blue)]">×</button></span>);})} <button onClick={()=>{setFl({});setQ("");}} className="text-[12px] text-[var(--label-tertiary)] px-2 py-1">Limpar</button></div>)}

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-4"><span className="text-[28px] font-bold tabnum tracking-[-0.03em]">{filtered.length}</span><span className="text-[14px] text-[var(--label-secondary)]">SKU{filtered.length!==1&&"s"}</span>{ac>0&&<span className="text-[12px] text-[var(--label-tertiary)]">de {rows.length}</span>}<span className="text-[11px] text-[var(--label-quaternary)] ml-auto italic hidden sm:inline">duplo-clique para editar · salva automaticamente</span></div>

      <div className="apple-card-scroll"><table className="plm-table" style={{width:"max-content",minWidth:"100%"}}><thead><tr>{COLUMNS.filter(c=>isColVisible(c.key)).flatMap(c=>{
        const sortable = c.type !== "action";
        const isActive = sort?.key === c.key;
        const isSticky = c.key === "ref";
        const mainTh = (
          <th key={c.key} style={{width:c.width,minWidth:c.width,textAlign:c.type==="number"?"right":"left",...(isSticky?{position:"sticky",left:0,zIndex:3,background:"var(--bg-primary)",boxShadow:"2px 0 4px rgba(0,0,0,0.06)"}:{})}}>
            {sortable ? (
              <button onClick={() => toggleSort(c.key)} className={`inline-flex items-center gap-1 select-none cursor-pointer hover:text-[var(--label-primary)] transition-colors ${isActive ? "text-[var(--system-blue)]" : ""}`}>
                <span>{c.label}</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={isActive ? "opacity-100" : "opacity-30"}>
                  {isActive && sort?.dir === "desc" ? <path d="M6 9l6 6 6-6"/> : <path d="M18 15l-6-6-6 6"/>}
                </svg>
              </button>
            ) : c.label}
          </th>
        );
        if (c.key === "ref" && permPrefix === "compras_") {
          return [mainTh, ...COMPRAS_STATUS_COLS.filter(sc => isColVisible(sc.key)).map(sc => (
            <th key={sc.key} style={{width:sc.width,minWidth:sc.width}}>
              <button onClick={() => toggleSort(sc.key)} className={`inline-flex items-center gap-1 select-none cursor-pointer hover:text-[var(--label-primary)] transition-colors ${sort?.key===sc.key?"text-[var(--system-blue)]":""}`}>
                <span>{sc.label}</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={sort?.key===sc.key?"opacity-100":"opacity-30"}>
                  {sort?.key===sc.key&&sort?.dir==="desc"?<path d="M6 9l6 6 6-6"/>:<path d="M18 15l-6-6-6 6"/>}
                </svg>
              </button>
            </th>
          ))];
        }
        return [mainTh];
      })}
      {permPrefix === "compras_" && PRICE_COLS.filter(c => isColVisible(c.key)).map(c => (
        <th key={c.key} style={{width:c.width,minWidth:c.width,textAlign:"right"}}>
          <span className={c.computed ? "text-[var(--label-tertiary)] italic" : ""}>{c.label}</span>
        </th>
      ))}
      <th style={{width:36}}/></tr></thead><tbody>
        {filtered.map((row:any)=>(<tr key={row.id}>{COLUMNS.filter(c=>isColVisible(c.key)).flatMap(c=>{
          const isSticky = c.key === "ref";
          const mainTd = <td key={c.key} style={{width:c.width,minWidth:c.width,...(isSticky?{position:"sticky",left:0,zIndex:2,background:"var(--bg-primary)",boxShadow:"2px 0 4px rgba(0,0,0,0.04)"}:{})}}>{c.type==="action"?<button onClick={()=>onOpenFicha(row)} className="apple-btn-secondary text-[12px] py-1 px-3">Abrir</button>:c.type==="readonly"?<span className="text-[13px] px-2.5 py-1.5 block text-[var(--label-secondary)]">{c.key==="composicao"?((cad._tecidoData||[]).find((t:any)=>t.nome===row.tecido)?.comp||"—"):row[c.key]||"—"}</span>:readOnly?<span style={{fontSize:13,padding:"6px 10px",display:"block",color:"var(--label-secondary)"}}>{row[c.key]||"—"}</span>:canEdit(c.key)?<InlineCell value={row[c.key]} type={c.type} options={c.cad?opts(c.cad):undefined} isStatus={c.key==="status"} onChange={v=>upd(row.id,c.key,v)}/>:<span style={{fontSize:13,padding:"6px 10px",display:"block",color:"var(--label-tertiary)",cursor:"default"}} title="Sem permissão para editar">{row[c.key]||"—"}</span>}</td>;
          if (c.key === "ref" && permPrefix === "compras_") {
            return [mainTd, ...COMPRAS_STATUS_COLS.filter(sc => isColVisible(sc.key)).map(sc => {
              const sv = row[sc.key] || "";
              const ss = sc.styles[sv];
              const pill = sv ? <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap" style={ss?{background:ss.bg,color:ss.color}:{background:"rgba(142,142,147,0.12)",color:"var(--label-tertiary)"}}>{sv}</span> : <span className="text-[var(--label-quaternary)] text-[13px] px-2.5">—</span>;
              return <td key={sc.key} style={{width:sc.width,minWidth:sc.width}}>
                {canEdit(sc.key)
                  ? <InlineCell value={sv} type="select" options={sc.opts} displayEl={pill} onChange={v=>upd(row.id,sc.key,String(v))}/>
                  : <div className="px-1 py-0.5">{pill}</div>}
              </td>;
            })];
          }
          return [mainTd];
        })}
        {permPrefix === "compras_" && PRICE_COLS.filter(c => isColVisible(c.key)).map(c => {
          const isMult = MULT_KEYS.has(c.key);
          if (c.computed) {
            const val = getPriceVal(c.key, row);
            return <td key={c.key} style={{width:c.width,minWidth:c.width,textAlign:"right"}}><span className="text-[13px] px-2.5 py-1.5 block text-[var(--label-tertiary)] italic tabnum">{fmtBRL(val,isMult)}</span></td>;
          }
          const rawVal = row[c.key];
          const canEditPrice = isAdmin || perms["compras_precos"] === true;
          const dispFn = isMult
            ? (v: number) => v.toFixed(2).replace(".", ",") + "×"
            : (v: number) => "R$ " + v.toFixed(2).replace(".", ",");
          return <td key={c.key} style={{width:c.width,minWidth:c.width,textAlign:"right"}}>
            {canEditPrice
              ? <InlineCell value={rawVal ?? ""} type="number" displayFn={dispFn} onChange={v => upd(row.id, c.key, v)} />
              : <span className="text-[13px] px-2.5 py-1.5 block tabnum">{fmtBRL(rawVal != null && rawVal !== "" ? Number(rawVal) : null, isMult)}</span>
            }
          </td>;
        })}
        <td className="text-center">{!readOnly&&canDelete&&<button onClick={()=>del(row.id)} className="text-[var(--label-quaternary)] hover:text-[var(--system-red)] rounded-lg w-7 h-7 inline-flex items-center justify-center transition-colors"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>}</td></tr>))}
        {filtered.length===0&&<tr><td colSpan={COLUMNS.length+1} className="py-16 text-center text-[var(--label-tertiary)] text-[14px]">Nenhum item encontrado</td></tr>}
      </tbody></table></div>
    </div>
  );
}
