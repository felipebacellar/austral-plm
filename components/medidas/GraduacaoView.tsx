"use client";

import { useState } from "react";

const SAMPLE_GRADS: Record<string, any[]> = {
  "CALÇA JOGGER": [
    { desc:"CINTURA", pp:"39", p:"41", m:"43", g:"45.5", gg:"48", amp1:"2", amp2:"2.5", tol:"1 + OU -" },
    { desc:"QUADRIL", pp:"50", p:"52", m:"54", g:"56.5", gg:"59", amp1:"2", amp2:"2.5", tol:"1 + OU -" },
    { desc:"COXA", pp:"30", p:"31", m:"32", g:"33", gg:"34", amp1:"1", amp2:"1", tol:"1 + OU -" },
    { desc:"JOELHO A 31CM DO GANCHO", pp:"21.6", p:"22.3", m:"23", g:"23.7", gg:"24.4", amp1:"0.7", amp2:"0.7", tol:"0,5 + OU -" },
    { desc:"BARRA", pp:"17", p:"17.5", m:"18", g:"18.5", gg:"19", amp1:"0.5", amp2:"0.5", tol:"0,5 + OU -" },
    { desc:"GANCHO DIANTEIRO COM CÓS", pp:"28", p:"29", m:"30", g:"30.5", gg:"31", amp1:"1", amp2:"0.5", tol:"0,5 + OU -" },
    { desc:"GANCHO TRASEIRO COM CÓS", pp:"38", p:"39", m:"40", g:"40.5", gg:"41", amp1:"1", amp2:"0.5", tol:"0,5 + OU -" },
    { desc:"ENTREPERNAS", pp:"80", p:"80", m:"80", g:"83", gg:"86", amp1:"0", amp2:"3", tol:"1 + OU -" },
  ],
  "CAMISETA SLIM MC": [
    { desc:"TORAX", pp:"48", p:"50", m:"52", g:"54", gg:"56", amp1:"2", amp2:"2", tol:"1 + OU -" },
    { desc:"OMBRO A OMBRO", pp:"43", p:"44", m:"45", g:"46", gg:"47", amp1:"1", amp2:"1", tol:"1 + OU -" },
    { desc:"CAVA RETA", pp:"21", p:"22", m:"23", g:"24", gg:"25", amp1:"1", amp2:"1", tol:"1 + OU -" },
    { desc:"COMP. MANGA", pp:"19", p:"20", m:"21", g:"22", gg:"23", amp1:"1", amp2:"1", tol:"0,5 + OU -" },
    { desc:"ABERTURA MANGA", pp:"16", p:"17", m:"18", g:"19", gg:"20", amp1:"1", amp2:"1", tol:"1 + OU -" },
    { desc:"ABERTURA DECOTE", pp:"14.5", p:"14.5", m:"15", g:"15", gg:"15.5", amp1:"0", amp2:"0.5", tol:"0,5 + OU -" },
    { desc:"PROF. DECOTE FRENTE", pp:"9.5", p:"9.5", m:"10", g:"10", gg:"10.5", amp1:"0", amp2:"0.5", tol:"0,5 + OU -" },
    { desc:"PROF. DECOTE COSTAS", pp:"2", p:"2", m:"2", g:"2", gg:"2", amp1:"0", amp2:"0", tol:"0,5 + OU -" },
    { desc:"COMP. TOTAL", pp:"69", p:"70", m:"71", g:"72", gg:"73", amp1:"1", amp2:"1", tol:"1 + OU -" },
    { desc:"BARRA", pp:"48", p:"50", m:"52", g:"54", gg:"56", amp1:"2", amp2:"2", tol:"1 + OU -" },
  ],
  "BERMUDA JOGGER": [
    { desc:"CINTURA", pp:"39", p:"41", m:"43", g:"45.5", gg:"48", amp1:"2", amp2:"2.5", tol:"1 + OU -" },
    { desc:"QUADRIL", pp:"51", p:"53", m:"55", g:"57.5", gg:"60", amp1:"2", amp2:"2.5", tol:"1 + OU -" },
    { desc:"COXA", pp:"30", p:"31", m:"32", g:"33", gg:"34", amp1:"1", amp2:"1", tol:"1 + OU -" },
    { desc:"BARRA", pp:"27", p:"28", m:"29", g:"30", gg:"31", amp1:"1", amp2:"1", tol:"0,5 + OU -" },
    { desc:"GANCHO DIANT. C/ CÓS", pp:"28", p:"29", m:"30", g:"30.5", gg:"31", amp1:"1", amp2:"0.5", tol:"0,5 + OU -" },
    { desc:"GANCHO TRAS. C/ CÓS", pp:"38", p:"39", m:"40", g:"40.5", gg:"41", amp1:"1", amp2:"0.5", tol:"0,5 + OU -" },
    { desc:"COMP. LATERAL", pp:"45", p:"46", m:"47", g:"48", gg:"49", amp1:"1", amp2:"1", tol:"0,5 + OU -" },
  ],
};

