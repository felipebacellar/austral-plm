"use client";
import { useState, useRef } from "react";
import { uploadImage } from "@/lib/storage";

const SAMPLE:Record<string,{pontos:any[];grad:any[]}>={
  "CALÇA JOGGER":{pontos:[{cod:"A",desc:"CINTURA",valor:"43",tol:"1,0 + OU -"},{cod:"B",desc:"QUADRIL",valor:"54",tol:"1,0 + OU -"},{cod:"C",desc:"COXA",valor:"32",tol:"1,0 + OU -"},{cod:"D",desc:"JOELHO A 31CM DO GANCHO",valor:"23",tol:"0,5 + OU -"},{cod:"E",desc:"BARRA",valor:"18",tol:"0,5 + OU -"},{cod:"F",desc:"GANCHO DIANT. COM CÓS",valor:"30",tol:"0,5 + OU -"},{cod:"G",desc:"GANCHO TRAS. COM CÓS",valor:"40",tol:"0,5 + OU -"},{cod:"H",desc:"ENTREPERNAS",valor:"80",tol:"1,0 + OU -"}],grad:[{desc:"CINTURA",pp:"39",p:"41",m:"43",g:"45.5",gg:"48",a1:"2",a2:"2.5",tol:"1 + OU -"},{desc:"QUADRIL",pp:"50",p:"52",m:"54",g:"56.5",gg:"59",a1:"2",a2:"2.5",tol:"1 + OU -"},{desc:"COXA",pp:"30",p:"31",m:"32",g:"33",gg:"34",a1:"1",a2:"1",tol:"1 + OU -"},{desc:"JOELHO",pp:"21.6",p:"22.3",m:"23",g:"23.7",gg:"24.4",a1:"0.7",a2:"0.7",tol:"0,5 + OU -"},{desc:"BARRA",pp:"17",p:"17.5",m:"18",g:"18.5",gg:"19",a1:"0.5",a2:"0.5",tol:"0,5 + OU -"},{desc:"GANCHO DIANT.",pp:"28",p:"29",m:"30",g:"30.5",gg:"31",a1:"1",a2:"0.5",tol:"0,5 + OU -"},{desc:"GANCHO TRAS.",pp:"38",p:"39",m:"40",g:"40.5",gg:"41",a1:"1",a2:"0.5",tol:"0,5 + OU -"},{desc:"ENTREPERNAS",pp:"80",p:"80",m:"80",g:"83",gg:"86",a1:"0",a2:"3",tol:"1 + OU -"}]},
  "CAMISETA SLIM MC":{pontos:[{cod:"A",desc:"TORAX",valor:"52",tol:"1,0 + OU -"},{cod:"B",desc:"OMBRO A OMBRO",valor:"45",tol:"1,0 + OU -"},{cod:"C",desc:"CAVA RETA",valor:"23",tol:"1,0 + OU -"},{cod:"D",desc:"COMP. MANGA",valor:"21",tol:"0,5 + OU -"},{cod:"E",desc:"ABERTURA MANGA",valor:"18",tol:"1,0 + OU -"},{cod:"F",desc:"ABERTURA DECOTE",valor:"15",tol:"0,5 + OU -"},{cod:"G",desc:"PROF. DECOTE FRENTE",valor:"10",tol:"0,5 + OU -"},{cod:"H",desc:"PROF. DECOTE COSTAS",valor:"2",tol:"0,5 + OU -"},{cod:"J",desc:"COMP. TOTAL",valor:"71",tol:"1,0 + OU -"},{cod:"K",desc:"BARRA",valor:"52",tol:"1,0 + OU -"}],grad:[{desc:"TORAX",pp:"48",p:"50",m:"52",g:"54",gg:"56",a1:"2",a2:"2",tol:"1 + OU -"},{desc:"OMBRO A OMBRO",pp:"43",p:"44",m:"45",g:"46",gg:"47",a1:"1",a2:"1",tol:"1 + OU -"},{desc:"CAVA RETA",pp:"21",p:"22",m:"23",g:"24",gg:"25",a1:"1",a2:"1",tol:"1 + OU -"},{desc:"COMP. MANGA",pp:"19",p:"20",m:"21",g:"22",gg:"23",a1:"1",a2:"1",tol:"0,5 + OU -"},{desc:"ABERTURA MANGA",pp:"16",p:"17",m:"18",g:"19",gg:"20",a1:"1",a2:"1",tol:"1 + OU -"},{desc:"ABERTURA DECOTE",pp:"14.5",p:"14.5",m:"15",g:"15",gg:"15.5",a1:"0",a2:"0.5",tol:"0,5 + OU -"},{desc:"PROF. DECOTE FR.",pp:"9.5",p:"9.5",m:"10",g:"10",gg:"10.5",a1:"0",a2:"0.5",tol:"0,5 + OU -"},{desc:"PROF. DECOTE CO.",pp:"2",p:"2",m:"2",g:"2",gg:"2",a1:"0",a2:"0",tol:"0,5 + OU -"},{desc:"COMP. TOTAL",pp:"69",p:"70",m:"71",g:"72",gg:"73",a1:"1",a2:"1",tol:"1 + OU -"},{desc:"BARRA",pp:"48",p:"50",m:"52",g:"54",gg:"56",a1:"2",a2:"2",tol:"1 + OU -"}]},
  "BERMUDA JOGGER":{pontos:[{cod:"A",desc:"CINTURA",valor:"43",tol:"1,0 + OU -"},{cod:"B",desc:"QUADRIL",valor:"55",tol:"1,0 + OU -"},{cod:"C",desc:"COXA",valor:"32",tol:"1,0 + OU -"},{cod:"D",desc:"BARRA",valor:"29",tol:"0,5 + OU -"},{cod:"E",desc:"GANCHO DIANT.",valor:"30",tol:"0,5 + OU -"},{cod:"F",desc:"GANCHO TRAS.",valor:"40",tol:"0,5 + OU -"},{cod:"G",desc:"COMP. LATERAL",valor:"47",tol:"0,5 + OU -"}],grad:[{desc:"CINTURA",pp:"39",p:"41",m:"43",g:"45.5",gg:"48",a1:"2",a2:"2.5",tol:"1 + OU -"},{desc:"QUADRIL",pp:"51",p:"53",m:"55",g:"57.5",gg:"60",a1:"2",a2:"2.5",tol:"1 + OU -"},{desc:"COXA",pp:"30",p:"31",m:"32",g:"33",gg:"34",a1:"1",a2:"1",tol:"1 + OU -"},{desc:"BARRA",pp:"27",p:"28",m:"29",g:"30",gg:"31",a1:"1",a2:"1",tol:"0,5 + OU -"},{desc:"GANCHO DIANT.",pp:"28",p:"29",m:"30",g:"30.5",gg:"31",a1:"1",a2:"0.5",tol:"0,5 + OU -"},{desc:"GANCHO TRAS.",pp:"38",p:"39",m:"40",g:"40.5",gg:"41",a1:"1",a2:"0.5",tol:"0,5 + OU -"},{desc:"COMP. LATERAL",pp:"45",p:"46",m:"47",g:"48",gg:"49",a1:"1",a2:"1",tol:"0,5 + OU -"}]},
};

