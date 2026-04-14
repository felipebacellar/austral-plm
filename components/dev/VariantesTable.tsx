"use client";

import { useState, useMemo } from "react";
import { SAMPLE_ROWS, getVariantes } from "@/lib/sample-data";

const VCOLS = [
  { key:"ref", label:"Referência", w:120 },
  { key:"desc", label:"Descrição", w:260 },
  { key:"cor", label:"Cor", w:180 },
  { key:"tecido", label:"Tecido", w:200 },
  { key:"forn_tecido", label:"Forn. tecido", w:140 },
  { key:"status", label:"Status", w:180 },
  { key:"fornecedor", label:"Fornecedor", w:140 },
  { key:"grupo", label:"Grupo", w:120 },
  { key:"subgrupo", label:"Subgrupo", w:200 },
  { key:"_ficha", label:"Ficha", w:70 },
];

const SP: Record<string,string> = {"MOSTRUÁRIO LIBERADO":"bg-emerald-50 text-emerald-700","PRODUÇÃO LIBERADA":"bg-blue-50 text-blue-700","DESENVOLVIMENTO":"bg-amber-50 text-amber-700","CANCELADO":"bg-red-50 text-red-700"};

type Props = { onOpenFicha: (row: any) => void };

export default function VariantesTable({ onOpenFicha }: Props) {
  const [query, setQuery] = useState("");
  const [filterGrupo, setFilterGrupo] = useState("");

  const variantRows = useMemo(() => {
    const variantes = getVariantes(SAMPLE_ROWS);
    const rows: any[] = [];
    SAMPLE_ROWS.forEach((prod: any) => {
      const cores = variantes[prod.ref] || [];
      if (cores.length === 0) {
        rows.push({ ...prod, cor: "—", _variantId: `${prod.ref}-none` });
      } else {
        cores.forEach((cor: string) => {
          rows.push({ ...prod, cor, _variantId: `${prod.ref}-${cor}` });
        });
      }
    });
    return rows;
  }, []);

  const filtered = useMemo(() => {
    let r = variantRows;
    if (filterGrupo) r = r.filter(x => x.grupo === filterGrupo);
    if (query) {
      const q = query.toLowerCase();
      r = r.filter(x => (x.ref+x.desc+x.cor+x.tecido+x.fornecedor).toLowerCase().includes(q));
    }
    return r;
  }, [variantRows, filterGrupo, query]);

  const grupos = [...new Set(variantRows.map(r => r.grupo).filter(Boolean))].sort();

  return (
    <div>
      <div className="flex gap-2 mb-5 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Buscar referência, cor, tecido..." value={query} onChange={e=>setQuery(e.target.value)} className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white outline-none"/>
        </div>
        <select value={filterGrupo} onChange={e=>setFilterGrupo(e.target.value)} className="text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-white outline-none cursor-pointer">
          <option value="">Todos os grupos</option>
          {grupos.map(g=><option key={g}>{g}</option>)}
        </select>
      </div>

      <div className="flex items-baseline gap-3 mb-4 pl-1">
        <span className="text-3xl font-bold tabular-nums tracking-tight">{filtered.length}</span>
        <span className="text-sm text-gray-500">variante{filtered.length!==1&&"s"}</span>
        <span className="text-xs text-gray-400 ml-auto">Cores cadastradas na ficha técnica (seção tecidos)</span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="plm-table" style={{width:"max-content",minWidth:"100%"}}>
          <thead><tr>{VCOLS.map(c=><th key={c.key} style={{width:c.w,minWidth:c.w}}>{c.label}</th>)}</tr></thead>
          <tbody>
            {filtered.map((row:any)=>(
              <tr key={row._variantId}>
                {VCOLS.map(c=>(
                  <td key={c.key} style={{width:c.w,minWidth:c.w}}>
                    {c.key==="_ficha"?(
                      <button onClick={()=>onOpenFicha(row)} className="text-xs font-semibold text-[#007AFF] bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors">Abrir</button>
                    ):c.key==="status"&&row.status&&SP[row.status]?(
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${SP[row.status]}`}>{row.status}</span>
                    ):c.key==="cor"&&row.cor!=="—"?(
                      <span className="inline-flex items-center bg-gray-100 rounded-lg px-2.5 py-1 text-[13px] font-medium">{row.cor}</span>
                    ):(
                      <span className={`text-[13px] px-2 py-1 ${row[c.key]?"text-gray-900":"text-gray-300"}`}>{row[c.key]||"—"}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {filtered.length===0&&<tr><td colSpan={VCOLS.length} className="py-12 text-center text-gray-400 text-sm">Nenhuma variante encontrada</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
