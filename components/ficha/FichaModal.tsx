"use client";

import { useState, useRef } from "react";

type Props = { row: any; onClose: () => void };

const SB = { "MOSTRUÁRIO LIBERADO":"bg-emerald-50 text-emerald-700", "PRODUÇÃO LIBERADA":"bg-blue-50 text-blue-700", "DESENVOLVIMENTO":"bg-amber-50 text-amber-700", "CANCELADO":"bg-red-50 text-red-700", "Aguardando":"bg-amber-50 text-amber-700" };

export default function FichaModal({ row, onClose }: Props) {
  const [tab, setTab] = useState<"ficha"|"estamparia">("ficha");
  const [image, setImage] = useState<string|null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const f = row.ficha || { tabelaMedidas:"",ncm:"",observacoes:"",obsFechamento:"",tecidos:[],aviamentos:[],pilotagem:[{num:"Piloto 1",lacre:"",envio:"",receb:"",prova:"",status:""},{num:"Piloto 2",lacre:"",envio:"",receb:"",prova:"",status:""},{num:"Piloto 3",lacre:"",envio:"",receb:"",prova:"",status:""}],qtdMostruario:{},estamparia:{tecnica:"",observacoes:"",tecnicas:[]} };
  const avTotal = f.aviamentos.reduce((s:number,a:any)=>s+(a.valor*a.qtd),0);
  const handleImage = (e:any) => { const file=e.target.files?.[0]; if(!file)return; const r=new FileReader(); r.onload=(ev)=>setImage(ev.target?.result as string); r.readAsDataURL(file); };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 overflow-y-auto bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-[960px] shadow-2xl overflow-hidden" onClick={e=>e.stopPropagation()}>

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-4 pb-3 print:hidden">
          <div className="flex gap-0.5 bg-gray-100 rounded-lg p-[3px]">
            {([["ficha","Ficha técnica"],["estamparia","Estamparia"]] as const).map(([id,label])=>(
              <button key={id} onClick={()=>setTab(id)} className={`px-4 py-1.5 rounded-md text-[13px] transition-all ${tab===id?"font-semibold bg-white text-gray-900 shadow-sm":"text-gray-500"}`}>{label}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={()=>window.print()} className="text-[13px] font-medium text-[#007AFF] hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">Exportar PDF</button>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        {/* ═══ ABA 1: FICHA TÉCNICA ═══ */}
        {tab === "ficha" && (
          <div className="px-6 pb-8">

            {/* Header bar — mimics Excel row 2 */}
            <div className="bg-[#1e3a5f] text-white rounded-t-xl px-5 py-2.5 flex items-center justify-between mt-2">
              <span className="text-[13px] font-bold tracking-wide">FICHA TÉCNICA</span>
              <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full ${row.piloto_most==="PILOTO"?"bg-white/20":"bg-white/20"}`}>{row.piloto_most || "MOSTRUÁRIO"}</span>
              <div className="flex items-center gap-2 text-[12px]">
                <span className="text-white/60">Coleção:</span>
                <span className="font-semibold">{row.colecao}</span>
              </div>
            </div>

            {/* Dados do cabeçalho — mimics rows 4-9 */}
            <div className="border border-t-0 border-gray-200 rounded-b-xl overflow-hidden mb-4">
              <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-0 text-[13px]">
                <Field label="Referência" value={row.ref} />
                <Field label="Descrição" value={row.desc} span />
                <Field label="Data atualiz." value={new Date().toLocaleDateString("pt-BR")} />
                <Field label="Operação" value={row.operacao} />
                <Field label="Drop" value={row.drop} small />
                <div/>
                <Field label="Estilista" value={row.estilista} />
                <Field label="Fornecedor" value={row.fornecedor} />
                <Field label="Grade" value={row.grade} small />
                <div/>
              </div>
              <div className="border-t border-gray-200"/>
              <div className="grid grid-cols-3 gap-0 text-[13px]">
                <Field label="Grupo" value={row.grupo} />
                <Field label="Subgrupo" value={row.subgrupo} />
                <Field label="Linha" value={row.linha} />
              </div>
              <div className="grid grid-cols-3 gap-0 text-[13px]">
                <Field label="Categoria" value={row.categoria} />
                <Field label="Subcategoria" value={row.subcategoria} />
                <Field label="Tipo" value={row.tipo} />
              </div>
            </div>

            {/* Desenho técnico — mimics rows 11-48 */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-4 bg-gray-50 cursor-pointer hover:border-blue-300 transition-colors" onClick={()=>fileRef.current?.click()}>
              <div className="aspect-[16/9] max-h-[400px] flex items-center justify-center">
                {image ? (
                  <img src={image} alt="Desenho técnico" className="w-full h-full object-contain p-2"/>
                ) : (
                  <div className="text-center">
                    <svg className="mx-auto mb-2 text-gray-300" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                    <p className="text-sm text-gray-400 font-medium">Desenho técnico</p>
                    <p className="text-xs text-gray-300 mt-0.5">Clique para enviar JPEG ou PNG</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage}/>
            </div>

            {/* Tecidos — mimics rows 50-55 */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
              <div className="bg-gray-50 border-b border-gray-200">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1.5fr_1fr_1fr_1fr_1fr] text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 py-2">
                  <span>Artigo</span><span>Fornec.</span><span>Preço/cons.</span><span>Código</span><span>Localiz.</span>
                  <span className="text-center">Var 01</span><span className="text-center">Var 02</span><span className="text-center">Var 03</span><span className="text-center">Var 04</span>
                </div>
                {f.tecidos.length>0 && (
                  <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1.5fr_1fr_1fr_1fr_1fr] text-[11px] text-gray-400 px-3 pb-1">
                    <span/><span/><span/><span/><span/>
                    {(f.tecidos[0]?.cores||[]).slice(0,4).map((c:string,i:number)=><span key={i} className="text-center font-medium">{row.cod_cor?`${["C02","C09","C07",""][i]} - ${c}`:c}</span>)}
                    {Array.from({length:Math.max(0,4-(f.tecidos[0]?.cores||[]).length)}).map((_,i)=><span key={`e${i}`}/>)}
                  </div>
                )}
              </div>
              {f.tecidos.map((t:any,i:number)=>(
                <div key={i}>
                  <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1.5fr_1fr_1fr_1fr_1fr] text-[13px] px-3 py-2 border-b border-gray-100 items-center">
                    <span><span className="text-gray-400 text-[11px] mr-1">Tec.{String(i+1).padStart(2,"0")}</span> <span className="font-medium">{t.artigo}</span></span>
                    <span>{t.forn}</span>
                    <span className="tabular-nums">{t.preco>0?t.preco.toFixed(2):"—"}</span>
                    <span className="text-gray-500 text-xs">{t.codigo||"—"}</span>
                    <span className="text-gray-500 text-xs">{t.localizacao||"—"}</span>
                    {(t.cores||[]).slice(0,4).map((c:string,j:number)=><span key={j} className="text-center text-[12px]">{c}</span>)}
                    {Array.from({length:Math.max(0,4-(t.cores||[]).length)}).map((_,j)=><span key={`e${j}`}/>)}
                  </div>
                  <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1.5fr_1fr_1fr_1fr_1fr] text-[11px] text-gray-400 px-3 py-1 border-b border-gray-100">
                    <span>Comp.: {t.comp||"—"}</span>
                    <span colSpan={8}/>
                  </div>
                </div>
              ))}
              {f.tecidos.length===0 && <div className="px-3 py-4 text-sm text-gray-400 text-center">Nenhum tecido cadastrado</div>}
            </div>

            {/* Qtd mostruário — mimics row 56 */}
            {f.tecidos.length>0 && f.tecidos[0]?.cores?.length>0 && (
              <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                <div className="grid grid-cols-[3fr_1fr_1fr_1fr_1fr] text-[13px] px-3 py-2 items-center">
                  <span className="font-bold text-gray-700">Quantidade de peças de mostruário:</span>
                  {f.tecidos[0].cores.slice(0,4).map((c:string,i:number)=>(
                    <span key={i} className="text-center font-bold text-lg tabular-nums">{f.qtdMostruario?.[c]||"—"}</span>
                  ))}
                </div>
              </div>
            )}

            {/* NCM + Obs + Tabela medidas + Custos — mimics rows 59-65 */}
            <div className="grid grid-cols-[1fr_1.5fr_1.5fr] gap-4 mb-4">
              {/* Custos */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">NCM: {f.ncm||"—"}</div>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-[#acb9ca] text-[#051441] text-[11px] font-bold px-3 py-1.5 grid grid-cols-2">
                    <span>Mão de obra</span><span>Prod. acabado</span>
                  </div>
                  <div className="text-[13px] px-3 py-1">
                    {([["M.P.",row.custo_forn||row.custoForn||0,"Custo",row.custo_total||row.custoTotal||0],["M.O.",0,"Avios.",avTotal],["Avios.",avTotal,"Total",row.custo_total||row.custoTotal||0],["Total",(row.custo_forn||row.custoForn||0)+avTotal,"",0]] as any[]).map(([l1,v1,l2,v2]:any,i:number)=>(
                      <div key={i} className={`grid grid-cols-2 py-0.5 ${l1==="Total"?"border-t border-gray-200 font-bold":""}`}>
                        <div className="flex justify-between pr-4"><span className="text-gray-500">{l1}:</span><span className="tabular-nums">{v1>0?v1.toFixed(2):"—"}</span></div>
                        {l2 && <div className="flex justify-between"><span className="text-gray-500">{l2}:</span><span className="tabular-nums">{v2>0?v2.toFixed(2):"—"}</span></div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Observações */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Observações</div>
                <div className="border border-gray-200 rounded-xl p-3 min-h-[100px] text-[13px] text-gray-600 bg-gray-50">{f.observacoes||"—"}</div>
              </div>
              {/* Tabela de medidas */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Tabela de medidas</div>
                <div className="border border-gray-200 rounded-xl p-3 min-h-[100px] text-[13px] font-medium bg-gray-50">{f.tabelaMedidas||"—"}</div>
              </div>
            </div>

            {/* ═══ Aviamentação section — page 2 ═══ */}
            <div className="border-t-4 border-[#1e3a5f] pt-4 mt-6">
              <div className="bg-[#1e3a5f] text-white rounded-t-xl px-5 py-2.5 flex items-center justify-between">
                <div><span className="text-[13px] font-bold tracking-wide">FICHA TÉCNICA</span><span className="text-white/60 mx-2">—</span><span className="text-[13px] font-bold">AVIAMENTAÇÃO</span></div>
                <div className="text-[12px]"><span className="text-white/60">Coleção:</span> <span className="font-semibold">{row.colecao}</span></div>
              </div>
              <div className="border border-t-0 border-gray-200 px-4 py-2 text-[13px] text-gray-500 rounded-b-xl mb-3">
                {row.ref} · {row.desc} · Estilista: {row.estilista} · Fornecedor: {row.fornecedor}
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden mb-4 overflow-x-auto">
                <table className="w-full text-[13px] border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      <th className="text-left px-3 py-2.5">Matéria prima</th>
                      <th className="text-left px-2 py-2.5">Código</th>
                      <th className="text-center px-2 py-2.5 w-12">Qtde</th>
                      <th className="text-right px-2 py-2.5 w-16">Valor</th>
                      <th className="text-left px-2 py-2.5">Localização</th>
                      <th className="text-center px-2 py-2.5 w-24">Var 01</th>
                      <th className="text-center px-2 py-2.5 w-24">Var 02</th>
                      <th className="text-center px-2 py-2.5 w-24">Var 03</th>
                      <th className="text-center px-2 py-2.5 w-24">Var 04</th>
                    </tr>
                    {f.tecidos.length>0 && (
                      <tr className="text-[11px] text-gray-400 border-b border-gray-200">
                        <th colSpan={5}/> 
                        {(f.tecidos[0]?.cores||[]).slice(0,4).map((c:string,i:number)=><th key={i} className="text-center px-2 py-1 font-medium">{c}</th>)}
                        {Array.from({length:Math.max(0,4-(f.tecidos[0]?.cores||[]).length)}).map((_,i)=><th key={`e${i}`}/>)}
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    {f.aviamentos.map((a:any,i:number)=>(
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="px-3 py-2 font-medium">{a.item}</td>
                        <td className="px-2 py-2 font-mono text-[11px] text-gray-500">{a.cod}</td>
                        <td className="px-2 py-2 text-center tabular-nums">{a.qtd}</td>
                        <td className="px-2 py-2 text-right tabular-nums">{a.valor.toFixed(2)}</td>
                        <td className="px-2 py-2 text-[12px] text-gray-500 max-w-[200px]">{a.local}</td>
                        <td className="px-2 py-2 text-center text-[12px]">{a.var01||"—"}</td>
                        <td className="px-2 py-2 text-center text-[12px]">{a.var02||"—"}</td>
                        <td className="px-2 py-2 text-center text-[12px]">{a.var03||"—"}</td>
                        <td className="px-2 py-2 text-center text-[12px]">{a.var04||"—"}</td>
                      </tr>
                    ))}
                    {f.aviamentos.length===0 && <tr><td colSpan={9} className="py-6 text-center text-gray-400">Nenhum aviamento</td></tr>}
                    {f.aviamentos.length>0 && (
                      <tr className="border-t border-gray-300 font-bold">
                        <td colSpan={3} className="px-3 py-2">Total</td>
                        <td className="px-2 py-2 text-right tabular-nums">R$ {avTotal.toFixed(2)}</td>
                        <td colSpan={5}/>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pilotagem — mimics rows 109-113 */}
              <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                <div className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 py-2">
                  Liberação de pilotagem
                </div>
                <table className="w-full text-[13px] border-collapse">
                  <thead>
                    <tr className="text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-200">
                      <th className="text-left px-3 py-2">Nº piloto</th>
                      <th className="text-left px-2 py-2">Lacre</th>
                      <th className="text-left px-2 py-2">Data de envio</th>
                      <th className="text-left px-2 py-2">Data de receb.</th>
                      <th className="text-left px-2 py-2">Data de prova</th>
                      <th className="text-left px-2 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(f.pilotagem||[]).map((p:any,i:number)=>(
                      <tr key={i} className="border-b border-gray-100">
                        <td className="px-3 py-2 font-medium">{p.num}</td>
                        <td className="px-2 py-2 text-gray-500">{p.lacre||"—"}</td>
                        <td className="px-2 py-2 text-gray-500">{p.envio||"—"}</td>
                        <td className="px-2 py-2 text-gray-500">{p.receb||"—"}</td>
                        <td className="px-2 py-2 text-gray-500">{p.prova||"—"}</td>
                        <td className="px-2 py-2">{p.status ? <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${(SB as any)[p.status]||"bg-gray-100 text-gray-500"}`}>{p.status}</span> : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Obs fechamento */}
              <div className="border border-gray-200 rounded-xl p-3 text-[13px]">
                <span className="font-bold text-gray-700">Observações de fechamento de custo: </span>
                <span className="text-gray-500">{f.obsFechamento||"—"}</span>
              </div>
            </div>
          </div>
        )}

        {/* ═══ ABA 2: ESTAMPARIA ═══ */}
        {tab === "estamparia" && (
          <div className="px-6 pb-8">
            <div className="bg-[#1e3a5f] text-white rounded-t-xl px-5 py-2.5 flex items-center justify-between mt-2">
              <span className="text-[13px] font-bold tracking-wide">FICHA TÉCNICA DE ESTAMPARIA</span>
              <span className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-white/20">{row.piloto_most||"MOSTRUÁRIO"}</span>
              <div className="text-[12px]"><span className="text-white/60">Coleção:</span> <span className="font-semibold">{row.colecao}</span></div>
            </div>
            <div className="border border-t-0 border-gray-200 rounded-b-xl overflow-hidden mb-4">
              <div className="grid grid-cols-2 text-[13px]">
                <Field label="Referência" value={row.ref}/><Field label="Descrição" value={row.desc}/>
                <Field label="Operação" value={row.operacao}/><Field label="Drop" value={row.drop}/>
                <Field label="Estilista" value={row.estilista}/><Field label="Fornecedor" value={row.fornecedor}/>
                <Field label="Grade" value={row.grade}/><div/>
              </div>
            </div>

            {/* Image areas */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {["Frente","Costas"].map(side=>(
                <div key={side} className="border border-dashed border-gray-300 rounded-xl bg-gray-50 aspect-[4/3] flex items-center justify-center">
                  <div className="text-center">
                    <svg className="mx-auto mb-2 text-gray-300" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                    <p className="text-sm text-gray-400 font-medium">{side}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Técnica */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
              <div className="bg-gray-50 border-b border-gray-200">
                <div className="grid grid-cols-[60px_2fr_1fr_1fr_1fr_1fr] text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 py-2">
                  <span>#</span><span>Técnica de estamparia</span><span className="text-center">Variante 01</span><span className="text-center">Variante 02</span><span className="text-center">Variante 03</span><span className="text-center">Variante 04</span>
                </div>
              </div>
              {(f.estamparia?.tecnicas||[]).map((t:any,i:number)=>(
                <div key={i} className="grid grid-cols-[60px_2fr_1fr_1fr_1fr_1fr] text-[13px] px-3 py-2 border-b border-gray-100">
                  <span className="text-gray-400">{t.num||i+1}</span>
                  <span className="font-medium">{t.tecnica||"—"}</span>
                  <span className="text-center">{t.var01||"—"}</span><span className="text-center">{t.var02||"—"}</span>
                  <span className="text-center">{t.var03||"—"}</span><span className="text-center">{t.var04||"—"}</span>
                </div>
              ))}
              {(!f.estamparia?.tecnicas||f.estamparia.tecnicas.length===0)&&(
                <div className="px-3 py-4 text-sm text-gray-400 text-center">Nenhuma técnica cadastrada</div>
              )}
            </div>

            <div className="border border-gray-200 rounded-xl p-3 text-[13px]">
              <span className="font-bold text-gray-700">Observações: </span>
              <span className="text-gray-500">{f.estamparia?.observacoes||"—"}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({label,value,span,small}:{label:string;value:any;span?:boolean;small?:boolean}) {
  return (
    <div className={`flex items-baseline gap-2 px-3 py-1.5 border-b border-r border-gray-100 ${small?"col-span-1":""}`}>
      <span className="text-[11px] text-gray-400 whitespace-nowrap">{label}:</span>
      <span className="text-[13px] font-medium text-gray-900 truncate">{value||"—"}</span>
    </div>
  );
}