export default function MedidasView(){
  const [sel,setSel]=useState<string|null>(null);const [sec,setSec]=useState<"base"|"grad">("base");
  const [im1,setIm1]=useState<string|null>(null);const [im2,setIm2]=useState<string|null>(null);
  const r1=useRef<HTMLInputElement>(null);const r2=useRef<HTMLInputElement>(null);
  const names=Object.keys(SAMPLE);const data=sel?SAMPLE[sel]:null;
  const hi=async(e:any,f:string,s:(u:string)=>void)=>{const file=e.target.files?.[0];if(!file||!sel)return;const url=await uploadImage(file,`medidas/${sel}/${f}`);if(url)s(url);};

  return(
    <div className="flex gap-8 min-h-[400px]">
      <div className="w-[220px] flex-shrink-0">
        <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--label-secondary)] px-3 mb-2">Tabelas de medidas</div>
        <nav className="flex flex-col gap-0.5 max-h-[600px] overflow-y-auto">{names.map(n=>(
          <button key={n} onClick={()=>{setSel(n);setSec("base");}} className={`text-left px-3 py-[7px] rounded-lg text-[13px] transition-all flex justify-between items-center ${sel===n?"font-semibold bg-[rgba(0,122,255,0.08)] text-[var(--system-blue)]":"text-[var(--label-primary)] hover:bg-[var(--bg-secondary)]"}`}>
            <span>{n}</span><span className="text-[11px] text-[var(--label-tertiary)]">{SAMPLE[n].pontos.length}pt</span>
          </button>
        ))}</nav>
      </div>
      <div className="flex-1 min-w-0">
        {!data?<div className="flex items-center justify-center h-full text-[var(--label-tertiary)]">Selecione uma tabela</div>:(
          <div>
            <h3 className="text-[22px] font-bold tracking-[-0.02em] mb-0.5">{sel}</h3>
            <p className="text-[13px] text-[var(--label-tertiary)] mb-4">Base M · Valores em cm · {data.pontos.length} pontos</p>
            <div className="seg-control mb-5">
              <button onClick={()=>setSec("base")} className={`seg-btn ${sec==="base"?"active":""}`}>Tabela base (M)</button>
              <button onClick={()=>setSec("grad")} className={`seg-btn ${sec==="grad"?"active":""}`}>Graduação</button>
            </div>

            {sec==="base"&&(<div>
              <div className="grid grid-cols-2 gap-5 mb-5">
                {([["Modo de medir",im1,setIm1,r1],["Modelo",im2,setIm2,r2]] as any[]).map(([l,img,s,r])=>(
                  <div key={l}><div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--label-secondary)] mb-1.5">{l}</div>
                    <div className="border border-dashed border-[var(--separator-opaque)] rounded-xl bg-[var(--bg-secondary)] aspect-[4/3] flex items-center justify-center cursor-pointer hover:border-[var(--system-blue)] transition-colors overflow-hidden" onClick={()=>r.current?.click()}>
                      {img?<img src={img} alt={l} className="w-full h-full object-contain p-1"/>:<div className="text-center p-3"><svg className="mx-auto mb-1.5 text-[var(--label-quaternary)]" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><p className="text-[12px] text-[var(--label-tertiary)]">{l}</p></div>}
                    </div><input ref={r} type="file" accept="image/*" className="hidden" onChange={e=>hi(e,l.toLowerCase().replace(/ /g,"_"),s)}/></div>
                ))}
              </div>
              <div className="apple-card overflow-hidden"><table className="plm-table"><thead><tr><th className="text-center w-14">Cód</th><th>Descrição</th><th className="text-center w-20">Tabela (M)</th><th className="text-center w-28">Tolerância</th></tr></thead>
                <tbody>{data.pontos.map((p:any)=>(<tr key={p.cod}><td className="text-center font-bold text-[var(--label-secondary)] px-3">{p.cod}</td><td className="font-medium px-3">{p.desc}</td><td className="text-center tabnum font-semibold px-3">{p.valor}</td><td className="text-center text-[12px] text-[var(--label-secondary)] px-3">{p.tol}</td></tr>))}</tbody>
              </table></div>
            </div>)}

            {sec==="grad"&&(<div>
              <div className="apple-card overflow-hidden overflow-x-auto"><table className="plm-table">
                <thead><tr>
                  <th>Descrição</th><th className="text-center w-16">PP</th><th className="text-center w-16">P</th>
                  <th className="text-center w-16 !bg-[rgba(0,122,255,0.06)] !text-[var(--system-blue)]">M</th>
                  <th className="text-center w-16">G</th><th className="text-center w-16">GG</th>
                  <th className="text-center w-12" colSpan={2}>Ampl.</th><th className="text-center w-24">Tolerância</th>
                </tr></thead>
                <tbody>{data.grad.map((p:any,i:number)=>(<tr key={i}>
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
          </div>
        )}
      </div>
    </div>
  );
}
