"use client";
import { useState, useRef } from "react";
import { uploadImage } from "@/lib/storage";
import { TABELA_PONTOS } from "@/lib/tabela-pontos";
import { SAMPLE_CAD } from "@/lib/sample-data";

// Graduação data (sample — later from Supabase)
const GRAD_DATA: Record<string, any[]> = {
  "CALÇA JOGGER":[{desc:"CINTURA",pp:"39",p:"41",m:"43",g:"45.5",gg:"48",a1:"2",a2:"2.5",tol:"1 + OU -"},{desc:"QUADRIL",pp:"50",p:"52",m:"54",g:"56.5",gg:"59",a1:"2",a2:"2.5",tol:"1 + OU -"},{desc:"COXA",pp:"30",p:"31",m:"32",g:"33",gg:"34",a1:"1",a2:"1",tol:"1 + OU -"},{desc:"JOELHO",pp:"21.6",p:"22.3",m:"23",g:"23.7",gg:"24.4",a1:"0.7",a2:"0.7",tol:"0,5 + OU -"},{desc:"BARRA",pp:"17",p:"17.5",m:"18",g:"18.5",gg:"19",a1:"0.5",a2:"0.5",tol:"0,5 + OU -"},{desc:"GANCHO DIANT.",pp:"28",p:"29",m:"30",g:"30.5",gg:"31",a1:"1",a2:"0.5",tol:"0,5 + OU -"},{desc:"GANCHO TRAS.",pp:"38",p:"39",m:"40",g:"40.5",gg:"41",a1:"1",a2:"0.5",tol:"0,5 + OU -"},{desc:"ENTREPERNAS",pp:"80",p:"80",m:"80",g:"83",gg:"86",a1:"0",a2:"3",tol:"1 + OU -"}],
  "BERMUDA JOGGER":[{desc:"CINTURA",pp:"39",p:"41",m:"43",g:"45.5",gg:"48",a1:"2",a2:"2.5",tol:"1 + OU -"},{desc:"QUADRIL",pp:"51",p:"53",m:"55",g:"57.5",gg:"60",a1:"2",a2:"2.5",tol:"1 + OU -"},{desc:"COXA",pp:"30",p:"31",m:"32",g:"33",gg:"34",a1:"1",a2:"1",tol:"1 + OU -"},{desc:"BARRA",pp:"27",p:"28",m:"29",g:"30",gg:"31",a1:"1",a2:"1",tol:"0,5 + OU -"},{desc:"GANCHO DIANT.",pp:"28",p:"29",m:"30",g:"30.5",gg:"31",a1:"1",a2:"0.5",tol:"0,5 + OU -"},{desc:"GANCHO TRAS.",pp:"38",p:"39",m:"40",g:"40.5",gg:"41",a1:"1",a2:"0.5",tol:"0,5 + OU -"},{desc:"COMP. LATERAL",pp:"45",p:"46",m:"47",g:"48",gg:"49",a1:"1",a2:"1",tol:"0,5 + OU -"}],
};

// Use all table names from cadastro (71 total), show points from TABELA_PONTOS (47 with data)
const ALL_NAMES = SAMPLE_CAD.tab_medidas as string[];

