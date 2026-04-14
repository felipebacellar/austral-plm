"use client";
import { useState, useMemo } from "react";
import InlineCell from "@/components/ui/InlineCell";
import COLUMNS from "@/lib/columns";
import { SAMPLE_CAD } from "@/lib/sample-data";

type Props = { rows: any[]; setRows: (fn: any) => void; onOpenFicha: (row: any) => void };
const FC = COLUMNS.filter(c => c.type === "select" && c.cad);

export default function DevTable({ rows, setRows, onOpenFicha }: Props) {
  const [cad] = useState(SAMPLE_CAD);
  const [q, setQ] = useState("");
  const [fl, setFl] = useState<Record<string,string>>({});
  const [sf, setSf] = useState(false);
  const ac = Object.values(fl).filter(Boolean).length;

  const filtered = useMemo(() => {
    let r = rows;
    Object.entries(fl).forEach(([k,v]) => { if(v) r = r.filter((x:any) => x[k]===v); });
    if(q) { const s=q.toLowerCase(); r = r.filter((x:any) => (x.ref+x.desc+x.tecido+x.fornecedor+x.forn_tecido+x.estilista+x.tab_medidas+x.lavagem).toLowerCase().includes(s)); }
    return r;
  }, [rows, fl, q]);

  const upd = (id:number, k:string, v:string|number) => setRows((p:any[]) => p.map((r:any) => {
    if(r.id!==id) return r; const u={...r,[k]:v};
    if(k==="tecido"){const t=cad.tecido?.find((t:any)=>t.nome===v);if(t)u.forn_tecido=t.forn;} return u;
  }));
  const add = () => { const n=Math.max(0,...rows.map((r:any)=>r.id))+1; const b:any={id:n,ficha:null}; COLUMNS.forEach(c=>{if(c.type!=="action")b[c.key]=c.type==="number"?0:"";}); setRows((p:any)=>[...p,b]); };
  const del = (id:number) => setRows((p:any[]) => p.filter((r:any) => r.id!==id));
  const opts = (k:string):string[] => k==="tecido"?(cad.tecido||[]).map((t:any)=>t.nome):cad[k]||[];
  const uv = (k:string):string[] => [...new Set(rows.map((r:any)=>r[k]).filter(Boolean))].sort();
  const sf2 = (k:string,v:string) => setFl(p=>{const n={...p};if(v)n[k]=v;else delete n[k];return n;});

  return (
    <div>
      {/* Toolbar */}
      <div className="flex gap-2 mb-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[240px]">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--label-tertiary)] pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Buscar referência, descrição, tecido, fornecedor..." value={q} onChange={e=>setQ(e.target.value)} className="apple-input w-full pl-10 pr-3"/>
        </div>
        <button onClick={()=>setSf(!sf)} className={`apple-input flex items-center gap-2 cursor-pointer transition-all ${sf||ac>0?"!border-[var(--system-blue)] !bg-blue-50 text-[var(--system-blue)] font-semibold":""}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>
          Filtros
          {ac>0&&<span className="bg-[var(--system-blue)] text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">{ac}</span>}
        </button>
        <button onClick={add} className="apple-btn-primary">+ Novo SKU</button>
      </div>

      {/* Filter panel */}
      {sf&&(
        <div className="apple-card p-4 mb-4 bg-[var(--bg-secondary)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--label-secondary)]">Filtrar por</span>
            {ac>0&&<button onClick={()=>{setFl({});setQ("");}} className="text-[12px] text-[var(--system-blue)] font-medium">Limpar todos</button>}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {FC.map(c=>(<div key={c.key}>
              <label className="text-[11px] text-[var(--label-secondary)] mb-1 block font-medium">{c.label}</label>
              <select value={fl[c.key]||""} onChange={e=>sf2(c.key,e.target.value)} className={`apple-select w-full text-[12px] py-1.5 ${fl[c.key]?"!border-[var(--system-blue)] !bg-blue-50/60 text-[var(--system-blue)] font-semibold":""}`}>
                <option value="">Todos</option>{uv(c.key).map(v=><option key={v}>{v}</option>)}
              </select>
            </div>))}
          </div>
        </div>
      )}

      {/* Active chips */}
      {ac>0&&!sf&&(
        <div className="flex flex-wrap gap-1.5 mb-3">
          {Object.entries(fl).map(([k,v])=>{if(!v)return null;const c=COLUMNS.find(x=>x.key===k);return(
            <span key={k} className="inline-flex items-center gap-1 bg-blue-50 text-[var(--system-blue)] rounded-lg px-2.5 py-1 text-[12px] font-medium">
              <span className="text-blue-300">{c?.label}:</span>{v}
              <button onClick={()=>sf2(k,"")} className="ml-0.5 text-blue-300 hover:text-[var(--system-blue)]">×</button>
            </span>);})}
          <button onClick={()=>{setFl({});setQ("");}} className="text-[12px] text-[var(--label-tertiary)] px-2 py-1">Limpar</button>
        </div>
      )}

      {/* Count */}
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-[28px] font-bold tabnum tracking-[-0.03em]">{filtered.length}</span>
        <span className="text-[14px] text-[var(--label-secondary)]">SKU{filtered.length!==1&&"s"}</span>
        {ac>0&&<span className="text-[12px] text-[var(--label-tertiary)]">de {rows.length}</span>}
        <span className="text-[11px] text-[var(--label-quaternary)] ml-auto italic">duplo-clique para editar</span>
      </div>

      {/* Table */}
      <div className="apple-card overflow-x-auto">
        <table className="plm-table" style={{width:"max-content",minWidth:"100%"}}>
          <thead><tr>{COLUMNS.map(c=><th key={c.key} style={{width:c.width,minWidth:c.width,textAlign:c.type==="number"?"right":"left"}}>{c.label}</th>)}<th style={{width:36}}/></tr></thead>
          <tbody>
            {filtered.map((row:any)=>(
              <tr key={row.id}>
                {COLUMNS.map(c=><td key={c.key} style={{width:c.width,minWidth:c.width}}>
                  {c.type==="action"?<button onClick={()=>onOpenFicha(row)} className="apple-btn-secondary text-[12px] py-1 px-3">Abrir</button>
                  :<InlineCell value={row[c.key]} type={c.type} options={c.cad?opts(c.cad):undefined} isStatus={c.key==="status"} onChange={v=>upd(row.id,c.key,v)}/>}
                </td>)}
                <td className="text-center"><button onClick={()=>del(row.id)} className="text-[var(--label-quaternary)] hover:text-[var(--system-red)] rounded-lg w-7 h-7 inline-flex items-center justify-center transition-colors"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></td>
              </tr>
            ))}
            {filtered.length===0&&<tr><td colSpan={COLUMNS.length+1} className="py-16 text-center text-[var(--label-tertiary)] text-[14px]">Nenhum item encontrado</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
