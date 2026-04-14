"use client";

import { useState, useRef } from "react";
import { uploadImage } from "@/lib/storage";

// Sample data — replace with Supabase fetch
const SAMPLE_TABELAS = [
  { id:1, nome:"CALÇA JOGGER", imagem_modo_medir:"", imagem_modelo:"", pontos:[
    {id:1,cod:"A",descricao:"CINTURA",valor_base:"43",tolerancia:"1,0 + OU -"},
    {id:2,cod:"B",descricao:"QUADRIL",valor_base:"54",tolerancia:"1,0 + OU -"},
    {id:3,cod:"C",descricao:"COXA",valor_base:"32",tolerancia:"1,0 + OU -"},
    {id:4,cod:"D",descricao:"JOELHO A 31 CM DO GANCHO",valor_base:"23",tolerancia:"0,5 + OU -"},
    {id:5,cod:"E",descricao:"BARRA",valor_base:"19",tolerancia:"0,5 + OU -"},
    {id:6,cod:"F",descricao:"GANCHO DIANTEIRO COM CÓS",valor_base:"29",tolerancia:"0,5 + OU -"},
    {id:7,cod:"G",descricao:"GANCHO TRASEIRO COM CÓS",valor_base:"40",tolerancia:"0,5 + OU -"},
    {id:8,cod:"H",descricao:"ENTREPERNAS",valor_base:"80",tolerancia:"1,0 + OU -"},
  ]},
  { id:2, nome:"CAMISETA SLIM MC", imagem_modo_medir:"", imagem_modelo:"", pontos:[
    {id:9,cod:"A",descricao:"TORAX",valor_base:"52",tolerancia:"1,0 + OU -"},
    {id:10,cod:"B",descricao:"OMBRO A OMBRO",valor_base:"45",tolerancia:"1,0 + OU -"},
    {id:11,cod:"C",descricao:"CAVA RETA",valor_base:"23",tolerancia:"1,0 + OU -"},
    {id:12,cod:"D",descricao:"COMP. MANGA",valor_base:"21",tolerancia:"0,5 + OU -"},
    {id:13,cod:"E",descricao:"ABERTURA MANGA",valor_base:"18",tolerancia:"1,0 + OU -"},
    {id:14,cod:"F",descricao:"ABERTURA DECOTE",valor_base:"15",tolerancia:"0,5 + OU -"},
    {id:15,cod:"G",descricao:"PROF. DECOTE FRENTE",valor_base:"10",tolerancia:"0,5 + OU -"},
    {id:16,cod:"H",descricao:"PROF. DECOTE COSTAS",valor_base:"2",tolerancia:"0,5 + OU -"},
    {id:17,cod:"J",descricao:"COMP. TOTAL",valor_base:"71",tolerancia:"1,0 + OU -"},
    {id:18,cod:"K",descricao:"BARRA",valor_base:"52",tolerancia:"1,0 + OU -"},
  ]},
  { id:3, nome:"BERMUDA JOGGER", imagem_modo_medir:"", imagem_modelo:"", pontos:[
    {id:19,cod:"A",descricao:"CINTURA",valor_base:"43",tolerancia:"1,0 + OU -"},
    {id:20,cod:"B",descricao:"QUADRIL",valor_base:"55",tolerancia:"1,0 + OU -"},
    {id:21,cod:"C",descricao:"COXA",valor_base:"32",tolerancia:"1,0 + OU -"},
    {id:22,cod:"D",descricao:"BARRA",valor_base:"29",tolerancia:"0,5 + OU -"},
    {id:23,cod:"E",descricao:"GANCHO DIANT. C/ CÓS",valor_base:"30",tolerancia:"0,5 + OU -"},
    {id:24,cod:"F",descricao:"GANCHO TRAS. C/ CÓS",valor_base:"40",tolerancia:"0,5 + OU -"},
    {id:25,cod:"G",descricao:"COMP. LATERAL",valor_base:"47",tolerancia:"0,5 + OU -"},
  ]},
];