export default function MedidasView(){
  const [sel,setSel]=useState<string|null>(null);
  const [sec,setSec]=useState<"base"|"grad">("base");
  const [im1,setIm1]=useState<string|null>(null);
  const [search,setSearch]=useState("");
  const r1=useRef<HTMLInputElement>(null);

  const pontos = sel ? (TABELA_PONTOS[sel] || []) : [];
  const grad = sel ? (GRAD_DATA[sel] || []) : [];
  const filteredNames = search ? ALL_NAMES.filter(n => n.toLowerCase().includes(search.toLowerCase())) : ALL_NAMES;

  const hi=async(e:any)=>{const file=e.target.files?.[0];if(!file||!sel)return;const url=await uploadImage(file,`medidas/${sel}/modo_de_medir`);if(url)setIm1(url);};

  return(
    <div className="flex gap-8 min-h-[400px]">
      <div className="w-[240px] flex-shrink-0">
        <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--label-secondary)] px-3 mb-2">Tabelas de medidas</div>
        <div className="mb-2 px-1"><input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar tabela..." className="apple-input w-full text-[12px] py-1.5"/></div>
        <nav className="flex flex-col gap-0.5 max-h-[550px] overflow-y-auto">
          {filteredNames.map(n=>{
            const hasPts = !!TABELA_PONTOS[n];
            return(
              <button key={n} onClick={()=>{setSel(n);setSec("base");}} className={`text-left px-3 py-[7px] rounded-lg text-[13px] transition-all flex justify-between items-center gap-2 ${sel===n?"font-semibold bg-[rgba(0,122,255,0.08)] text-[var(--system-blue)]":"text-[var(--label-primary)] hover:bg-[var(--bg-secondary)]"}`}>
                <span className="truncate">{n}</span>
                {hasPts && <span className="text-[10px] text-[var(--label-tertiary)] flex-shrink-0">{TABELA_PONTOS[n].length}pt</span>}
              </button>
            );
          })}
        </nav>
        <p className="text-[10px] text-[var(--label-quaternary)] px-3 mt-2">{filteredNames.length} de {ALL_NAMES.length} tabelas</p>
      </div>
      <div className="flex-1 min-w-0">
        {!sel?<div className="flex items-center justify-center h-full text-[var(--label-tertiary)]">Selecione uma tabela</div>:(
          <div>
            <h3 className="text-[22px] font-bold tracking-[-0.02em] mb-0.5">{sel}</h3>
            <p className="text-[13px] text-[var(--label-tertiary)] mb-4">
              {pontos.length > 0 ? `Base M · ${pontos.length} pontos` : "Tabela sem pontos cadastrados"}
            </p>

            {pontos.length > 0 && (
              <div className="seg-control mb-5">
                <button onClick={()=>setSec("base")} className={`seg-btn ${sec==="base"?"active":""}`}>Tabela base (M)</button>
                <button onClick={()=>setSec("grad")} className={`seg-btn ${sec==="grad"?"active":""}`}>Graduação</button>
              </div>
            )}

            {sec==="base"&&pontos.length>0&&(<div>
              <div className="mb-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--label-secondary)] mb-1.5">Modo de medir</div>
                <div className="border border-dashed border-[var(--separator-opaque)] rounded-xl bg-[var(--bg-secondary)] aspect-[16/9] max-h-[300px] flex items-center justify-center cursor-pointer hover:border-[var(--system-blue)] transition-colors overflow-hidden" onClick={()=>r1.current?.click()}>
                  {im1?<img src={im1} alt="Modo de medir" className="w-full h-full object-contain p-1"/>:<div className="text-center p-3"><svg className="mx-auto mb-1.5 text-[var(--label-quaternary)]" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><p className="text-[12px] text-[var(--label-tertiary)]">Modo de medir</p><p className="text-[10px] text-[var(--label-quaternary)] mt-0.5">Clique para enviar</p></div>}
                </div>
                <input ref={r1} type="file" accept="image/*" className="hidden" onChange={hi}/>
              </div>
              <div className="apple-card overflow-hidden"><table className="plm-table"><thead><tr><th className="text-center w-14">Cód</th><th>Descrição</th><th className="text-center w-20">Tabela (M)</th><th className="text-center w-28">Tolerância</th></tr></thead>
                <tbody>{pontos.map((p:any)=>(<tr key={p.cod}><td className="text-center font-bold text-[var(--label-secondary)] px-3">{p.cod}</td><td className="font-medium px-3">{p.desc}</td><td className="text-center tabnum font-semibold px-3">{p.tabela}</td><td className="text-center text-[12px] text-[var(--label-secondary)] px-3">{p.tol}</td></tr>))}</tbody>
              </table></div>
            </div>)}

            {sec==="base"&&pontos.length===0&&(
              <div className="apple-card p-12 text-center">
                <p className="text-[14px] text-[var(--label-secondary)] font-medium mb-1">Nenhum ponto de medida cadastrado</p>
                <p className="text-[12px] text-[var(--label-tertiary)]">Os pontos serão carregados do banco de dados</p>
              </div>
            )}

            {sec==="grad"&&grad.length>0&&(<div>
              <div className="apple-card overflow-hidden overflow-x-auto"><table className="plm-table">
                <thead><tr>
                  <th>Descrição</th><th className="text-center w-16">PP</th><th className="text-center w-16">P</th>
                  <th className="text-center w-16 !bg-[rgba(0,122,255,0.06)] !text-[var(--system-blue)]">M</th>
                  <th className="text-center w-16">G</th><th className="text-center w-16">GG</th>
                  <th className="text-center w-12" colSpan={2}>Ampl.</th><th className="text-center w-24">Tolerância</th>
                </tr></thead>
                <tbody>{grad.map((p:any,i:number)=>(<tr key={i}>
                  <td className="font-medium px-3">{p.desc}</td>
                  <td className="text-center tabnum px-2">{p.pp}</td><td className="text-center tabnum px-2">{p.p}</td>
                  <td className="text-center tabnum font-bold px-2 bg-[rgba(0,122,255,0.03)]">{p.m}</td>
                  <td className="text-center tabnum px-2">{p.g}</td><td className="text-center tabnum px-2">{p.gg}</td>
                  <td className="text-center tabnum text-[12px] text-[var(--label-secondary)] px-1 border-l border-[var(--separator)]">{p.a1}</td>
                  <td className="text-center tabnum text-[12px] text-[var(--label-secondary)] px-1">{p.a2}</td>
                  <td className="text-center text-[12px] text-[var(--label-secondary)] px-2">{p.tol}</td>
                </tr>))}</tbody>
              </table></div>
              <p className="text-[11px] text-[var(--label-tertiary)] mt-3">Ampliação: diferença entre tamanhos (←M / M→)</p>
            </div>)}

            {sec==="grad"&&grad.length===0&&(
              <div className="apple-card p-12 text-center">
                <p className="text-[14px] text-[var(--label-secondary)] font-medium mb-1">Graduação não disponível</p>
                <p className="text-[12px] text-[var(--label-tertiary)]">Dados de graduação serão carregados do banco</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
