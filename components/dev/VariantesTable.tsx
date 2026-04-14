"use client";
import { useState, useMemo } from "react";
import { getVariantes } from "@/lib/sample-data";

const VC=[{key:"ref",label:"Referência",w:120},{key:"desc",label:"Descrição",w:260},{key:"cor",label:"Cor",w:180},{key:"tecido",label:"Tecido",w:200},{key:"forn_tecido",label:"Forn. tecido",w:140},{key:"status",label:"Status",w:180},{key:"fornecedor",label:"Fornecedor",w:140},{key:"grupo",label:"Grupo",w:120},{key:"subgrupo",label:"Subgrupo",w:200},{key:"_ficha",label:"Ficha",w:70}];
const FK=["grupo","subgrupo","status","tecido","fornecedor","cor","estilista","linha"];
const FL:Record<string,string>={grupo:"Grupo",subgrupo:"Subgrupo",status:"Status",tecido:"Tecido",fornecedor:"Fornecedor",cor:"Cor",estilista:"Estilista",linha:"Linha"};
const SP:Record<string,string>={"MOSTRUÁRIO LIBERADO":"pill-green","PRODUÇÃO LIBERADA":"pill-blue","DESENVOLVIMENTO":"pill-orange","CANCELADO":"pill-red"};

type Props={rows:any[];onOpenFicha:(r:any)=>void};

export default function VariantesTable({rows,onOpenFicha}:Props){
  const [q,setQ]=useState("");const [fl,setFl]=useState<Record<string,string>>({});const [sf,setSf]=useState(false);
  const ac=Object.values(fl).filter(Boolean).length;

  const vr=useMemo(()=>{const v=getVariantes(rows);const o:any[]=[];rows.forEach((p:any)=>{const c=v[p.ref]||[];if(!c.length)o.push({...p,cor:"—",_vid:`${p.ref}-`});else c.forEach(x=>o.push({...p,cor:x,_vid:`${p.ref}-${x}`}));});return o;},[rows]);

  const filtered=useMemo(()=>{let r=vr;Object.entries(fl).forEach(([k,v])=>{if(v)r=r.filter(x=>x[k]===v);});if(q){const s=q.toLowerCase();r=r.filter(x=>(x.ref+x.desc+x.cor+x.tecido+x.fornecedor).toLowerCase().includes(s));}return r;},[vr,fl,q]);

  const uv=(k:string):string[]=>[...new Set(vr.map(r=>r[k]).filter(Boolean))].sort();
  const sf2=(k:string,v:string)=>setFl(p=>{const n={...p};if(v)n[k]=v;else delete n[k];return n;});

  return(
    <div>
      <div className="flex gap-2 mb-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[240px]">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--label-tertiary)] pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Buscar referência, cor, tecido..." value={q} onChange={e=>setQ(e.target.value)} className="apple-input w-full pl-10"/>
        </div>
        <button onClick={()=>setSf(!sf)} className={`apple-input flex items-center gap-2 cursor-pointer ${sf||ac>0?"!border-[var(--system-blue)] !bg-blue-50 text-[var(--system-blue)] font-semibold":""}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>Filtros
          {ac>0&&<span className="bg-[var(--system-blue)] text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">{ac}</span>}
        </button>
      </div>
      {sf&&(<div className="apple-card p-4 mb-4 bg-[var(--bg-secondary)]"><div className="flex items-center justify-between mb-3"><span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--label-secondary)]">Filtrar por</span>{ac>0&&<button onClick={()=>{setFl({});setQ("");}} className="text-[12px] text-[var(--system-blue)] font-medium">Limpar</button>}</div><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">{FK.map(k=>(<div key={k}><label className="text-[11px] text-[var(--label-secondary)] mb-1 block font-medium">{FL[k]}</label><select value={fl[k]||""} onChange={e=>sf2(k,e.target.value)} className={`apple-select w-full text-[12px] py-1.5 ${fl[k]?"!border-[var(--system-blue)] !bg-blue-50/60 text-[var(--system-blue)] font-semibold":""}`}><option value="">Todos</option>{uv(k).map(v=><option key={v}>{v}</option>)}</select></div>))}</div></div>)}
      {ac>0&&!sf&&(<div className="flex flex-wrap gap-1.5 mb-3">{Object.entries(fl).map(([k,v])=>{if(!v)return null;return(<span key={k} className="inline-flex items-center gap-1 bg-blue-50 text-[var(--system-blue)] rounded-lg px-2.5 py-1 text-[12px] font-medium"><span className="text-blue-300">{FL[k]}:</span>{v}<button onClick={()=>sf2(k,"")} className="ml-0.5 text-blue-300">×</button></span>);})}<button onClick={()=>{setFl({});setQ("");}} className="text-[12px] text-[var(--label-tertiary)] px-2">Limpar</button></div>)}

      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-[28px] font-bold tabnum tracking-[-0.03em]">{filtered.length}</span>
        <span className="text-[14px] text-[var(--label-secondary)]">variante{filtered.length!==1&&"s"}</span>
        {ac>0&&<span className="text-[12px] text-[var(--label-tertiary)]">de {vr.length}</span>}
        <span className="text-[11px] text-[var(--label-quaternary)] ml-auto">Cores da ficha técnica</span>
      </div>

      <div className="apple-card overflow-x-auto">
        <table className="plm-table" style={{width:"max-content",minWidth:"100%"}}>
          <thead><tr>{VC.map(c=><th key={c.key} style={{width:c.w,minWidth:c.w}}>{c.label}</th>)}</tr></thead>
          <tbody>{filtered.map((r:any)=>(<tr key={r._vid}>{VC.map(c=>(<td key={c.key} style={{width:c.w,minWidth:c.w}}>
            {c.key==="_ficha"?<button onClick={()=>onOpenFicha(r)} className="apple-btn-secondary text-[12px] py-1 px-3">Abrir</button>
            :c.key==="status"&&SP[r.status]?<span className={`pill ${SP[r.status]}`}>{r.status}</span>
            :c.key==="cor"&&r.cor!=="—"?<span className="inline-flex items-center bg-[var(--bg-secondary)] rounded-md px-2.5 py-1 text-[13px] font-medium">{r.cor}</span>
            :<span className={`text-[13px] px-2.5 py-1 block ${r[c.key]?"":"text-[var(--label-quaternary)]"}`}>{r[c.key]||"—"}</span>}
          </td>))}</tr>))}
          {filtered.length===0&&<tr><td colSpan={VC.length} className="py-16 text-center text-[var(--label-tertiary)]">Nenhuma variante</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
