"use client";

import { useState, useMemo } from "react";
import InlineCell from "@/components/ui/InlineCell";
import COLUMNS from "@/lib/columns";
import { SAMPLE_CAD } from "@/lib/sample-data";

type Props = { rows: any[]; setRows: (fn: any) => void; onOpenFicha: (row: any) => void };
const FILTER_COLS = COLUMNS.filter(c => c.type === "select" && c.cad);

export default function DevTable({ rows, setRows, onOpenFicha }: Props) {
  const [cad] = useState(SAMPLE_CAD);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const filtered = useMemo(() => {
    let r = rows;
    Object.entries(filters).forEach(([key, val]) => { if (val) r = r.filter((x: any) => x[key] === val); });
    if (query) { const q = query.toLowerCase(); r = r.filter((x: any) => (x.ref+x.desc+x.tecido+x.fornecedor+x.forn_tecido+x.estilista+x.tab_medidas+x.lavagem).toLowerCase().includes(q)); }
    return r;
  }, [rows, filters, query]);

  const updateCell = (id: number, key: string, val: string | number) => {
    setRows((prev: any[]) => prev.map((r: any) => {
      if (r.id !== id) return r;
      const u = { ...r, [key]: val };
      if (key === "tecido") { const t = cad.tecido?.find((t: any) => t.nome === val); if (t) u.forn_tecido = t.forn; }
      return u;
    }));
  };
  const addRow = () => {
    const nid = Math.max(0, ...rows.map((r: any) => r.id)) + 1;
    const b: any = { id: nid, ficha: null };
    COLUMNS.forEach(c => { if (c.type !== "action") b[c.key] = c.type === "number" ? 0 : ""; });
    setRows((prev: any) => [...prev, b]);
  };
  const deleteRow = (id: number) => setRows((prev: any[]) => prev.filter((r: any) => r.id !== id));
  const getOptions = (cadKey: string): string[] => {
    if (cadKey === "tecido") return (cad.tecido || []).map((t: any) => t.nome);
    return cad[cadKey] || [];
  };
  const getUniqueVals = (key: string): string[] => [...new Set(rows.map((r: any) => r[key]).filter(Boolean))].sort();
  const setFilter = (key: string, val: string) => setFilters(prev => { const n = { ...prev }; if (val) n[key] = val; else delete n[key]; return n; });
  const clearAll = () => { setFilters({}); setQuery(""); };

  return (
    <div>
      <div className="flex gap-2 mb-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[220px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Buscar referência, descrição, tecido, fornecedor..." value={query} onChange={e=>setQuery(e.target.value)} className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white outline-none"/>
        </div>
        <button onClick={()=>setShowFilters(!showFilters)} className={`text-sm px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 ${showFilters||activeFilterCount>0?"border-[#007AFF] bg-blue-50 text-[#007AFF] font-semibold":"border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>
          Filtros{activeFilterCount>0&&<span className="bg-[#007AFF] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{activeFilterCount}</span>}
        </button>
        <button onClick={addRow} className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-[#007AFF] text-white hover:opacity-90">+ Novo SKU</button>
      </div>
      {showFilters&&(
        <div className="border border-gray-200 rounded-2xl bg-gray-50/50 p-4 mb-4">
          <div className="flex items-center justify-between mb-3"><span className="text-[10px] font-bold uppercase tracking-[0.06em] text-gray-400">Filtrar por</span>{activeFilterCount>0&&<button onClick={clearAll} className="text-[12px] text-[#007AFF] hover:underline">Limpar todos</button>}</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {FILTER_COLS.map(col=>(<div key={col.key}><label className="text-[11px] text-gray-500 mb-0.5 block">{col.label}</label><select value={filters[col.key]||""} onChange={e=>setFilter(col.key,e.target.value)} className={`w-full text-[13px] px-2.5 py-2 rounded-lg border outline-none cursor-pointer ${filters[col.key]?"border-[#007AFF] bg-blue-50/50 text-[#007AFF] font-medium":"border-gray-200 bg-white text-gray-700"}`}><option value="">Todos</option>{getUniqueVals(col.key).map(v=><option key={v} value={v}>{v}</option>)}</select></div>))}
          </div>
        </div>
      )}
      {activeFilterCount>0&&!showFilters&&(
        <div className="flex flex-wrap gap-1.5 mb-3">
          {Object.entries(filters).map(([key,val])=>{if(!val)return null;const col=COLUMNS.find(c=>c.key===key);return(<span key={key} className="inline-flex items-center gap-1.5 bg-blue-50 text-[#007AFF] rounded-lg px-2.5 py-1 text-[12px] font-medium"><span className="text-blue-400">{col?.label}:</span> {val}<button onClick={()=>setFilter(key,"")} className="hover:bg-blue-100 rounded w-4 h-4 inline-flex items-center justify-center text-blue-400">×</button></span>);})}
          <button onClick={clearAll} className="text-[12px] text-gray-400 hover:text-gray-600 px-2 py-1">Limpar todos</button>
        </div>
      )}
      <div className="flex items-baseline gap-3 mb-4 pl-1">
        <span className="text-3xl font-bold tabular-nums tracking-tight">{filtered.length}</span>
        <span className="text-sm text-gray-500">SKU{filtered.length!==1&&"s"}</span>
        {activeFilterCount>0&&<span className="text-xs text-gray-400">de {rows.length} total</span>}
        <span className="text-xs text-gray-400 ml-auto italic">duplo-clique para editar</span>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="plm-table" style={{width:"max-content",minWidth:"100%"}}>
          <thead><tr>{COLUMNS.map(c=><th key={c.key} style={{width:c.width,minWidth:c.width,textAlign:c.type==="number"?"right":"left"}}>{c.label}</th>)}<th style={{width:36}}/></tr></thead>
          <tbody>
            {filtered.map((row:any)=>(
              <tr key={row.id}>
                {COLUMNS.map(c=><td key={c.key} style={{width:c.width,minWidth:c.width}}>
                  {c.type==="action"?<button onClick={()=>onOpenFicha(row)} className="text-xs font-semibold text-[#007AFF] bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors">Abrir</button>
                  :<InlineCell value={row[c.key]} type={c.type} options={c.cad?getOptions(c.cad):undefined} isStatus={c.key==="status"} onChange={v=>updateCell(row.id,c.key,v)}/>}
                </td>)}
                <td className="text-center"><button onClick={()=>deleteRow(row.id)} title="Remover" className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg w-7 h-7 inline-flex items-center justify-center transition-all"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></td>
              </tr>
            ))}
            {filtered.length===0&&<tr><td colSpan={COLUMNS.length+1} className="py-12 text-center text-gray-400 text-sm">Nenhum item encontrado</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
