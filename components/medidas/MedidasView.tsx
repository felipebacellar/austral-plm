"use client";

import { useState, useRef } from "react";
import { uploadImage } from "@/lib/storage";

const SAMPLE: Record<string, { pontos: any[]; grad: any[] }> = {
  "CALÇA JOGGER": {
    pontos: [
      {cod:"A",desc:"CINTURA",valor:"43",tol:"1,0 + OU -"},
      {cod:"B",desc:"QUADRIL",valor:"54",tol:"1,0 + OU -"},
      {cod:"C",desc:"COXA",valor:"32",tol:"1,0 + OU -"},
      {cod:"D",desc:"JOELHO A 31CM DO GANCHO",valor:"23",tol:"0,5 + OU -"},
      {cod:"E",desc:"BARRA",valor:"18",tol:"0,5 + OU -"},
      {cod:"F",desc:"GANCHO DIANTEIRO COM CÓS",valor:"30",tol:"0,5 + OU -"},
      {cod:"G",desc:"GANCHO TRASEIRO COM CÓS",valor:"40",tol:"0,5 + OU -"},
      {cod:"H",desc:"ENTREPERNAS",valor:"80",tol:"1,0 + OU -"},
    ],
    grad: [
      {desc:"CINTURA",pp:"39",p:"41",m:"43",g:"45.5",gg:"48",amp1:"2",amp2:"2.5",tol:"1 + OU -"},
      {desc:"QUADRIL",pp:"50",p:"52",m:"54",g:"56.5",gg:"59",amp1:"2",amp2:"2.5",tol:"1 + OU -"},
      {desc:"COXA",pp:"30",p:"31",m:"32",g:"33",gg:"34",amp1:"1",amp2:"1",tol:"1 + OU -"},
      {desc:"JOELHO A 31CM DO GANCHO",pp:"21.6",p:"22.3",m:"23",g:"23.7",gg:"24.4",amp1:"0.7",amp2:"0.7",tol:"0,5 + OU -"},
      {desc:"BARRA",pp:"17",p:"17.5",m:"18",g:"18.5",gg:"19",amp1:"0.5",amp2:"0.5",tol:"0,5 + OU -"},
      {desc:"GANCHO DIANTEIRO COM CÓS",pp:"28",p:"29",m:"30",g:"30.5",gg:"31",amp1:"1",amp2:"0.5",tol:"0,5 + OU -"},
      {desc:"GANCHO TRASEIRO COM CÓS",pp:"38",p:"39",m:"40",g:"40.5",gg:"41",amp1:"1",amp2:"0.5",tol:"0,5 + OU -"},
      {desc:"ENTREPERNAS",pp:"80",p:"80",m:"80",g:"83",gg:"86",amp1:"0",amp2:"3",tol:"1 + OU -"},
    ],
  },
  "CAMISETA SLIM MC": {
    pontos: [
      {cod:"A",desc:"TORAX",valor:"52",tol:"1,0 + OU -"},
      {cod:"B",desc:"OMBRO A OMBRO",valor:"45",tol:"1,0 + OU -"},
      {cod:"C",desc:"CAVA RETA",valor:"23",tol:"1,0 + OU -"},
      {cod:"D",desc:"COMP. MANGA",valor:"21",tol:"0,5 + OU -"},
      {cod:"E",desc:"ABERTURA MANGA",valor:"18",tol:"1,0 + OU -"},
      {cod:"F",desc:"ABERTURA DECOTE",valor:"15",tol:"0,5 + OU -"},
      {cod:"G",desc:"PROF. DECOTE FRENTE",valor:"10",tol:"0,5 + OU -"},
      {cod:"H",desc:"PROF. DECOTE COSTAS",valor:"2",tol:"0,5 + OU -"},
      {cod:"J",desc:"COMP. TOTAL",valor:"71",tol:"1,0 + OU -"},
      {cod:"K",desc:"BARRA",valor:"52",tol:"1,0 + OU -"},
    ],
    grad: [
      {desc:"TORAX",pp:"48",p:"50",m:"52",g:"54",gg:"56",amp1:"2",amp2:"2",tol:"1 + OU -"},
      {desc:"OMBRO A OMBRO",pp:"43",p:"44",m:"45",g:"46",gg:"47",amp1:"1",amp2:"1",tol:"1 + OU -"},
      {desc:"CAVA RETA",pp:"21",p:"22",m:"23",g:"24",gg:"25",amp1:"1",amp2:"1",tol:"1 + OU -"},
      {desc:"COMP. MANGA",pp:"19",p:"20",m:"21",g:"22",gg:"23",amp1:"1",amp2:"1",tol:"0,5 + OU -"},
      {desc:"ABERTURA MANGA",pp:"16",p:"17",m:"18",g:"19",gg:"20",amp1:"1",amp2:"1",tol:"1 + OU -"},
      {desc:"ABERTURA DECOTE",pp:"14.5",p:"14.5",m:"15",g:"15",gg:"15.5",amp1:"0",amp2:"0.5",tol:"0,5 + OU -"},
      {desc:"PROF. DECOTE FRENTE",pp:"9.5",p:"9.5",m:"10",g:"10",gg:"10.5",amp1:"0",amp2:"0.5",tol:"0,5 + OU -"},
      {desc:"PROF. DECOTE COSTAS",pp:"2",p:"2",m:"2",g:"2",gg:"2",amp1:"0",amp2:"0",tol:"0,5 + OU -"},
      {desc:"COMP. TOTAL",pp:"69",p:"70",m:"71",g:"72",gg:"73",amp1:"1",amp2:"1",tol:"1 + OU -"},
      {desc:"BARRA",pp:"48",p:"50",m:"52",g:"54",gg:"56",amp1:"2",amp2:"2",tol:"1 + OU -"},
    ],
  },
  "BERMUDA JOGGER": {
    pontos: [
      {cod:"A",desc:"CINTURA",valor:"43",tol:"1,0 + OU -"},
      {cod:"B",desc:"QUADRIL",valor:"55",tol:"1,0 + OU -"},
      {cod:"C",desc:"COXA",valor:"32",tol:"1,0 + OU -"},
      {cod:"D",desc:"BARRA",valor:"29",tol:"0,5 + OU -"},
      {cod:"E",desc:"GANCHO DIANT. C/ CÓS",valor:"30",tol:"0,5 + OU -"},
      {cod:"F",desc:"GANCHO TRAS. C/ CÓS",valor:"40",tol:"0,5 + OU -"},
      {cod:"G",desc:"COMP. LATERAL",valor:"47",tol:"0,5 + OU -"},
    ],
    grad: [
      {desc:"CINTURA",pp:"39",p:"41",m:"43",g:"45.5",gg:"48",amp1:"2",amp2:"2.5",tol:"1 + OU -"},
      {desc:"QUADRIL",pp:"51",p:"53",m:"55",g:"57.5",gg:"60",amp1:"2",amp2:"2.5",tol:"1 + OU -"},
      {desc:"COXA",pp:"30",p:"31",m:"32",g:"33",gg:"34",amp1:"1",amp2:"1",tol:"1 + OU -"},
      {desc:"BARRA",pp:"27",p:"28",m:"29",g:"30",gg:"31",amp1:"1",amp2:"1",tol:"0,5 + OU -"},
      {desc:"GANCHO DIANT. C/ CÓS",pp:"28",p:"29",m:"30",g:"30.5",gg:"31",amp1:"1",amp2:"0.5",tol:"0,5 + OU -"},
      {desc:"GANCHO TRAS. C/ CÓS",pp:"38",p:"39",m:"40",g:"40.5",gg:"41",amp1:"1",amp2:"0.5",tol:"0,5 + OU -"},
      {desc:"COMP. LATERAL",pp:"45",p:"46",m:"47",g:"48",gg:"49",amp1:"1",amp2:"1",tol:"0,5 + OU -"},
    ],
  },
};

