"use client";

import { useState, useMemo } from "react";
import { getVariantes } from "@/lib/sample-data";

const VCOLS=[{key:"ref",label:"Referência",w:120},{key:"desc",label:"Descrição",w:260},{key:"cor",label:"Cor",w:180},{key:"tecido",label:"Tecido",w:200},{key:"forn_tecido",label:"Forn. tecido",w:140},{key:"status",label:"Status",w:180},{key:"fornecedor",label:"Fornecedor",w:140},{key:"grupo",label:"Grupo",w:120},{key:"subgrupo",label:"Subgrupo",w:200},{key:"_ficha",label:"Ficha",w:70}];
const FKEYS=["grupo","subgrupo","status","tecido","fornecedor","colecao","operacao","linha","estilista","cor"];
const FLAB:Record<string,string>={grupo:"Grupo",subgrupo:"Subgrupo",status:"Status",tecido:"Tecido",fornecedor:"Fornecedor",colecao:"Coleção",operacao:"Operação",linha:"Linha",estilista:"Estilista",cor:"Cor"};
const SP:Record<string,string>={"MOSTRUÁRIO LIBERADO":"bg-emerald-50 text-emerald-700","PRODUÇÃO LIBERADA":"bg-blue-50 text-blue-700","DESENVOLVIMENTO":"bg-amber-50 text-amber-700","CANCELADO":"bg-red-50 text-red-700"};

type Props={rows:any[];onOpenFicha:(row:any)=>void};

export default function VariantesTable({rows,onOpenFicha}:Props){
  const [query,setQuery]=useState("");
  const [filters,setFilters]=useState<Record<string,string>>({});
  const [showFilters,setShowFilters]=useState(false);
  const ac=Object.values(filters).filter(Boolean).length;

  const vRows=useMemo(()=>{
    const v=getVariantes(rows);const out:any[]=[];
    rows.forEach((p:any)=>{const cores=v[p.ref]||[];if(cores.length===0)out.push({...p,cor:"—",_vid:`${p.ref}-none`});else cores.forEach(c=>out.push({...p,cor:c,_vid:`${p.ref}-${c}`}));});
    return out;
  },[rows]);

  const filtered=useMemo(()=>{
    let r=vRows;
    Object.entries(filters).forEach(([k,v])=>{if(v)r=r.filter(x=>x[k]===v);});
    if(query){const q=query.toLowerCase();r=r.filter(x=>(x.ref+x.desc+x.cor+x.tecido+x.fornecedor+x.forn_tecido+x.estilista).toLowerCase().includes(q));}
    return r;
  },[vRows,filters,query]);

  const uv=(k:string):string[]=>[...new Set(vRows.map(r=>r[k]).filter(Boolean))].sort();
  const sf=(k:string,v:string)=>setFilters(p=>{const n={...p};if(v)n[k]=v;else delete n[k];return n;});
  const ca=()=>{setFilters({});setQuery("");};

  return(
    <div>
      <div className="flex gap-2 mb-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[220px]"><svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="text" placeholder="Buscar referência, cor, tecido..." value={query} onChange={e=>setQuery(e.target.value)} className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white outline-none"/></div>
        <button onClick={()=>setShowFilters(!showFilters)} className={`text-sm px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 ${showFilters||ac>0?"border-[#007AFF] bg-blue-50 text-[#007AFF] font-semibold":"border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>Filtros{ac>0&&<span className="bg-[#007AFF] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{ac}</span>}</button>
      </div>
      {showFilters&&(<div className="border border-gray-200 rounded-2xl bg-gray-50/50 p-4 mb-4"><div className="flex items-center justify-between mb-3"><span className="text-[10px] font-bold uppercase tracking-[0.06em] text-gray-400">Filtrar por</span>{ac>0&&<button onClick={ca} className="text-[12px] text-[#007AFF] hover:underline">Limpar todos</button>}</div><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">{FKEYS.map(k=>(<div key={k}><label className="text-[11px] text-gray-500 mb-0.5 block">{FLAB[k]}</label><select value={filters[k]||""} onChange={e=>sf(k,e.target.value)} className={`w-full text-[13px] px-2.5 py-2 rounded-lg border outline-none cursor-pointer ${filters[k]?"border-[#007AFF] bg-blue-50/50 text-[#007AFF] font-medium":"border-gray-200 bg-white text-gray-700"}`}><option value="">Todos</option>{uv(k).map(v=><option key={v} value={v}>{v}</option>)}</select></div>))}</div></div>)}
      {ac>0&&!showFilters&&(<div className="flex flex-wrap gap-1.5 mb-3">{Object.entries(filters).map(([k,v])=>{if(!v)return null;return(<span key={k} className="inline-flex items-center gap-1.5 bg-blue-50 text-[#007AFF] rounded-lg px-2.5 py-1 text-[12px] font-medium"><span className="text-blue-400">{FLAB[k]}:</span>{v}<button onClick={()=>sf(k,"")} className="hover:bg-blue-100 rounded w-4 h-4 inline-flex items-center justify-center text-blue-400">×</button></span>);})}<button onClick={ca} className="text-[12px] text-gray-400 px-2 py-1">Limpar todos</button></div>)}
      <div className="flex items-baseline gap-3 mb-4 pl-1"><span className="text-3xl font-bold tabular-nums tracking-tight">{filtered.length}</span><span className="text-sm text-gray-500">variante{filtered.length!==1&&"s"}</span>{ac>0&&<span className="text-xs text-gray-400">de {vRows.length} total</span>}<span className="text-xs text-gray-400 ml-auto">Cores cadastradas na ficha técnica</span></div>
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white"><table className="plm-table" style={{width:"max-content",minWidth:"100%"}}><thead><tr>{VCOLS.map(c=><th key={c.key} style={{width:c.w,minWidth:c.w}}>{c.label}</th>)}</tr></thead><tbody>
        {filtered.map((row:any)=>(<tr key={row._vid}>{VCOLS.map(c=>(<td key={c.key} style={{width:c.w,minWidth:c.w}}>{c.key==="_ficha"?<button onClick={()=>onOpenFicha(row)} className="text-xs font-semibold text-[#007AFF] bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg">Abrir</button>:c.key==="status"&&SP[row.status]?<span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${SP[row.status]}`}>{row.status}</span>:c.key==="cor"&&row.cor!=="—"?<span className="inline-flex items-center bg-gray-100 rounded-lg px-2.5 py-1 text-[13px] font-medium">{row.cor}</span>:<span className={`text-[13px] px-2 py-1 ${row[c.key]?"text-gray-900":"text-gray-300"}`}>{row[c.key]||"—"}</span>}</td>))}</tr>))}
        {filtered.length===0&&<tr><td colSpan={VCOLS.length} className="py-12 text-center text-gray-400 text-sm">Nenhuma variante</td></tr>}
      </tbody></table></div>
    </div>
  );
}