export default function GraduacaoView() {
  const [selected, setSelected] = useState<string | null>(null);
  const nomes = Object.keys(SAMPLE_GRADS);
  const points = selected ? SAMPLE_GRADS[selected] : [];

  return (
    <div className="flex gap-6 min-h-[400px]">
      {/* Sidebar */}
      <div className="w-[220px] flex-shrink-0">
        <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-gray-400 px-3 mb-2">
          Tabelas de graduação
        </div>
        <nav className="flex flex-col gap-px max-h-[500px] overflow-y-auto">
          {nomes.map(n => (
            <button key={n} onClick={() => setSelected(n)}
              className={`text-left px-3 py-2 rounded-lg text-[13px] transition-all ${
                selected === n
                  ? "font-semibold bg-blue-50 text-[#007AFF]"
                  : "text-gray-900 hover:bg-gray-50"
              }`}>
              {n}
            </button>
          ))}
        </nav>
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0">
        {!selected ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Selecione uma tabela de graduação
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-bold tracking-tight mb-1">{selected}</h3>
            <p className="text-[13px] text-gray-400 mb-5">Graduação por tamanho · Valores em cm · Base M</p>

            <div className="border border-gray-200 rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-[13px] border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Descrição</th>
                    <th className="text-center px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 w-16">PP</th>
                    <th className="text-center px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 w-16">P</th>
                    <th className="text-center px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#007AFF] w-16 bg-blue-50/50">M</th>
                    <th className="text-center px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 w-16">G</th>
                    <th className="text-center px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 w-16">GG</th>
                    <th className="text-center px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 w-24" colSpan={2}>Ampliação</th>
                    <th className="text-center px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 w-24">Tolerância</th>
                  </tr>
                </thead>
                <tbody>
                  {points.map((p, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="px-3 py-2.5 font-medium">{p.desc}</td>
                      <td className="text-center px-3 py-2.5 tabular-nums">{p.pp}</td>
                      <td className="text-center px-3 py-2.5 tabular-nums">{p.p}</td>
                      <td className="text-center px-3 py-2.5 tabular-nums font-bold bg-blue-50/30">{p.m}</td>
                      <td className="text-center px-3 py-2.5 tabular-nums">{p.g}</td>
                      <td className="text-center px-3 py-2.5 tabular-nums">{p.gg}</td>
                      <td className="text-center px-2 py-2.5 tabular-nums text-gray-500 text-[12px] border-l border-gray-100">{p.amp1}</td>
                      <td className="text-center px-2 py-2.5 tabular-nums text-gray-500 text-[12px]">{p.amp2}</td>
                      <td className="text-center px-3 py-2.5 text-[12px] text-gray-500">{p.tol}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-gray-400 mt-3">
              Ampliação: diferença entre tamanhos adjacentes (←M / M→)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