export default function MedidasView() {
  const [tabelas] = useState(SAMPLE_TABELAS);
  const [selected, setSelected] = useState<any>(null);
  const [newNome, setNewNome] = useState("");
  const [newCod, setNewCod] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newVal, setNewVal] = useState("");
  const [newTol, setNewTol] = useState("1,0 + OU -");
  const imgMedirRef = useRef<HTMLInputElement>(null);
  const imgModeloRef = useRef<HTMLInputElement>(null);

  const handleImgUpload = async (e: any, field: string) => {
    const file = e.target.files?.[0];
    if (!file || !selected) return;
    const url = await uploadImage(file, `medidas/${selected.nome}/${field}`);
    if (url) {
      setSelected((prev: any) => ({ ...prev, [field]: url }));
    }
  };

  return (
    <div className="flex gap-6 min-h-[400px]">
      {/* Sidebar — lista de tabelas */}
      <div className="w-[220px] flex-shrink-0">
        <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-gray-400 px-3 mb-2">
          Tabelas de medidas
        </div>
        <div className="mb-3 px-1">
          <div className="flex gap-1.5">
            <input type="text" value={newNome} onChange={e => setNewNome(e.target.value)}
              placeholder="Nova tabela..."
              className="flex-1 text-[13px] px-3 py-2 rounded-lg border border-gray-200 bg-white outline-none"
              onKeyDown={e => { if (e.key === "Enter" && newNome.trim()) { /* TODO: add to DB */ setNewNome(""); } }}
            />
          </div>
        </div>
        <nav className="flex flex-col gap-px max-h-[500px] overflow-y-auto">
          {tabelas.map(t => (
            <button key={t.id} onClick={() => setSelected(t)}
              className={`text-left px-3 py-2 rounded-lg text-[13px] transition-all ${
                selected?.id === t.id
                  ? "font-semibold bg-blue-50 text-[#007AFF]"
                  : "text-gray-900 hover:bg-gray-50"
              }`}>
              <span>{t.nome}</span>
              <span className="ml-1 text-[11px] text-gray-400">{t.pontos.length}pt</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main — detalhe da tabela selecionada */}
      <div className="flex-1 min-w-0">
        {!selected ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Selecione uma tabela de medidas
          </div>
        ) : (
          <div>
            <div className="flex items-baseline gap-3 mb-1">
              <h3 className="text-xl font-bold tracking-tight">{selected.nome}</h3>
              <span className="text-sm text-gray-400">{selected.pontos.length} pontos de medida</span>
            </div>
            <p className="text-[13px] text-gray-400 mb-5">Tamanho base: M · Valores em cm</p>

            {/* Imagens: modo de medir + modelo */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              {[
                { label: "Modo de medir", field: "imagem_modo_medir", ref: imgMedirRef },
                { label: "Modelo", field: "imagem_modelo", ref: imgModeloRef },
              ].map(({ label, field, ref }) => (
                <div key={field}>
                  <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-gray-400 mb-1.5">{label}</div>
                  <div
                    className="border border-dashed border-gray-300 rounded-xl bg-gray-50 aspect-[4/3] flex items-center justify-center cursor-pointer hover:border-blue-300 transition-colors overflow-hidden"
                    onClick={() => ref.current?.click()}
                  >
                    {(selected as any)[field] ? (
                      <img src={(selected as any)[field]} alt={label} className="w-full h-full object-contain p-1" />
                    ) : (
                      <div className="text-center p-3">
                        <svg className="mx-auto mb-1.5 text-gray-300" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                        <p className="text-xs text-gray-400">{label}</p>
                        <p className="text-[10px] text-gray-300">Clique para upload</p>
                      </div>
                    )}
                  </div>
                  <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => handleImgUpload(e, field)} />
                </div>
              ))}
            </div>

            {/* Tabela de pontos */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
              <table className="w-full text-[13px] border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    <th className="text-center px-3 py-2 w-14">Cód</th>
                    <th className="text-left px-3 py-2">Descrição</th>
                    <th className="text-center px-3 py-2 w-20">Tabela (M)</th>
                    <th className="text-center px-3 py-2 w-28">Tolerância</th>
                    <th className="text-center px-3 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {selected.pontos.map((p: any) => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="text-center px-3 py-2 font-bold text-gray-500">{p.cod}</td>
                      <td className="px-3 py-2 font-medium">{p.descricao}</td>
                      <td className="text-center px-3 py-2 tabular-nums font-semibold">{p.valor_base}</td>
                      <td className="text-center px-3 py-2 text-[12px] text-gray-500">{p.tolerancia}</td>
                      <td className="text-center px-1 py-2">
                        <button className="text-gray-300 hover:text-red-500 transition-colors text-sm">×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Adicionar ponto */}
            <div className="flex gap-2 items-center">
              <input className="w-14 text-[13px] px-2 py-2 rounded-lg border border-gray-200 text-center" value={newCod} onChange={e => setNewCod(e.target.value)} placeholder="Cód" />
              <input className="flex-1 text-[13px] px-3 py-2 rounded-lg border border-gray-200" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Descrição do ponto (ex: CINTURA)" />
              <input className="w-20 text-[13px] px-2 py-2 rounded-lg border border-gray-200 text-center" value={newVal} onChange={e => setNewVal(e.target.value)} placeholder="Valor" />
              <input className="w-28 text-[13px] px-2 py-2 rounded-lg border border-gray-200 text-center" value={newTol} onChange={e => setNewTol(e.target.value)} placeholder="Tolerância" />
              <button className="text-[13px] font-semibold px-4 py-2 rounded-lg bg-[#007AFF] text-white hover:opacity-90 transition-opacity"
                onClick={() => {
                  if (!newCod || !newDesc) return;
                  // TODO: save to DB
                  setNewCod(""); setNewDesc(""); setNewVal(""); setNewTol("1,0 + OU -");
                }}>
                + Ponto
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
