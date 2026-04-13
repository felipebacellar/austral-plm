"use client";

import { useState, useRef } from "react";
import StatusPill from "@/components/ui/StatusPill";

type Props = { row: any; onClose: () => void };

const PILL: Record<string,string> = {
  "MOSTRUÁRIO LIBERADO":"pill-green","PRODUÇÃO LIBERADA":"pill-blue",
  "DESENVOLVIMENTO":"pill-orange","CANCELADO":"pill-red","Aguardando":"pill-orange",
};

export default function FichaModal({ row, onClose }: Props) {
  const [tab, setTab] = useState<"ficha"|"estamparia">("ficha");
  const [image, setImage] = useState<string|null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const f = row.ficha || {
    tabelaMedidas:"", ncm:"", observacoes:"", obsFechamento:"",
    tecidos:[],aviamentos:[],pilotagem:[
      {num:"Piloto 1",lacre:"",envio:"",receb:"",prova:"",status:""},
      {num:"Piloto 2",lacre:"",envio:"",receb:"",prova:"",status:""},
      {num:"Piloto 3",lacre:"",envio:"",receb:"",prova:"",status:""},
    ],
    estamparia:{tecnica:"",observacoes:"",variantes:[]},
    qtdMostruario:{},
  };

  const avTotal = f.aviamentos.reduce((s:number,a:any)=>s+(a.valor*a.qtd),0);
  const custoMP = row.custo_forn || row.custoForn || 0;
  const custoMO = 0;
  const custoTotalMO = custoMP + custoMO + avTotal;
  const custoPA = row.custo_total || row.custoTotal || 0;
  const mkp = row.mkp || 0;

  const handleImage = (e:any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleExport = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8 overflow-y-auto bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-[900px] shadow-2xl overflow-hidden print:shadow-none print:rounded-none" onClick={e=>e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="px-7 pt-5 pb-4 bg-gray-50 border-b border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">Ficha técnica</span>
                <span className="text-xs font-mono text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-200">{row.ref}</span>
                {row.status && PILL[row.status] && <span className={`pill ${PILL[row.status]}`}>{row.status}</span>}
              </div>
              <h2 className="text-xl font-bold tracking-tight">{row.desc}</h2>
              <p className="text-sm text-gray-500 mt-1">{row.colecao} · {row.fornecedor} · {row.operacao}</p>
            </div>
            <div className="flex gap-2 items-center flex-shrink-0">
              <button onClick={handleExport} className="text-xs font-semibold text-[#007AFF] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors print:hidden">
                Exportar
              </button>
              <button onClick={onClose} className="bg-white border border-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors print:hidden">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-0.5 bg-gray-200/70 rounded-lg p-[3px] w-fit print:hidden">
            {([["ficha","Ficha técnica"],["estamparia","Estamparia"]] as const).map(([id,label])=>(
              <button key={id} onClick={()=>setTab(id)}
                className={`px-4 py-1.5 rounded-md text-sm transition-all ${tab===id?"font-semibold bg-white text-gray-900 shadow-sm":"text-gray-500 hover:text-gray-700"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab: Ficha Técnica ── */}
        {tab === "ficha" && (
          <div className="px-7 py-6 space-y-6">

            {/* Dados do produto + desenho técnico */}
            <div className="grid grid-cols-[1fr_220px] gap-6">
              <div>
                <SH>Dados do produto</SH>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-x-5 gap-y-3 mt-3">
                  {([
                    ["Referência",row.ref],["Descrição",row.desc],["Operação",row.operacao],
                    ["Fornecedor",row.fornecedor],["Estilista",row.estilista],["Drop",row.drop],
                    ["Grade",row.grade],["Grupo",row.grupo],["Subgrupo",row.subgrupo],
                    ["Categoria",row.categoria],["Subcategoria",row.subcategoria],
                    ["Linha",row.linha],["Tipo",row.tipo],["Lavagem",row.lavagem],
                    ["NCM",f.ncm||"—"],["Tab. medidas",f.tabelaMedidas||"—"],
                  ] as [string,string][]).map(([l,v])=>(
                    <div key={l}>
                      <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-gray-400 mb-0.5">{l}</div>
                      <div className="text-sm font-medium text-gray-900">{v||"—"}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desenho técnico upload */}
              <div>
                <SH>Desenho técnico</SH>
                <div className="mt-3 border border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50 aspect-[3/4] flex items-center justify-center cursor-pointer hover:border-[#007AFF] hover:bg-blue-50/30 transition-colors"
                  onClick={()=>fileRef.current?.click()}>
                  {image ? (
                    <img src={image} alt="Desenho técnico" className="w-full h-full object-contain"/>
                  ) : (
                    <div className="text-center p-4">
                      <svg className="mx-auto mb-2 text-gray-300" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                      <p className="text-xs text-gray-400">Clique para enviar imagem</p>
                      <p className="text-[10px] text-gray-300 mt-0.5">JPEG ou PNG</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage}/>
              </div>
            </div>

            {/* Tecidos */}
            <div>
              <SH>Tecidos</SH>
              <TBL heads={["Artigo","Fornecedor","Preço / cons.","Código","Localização","Var 01","Var 02","Var 03","Var 04"]}>
                {f.tecidos.length > 0 ? f.tecidos.map((t:any,i:number)=>(
                  <tr key={i}>
                    <td className="font-medium">{t.artigo}</td>
                    <td>{t.forn}</td>
                    <td className="tabular-nums">{t.preco>0?`R$ ${Number(t.preco).toFixed(2)}`:"—"}</td>
                    <td className="font-mono text-xs text-gray-500">{t.codigo||"—"}</td>
                    <td className="text-xs text-gray-500">{t.localizacao||"—"}</td>
                    {(t.cores||[]).slice(0,4).map((c:string,j:number)=><td key={j}><Chip>{c}</Chip></td>)}
                    {Array.from({length: Math.max(0, 4-(t.cores||[]).length)}).map((_,j)=><td key={`e${j}`}>—</td>)}
                  </tr>
                )) : <Empty cols={9}/>}
              </TBL>
            </div>

            {/* Qtd peças mostruário */}
            {f.tecidos.length > 0 && f.tecidos[0]?.cores?.length > 0 && (
              <div>
                <SH>Quantidade de peças de mostruário</SH>
                <div className="flex gap-3">
                  {f.tecidos[0].cores.map((c:string,i:number)=>(
                    <div key={i} className="bg-gray-50 rounded-lg px-4 py-2 text-center">
                      <div className="text-[10px] font-bold uppercase text-gray-400 mb-1">{c}</div>
                      <div className="text-lg font-bold tabular-nums">{f.qtdMostruario?.[c] || "—"}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custos */}
            <div className="grid grid-cols-2 gap-4">
              <CostCard title="Mão de obra" items={[
                ["M.P.", custoMP], ["M.O.", custoMO], ["Aviamentos", avTotal], ["Total", custoTotalMO],
              ]}/>
              <CostCard title="Produto acabado" items={[
                ["Custo", custoPA], ["Aviamentos", avTotal], ["Total", custoPA], ["MKP 5,5×", mkp],
              ]}/>
            </div>

            {/* Observações + Tabela de medidas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <SH>Observações</SH>
                <div className="bg-gray-50 rounded-xl p-4 min-h-[60px] text-sm text-gray-600">
                  {f.observacoes || "Sem observações"}
                </div>
              </div>
              <div>
                <SH>Tabela de medidas</SH>
                <div className="bg-gray-50 rounded-xl p-4 min-h-[60px] text-sm font-medium">
                  {f.tabelaMedidas || "—"}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-1"/>

            {/* ── Seção Aviamentação ── */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">Ficha técnica</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#007AFF]">— Aviamentação</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">{row.ref} · {row.desc} · {row.fornecedor}</p>

              <TBL heads={["Matéria prima","Código","Qtde","Valor","Localização","Var 01","Var 02","Var 03","Var 04"]}>
                {f.aviamentos.length > 0 ? (
                  <>
                    {f.aviamentos.map((a:any,i:number)=>(
                      <tr key={i}>
                        <td className="font-medium">{a.item}</td>
                        <td className="font-mono text-xs text-gray-500">{a.cod}</td>
                        <td className="text-center tabular-nums">{a.qtd}</td>
                        <td className="tabular-nums">R$ {a.valor.toFixed(2)}</td>
                        <td className="text-xs text-gray-500 max-w-[180px]">{a.local}</td>
                        <td><Chip>{a.var01||a.cor||"—"}</Chip></td>
                        <td>{a.var02||"—"}</td>
                        <td>{a.var03||"—"}</td>
                        <td>{a.var04||"—"}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-gray-300">
                      <td colSpan={3} className="font-bold text-sm pt-2">Total aviamentos</td>
                      <td className="font-bold tabular-nums text-sm pt-2">R$ {avTotal.toFixed(2)}</td>
                      <td colSpan={5}/>
                    </tr>
                  </>
                ) : <Empty cols={9}/>}
              </TBL>
            </div>

            {/* Pilotagem */}
            <div>
              <SH>Liberação de pilotagem</SH>
              <TBL heads={["Nº piloto","Lacre","Data de envio","Data de receb.","Data de prova","Status"]}>
                {(f.pilotagem||[]).map((p:any,i:number)=>(
                  <tr key={i}>
                    <td className="font-medium">{p.num}</td>
                    <td>{p.lacre||"—"}</td>
                    <td>{p.envio||"—"}</td>
                    <td>{p.receb||"—"}</td>
                    <td>{p.prova||"—"}</td>
                    <td>{p.status ? <span className={`pill ${PILL[p.status]||"pill-orange"}`}>{p.status}</span> : "—"}</td>
                  </tr>
                ))}
              </TBL>
            </div>

            {/* Obs fechamento de custo */}
            <div>
              <SH>Observações de fechamento de custo</SH>
              <div className="bg-gray-50 rounded-xl p-4 min-h-[40px] text-sm text-gray-600">
                {f.obsFechamento || "—"}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Estamparia ── */}
        {tab === "estamparia" && (
          <div className="px-7 py-6 space-y-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">Ficha técnica de estamparia</span>
              <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{row.ref}</span>
            </div>

            {/* Dados */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-x-5 gap-y-3">
              {([
                ["Referência",row.ref],["Descrição",row.desc],["Operação",row.operacao],
                ["Fornecedor",row.fornecedor],["Estilista",row.estilista],
                ["Drop",row.drop],["Grade",row.grade],
              ] as [string,string][]).map(([l,v])=>(
                <div key={l}>
                  <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-gray-400 mb-0.5">{l}</div>
                  <div className="text-sm font-medium text-gray-900">{v||"—"}</div>
                </div>
              ))}
            </div>

            {/* Desenho da estamparia */}
            <div>
              <SH>Posicionamento da estampa</SH>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-dashed border-gray-300 rounded-xl bg-gray-50 aspect-[4/3] flex items-center justify-center">
                  <div className="text-center p-4">
                    <svg className="mx-auto mb-2 text-gray-300" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                    <p className="text-xs text-gray-400">Frente</p>
                  </div>
                </div>
                <div className="border border-dashed border-gray-300 rounded-xl bg-gray-50 aspect-[4/3] flex items-center justify-center">
                  <div className="text-center p-4">
                    <svg className="mx-auto mb-2 text-gray-300" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                    <p className="text-xs text-gray-400">Costas</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Técnica de estamparia */}
            <div>
              <SH>Técnica de estamparia</SH>
              <TBL heads={["#","Técnica","Variante 01","Variante 02","Variante 03","Variante 04"]}>
                {(f.estamparia?.tecnicas||[{num:"1",tecnica:f.estamparia?.tecnica||"SILK ZERO TOQUE"}]).map((t:any,i:number)=>(
                  <tr key={i}>
                    <td className="text-gray-400">{t.num || i+1}</td>
                    <td className="font-medium">{t.tecnica||"—"}</td>
                    <td>{t.var01||"—"}</td><td>{t.var02||"—"}</td>
                    <td>{t.var03||"—"}</td><td>{t.var04||"—"}</td>
                  </tr>
                ))}
                {(!f.estamparia?.tecnicas || f.estamparia.tecnicas.length === 0) && !f.estamparia?.tecnica && <Empty cols={6}/>}
              </TBL>
            </div>

            {/* Observações */}
            <div>
              <SH>Observações</SH>
              <div className="bg-gray-50 rounded-xl p-4 min-h-[60px] text-sm text-gray-600">
                {f.estamparia?.observacoes || "Sem observações de estamparia"}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* ── Helpers ── */
function SH({children}:{children:React.ReactNode}) {
  return <div className="text-sm font-bold text-gray-900 pb-2 mb-3 border-b border-gray-200">{children}</div>;
}

function TBL({heads,children}:{heads:string[];children:React.ReactNode}) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
      <table className="plm-table w-full">
        <thead><tr>{heads.map(h=><th key={h}>{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Empty({cols}:{cols:number}) {
  return <tr><td colSpan={cols} className="py-5 text-center text-gray-400 text-sm">Nenhum registro</td></tr>;
}

function Chip({children}:{children:React.ReactNode}) {
  return <span className="text-[11px] font-medium bg-gray-100 px-2 py-0.5 rounded whitespace-nowrap">{children}</span>;
}

function CostCard({title,items}:{title:string;items:[string,number][]}) {
  return (
    <div className="bg-gray-50 rounded-xl p-5">
      <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-gray-400 mb-3">{title}</div>
      {items.map(([label,val],i)=>{
        const isLast = i === items.length-1;
        const isTotal = label.startsWith("Total") || label.startsWith("MKP");
        return (
          <div key={label} className={`flex justify-between py-1 text-sm ${isTotal?"font-bold border-t border-gray-200 mt-1.5 pt-2.5":"text-gray-500"}`}>
            <span className={isTotal?"text-gray-900":""}>{label}</span>
            <span className="tabular-nums text-gray-900">{val>0?`R$ ${val.toFixed(2)}`:"—"}</span>
          </div>
        );
      })}
    </div>
  );
}