export default function MedidasView() {
  const [selected, setSelected] = useState<string|null>(null);
  const [section, setSection] = useState<"base"|"graduacao">("base");
  const [imgMedir, setImgMedir] = useState<string|null>(null);
  const [imgModelo, setImgModelo] = useState<string|null>(null);
  const imgMedirRef = useRef<HTMLInputElement>(null);
  const imgModeloRef = useRef<HTMLInputElement>(null);

  const nomes = Object.keys(SAMPLE);
  const data = selected ? SAMPLE[selected] : null;

  const handleImg = async (e: any, field: string, setter: (u:string)=>void) => {
    const file = e.target.files?.[0];
    if (!file || !selected) return;
    const url = await uploadImage(file, `medidas/${selected}/${field}`);
    if (url) setter(url);
  };

  return (
    <div className="flex gap-6 min-h-[400px]">
      {/* Sidebar */}
      <div className="w-[220px] flex-shrink-0">
        <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-gray-400 px-3 mb-2">Tabelas de medidas</div>
        <nav className="flex flex-col gap-px max-h-[600px] overflow-y-auto">
          {nomes.map(n => (
            <button key={n} onClick={() => { setSelected(n); setSection("base"); }}
              className={`text-left px-3 py-2 rounded-lg text-[13px] transition-all ${selected===n?"font-semibold bg-blue-50 text-[#007AFF]":"text-gray-900 hover:bg-gray-50"}`}>
              <span>{n}</span>
              <span className="ml-1 text-[11px] text-gray-400">{SAMPLE[n].pontos.length}pt</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0">
        {!data ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">Selecione uma tabela de medidas</div>
        ) : (
          <div>
            <div className="flex items-baseline gap-3 mb-1">
              <h3 className="text-xl font-bold tracking-tight">{selected}</h3>
              <span className="text-sm text-gray-400">{data.pontos.length} pontos</span>
            </div>
            <p className="text-[13px] text-gray-400 mb-4">Tamanho base: M · Valores em cm</p>

            {/* Sub-tabs: Base / Graduação */}
            <div className="flex gap-0.5 bg-gray-100 rounded-lg p-[3px] w-fit mb-5">
              <button onClick={() => setSection("base")}
                className={`px-4 py-1.5 rounded-md text-[13px] transition-all ${section==="base"?"font-semibold bg-white text-gray-900 shadow-sm":"text-gray-500"}`}>
                Tabela base (M)
              </button>
              <button onClick={() => setSection("graduacao")}
                className={`px-4 py-1.5 rounded-md text-[13px] transition-all ${section==="graduacao"?"font-semibold bg-white text-gray-900 shadow-sm":"text-gray-500"}`}>
                Graduação
              </button>
            </div>

            {/* ── Tabela base ── */}
            {section === "base" && (
              <div>
                {/* Images */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                  {([["Modo de medir","imagem_modo_medir",imgMedir,setImgMedir,imgMedirRef],["Modelo","imagem_modelo",imgModelo,setImgModelo,imgModeloRef]] as any[]).map(([label,field,img,setter,ref]) => (
                    <div key={field}>
                      <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-gray-400 mb-1.5">{label}</div>
                      <div className="border border-dashed border-gray-300 rounded-xl bg-gray-50 aspect-[4/3] flex items-center justify-center cursor-pointer hover:border-blue-300 transition-colors overflow-hidden"
                        onClick={() => ref.current?.click()}>
                        {img ? <img src={img} alt={label} className="w-full h-full object-contain p-1"/> : (
                          <div className="text-center p-3">
                            <svg className="mx-auto mb-1.5 text-gray-300" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                            <p className="text-xs text-gray-400">{label}</p>
                          </div>
                        )}
                      </div>
                      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => handleImg(e,field,setter)}/>
                    </div>
                  ))}
                </div>

                {/* Points table */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-[13px] border-collapse">
                    <thead><tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      <th className="text-center px-3 py-2 w-14">Cód</th>
                      <th className="text-left px-3 py-2">Descrição</th>
                      <th className="text-center px-3 py-2 w-20">Tabela (M)</th>
                      <th className="text-center px-3 py-2 w-28">Tolerância</th>
                    </tr></thead>
                    <tbody>{data.pontos.map((p:any) => (
                      <tr key={p.cod} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="text-center px-3 py-2 font-bold text-gray-500">{p.cod}</td>
                        <td className="px-3 py-2 font-medium">{p.desc}</td>
                        <td className="text-center px-3 py-2 tabular-nums font-semibold">{p.valor}</td>
                        <td className="text-center px-3 py-2 text-[12px] text-gray-500">{p.tol}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Graduação ── */}
            {section === "graduacao" && (
              <div>
                <div className="border border-gray-200 rounded-xl overflow-hidden overflow-x-auto">
                  <table className="w-full text-[13px] border-collapse">
                    <thead><tr className="bg-gray-50">
                      <th className="text-left px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Descrição</th>
                      <th className="text-center px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 w-16">PP</th>
                      <th className="text-center px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 w-16">P</th>
                      <th className="text-center px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#007AFF] w-16 bg-blue-50/50">M</th>
                      <th className="text-center px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 w-16">G</th>
                      <th className="text-center px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 w-16">GG</th>
                      <th className="text-center px-2 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 w-12" colSpan={2}>Ampl.</th>
                      <th className="text-center px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 w-24">Tolerância</th>
                    </tr></thead>
                    <tbody>{data.grad.map((p:any,i:number) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="px-3 py-2.5 font-medium">{p.desc}</td>
                        <td className="text-center px-3 py-2.5 tabular-nums">{p.pp}</td>
                        <td className="text-center px-3 py-2.5 tabular-nums">{p.p}</td>
                        <td className="text-center px-3 py-2.5 tabular-nums font-bold bg-blue-50/30">{p.m}</td>
                        <td className="text-center px-3 py-2.5 tabular-nums">{p.g}</td>
                        <td className="text-center px-3 py-2.5 tabular-nums">{p.gg}</td>
                        <td className="text-center px-1.5 py-2.5 tabular-nums text-gray-500 text-[12px] border-l border-gray-100">{p.amp1}</td>
                        <td className="text-center px-1.5 py-2.5 tabular-nums text-gray-500 text-[12px]">{p.amp2}</td>
                        <td className="text-center px-3 py-2.5 text-[12px] text-gray-500">{p.tol}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                <p className="text-[11px] text-gray-400 mt-3">Ampliação: diferença entre tamanhos adjacentes (←M / M→)</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
