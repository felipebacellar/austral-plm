"use client";

import { useState, useRef } from "react";
import { uploadImage } from "@/lib/storage";
import { saveFichaImagem } from "@/lib/db";
import { SAMPLE_CAD } from "@/lib/sample-data";

type Props = { row: any; onClose: () => void };
const SB: Record<string,string> = {"MOSTRUÁRIO LIBERADO":"bg-emerald-50 text-emerald-700","PRODUÇÃO LIBERADA":"bg-blue-50 text-blue-700","DESENVOLVIMENTO":"bg-amber-50 text-amber-700","CANCELADO":"bg-red-50 text-red-700","Aguardando":"bg-amber-50 text-amber-700"};

export default function FichaModal({ row, onClose }: Props) {
  const [tab, setTab] = useState<"ficha"|"estamparia">("ficha");
  const [image, setImage] = useState<string|null>(row.ficha?.imagem_url||null);
  const [imgFrente, setImgFrente] = useState<string|null>(null);
  const [imgCostas, setImgCostas] = useState<string|null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const fileFRef = useRef<HTMLInputElement>(null);
  const fileCRef = useRef<HTMLInputElement>(null);

  const f = row.ficha || {tabelaMedidas:"",ncm:"",observacoes:"",obsFechamento:"",tecidos:[],aviamentos:[],pilotagem:[{num:"Piloto 1",lacre:"",envio:"",receb:"",prova:"",status:""},{num:"Piloto 2",lacre:"",envio:"",receb:"",prova:"",status:""},{num:"Piloto 3",lacre:"",envio:"",receb:"",prova:"",status:""}],qtdMostruario:{},estamparia:{tecnica:"",observacoes:"",tecnicas:[]}};

  // Editable aviamentos state
  const [aviamentos, setAviamentos] = useState<any[]>(f.aviamentos || []);
  const [showAvPicker, setShowAvPicker] = useState(false);
  const [avSearch, setAvSearch] = useState("");
  const avTotal = aviamentos.reduce((s:number,a:any)=>s+(a.valor*a.qtd),0);

  // Available colors from cadastro
  const corOptions = SAMPLE_CAD.cor.map((c:any) => `${c.cod} - ${c.nome}`);

  const handleUpload = async (file:File,field:string,setter:(u:string)=>void)=>{
    setUploading(true);
    const url = await uploadImage(file,`${row.ref}/${field}`);
    if(url){setter(url);if(row.ficha?.id)await saveFichaImagem(row.ficha.id,field,url);}
    setUploading(false);
  };
  const handleImg=(e:any,field:string,setter:(u:string)=>void)=>{const file=e.target.files?.[0];if(file)handleUpload(file,field,setter);};

  const addAviamento = (av: any) => {
    setAviamentos(prev => [...prev, { item: av.nome, cod: av.cod, qtd: 1, valor: av.preco, local: "", var01: "", var02: "", var03: "", var04: "" }]);
    setShowAvPicker(false);
    setAvSearch("");
  };

  const updateAv = (idx: number, field: string, val: any) => {
    setAviamentos(prev => prev.map((a, i) => i === idx ? { ...a, [field]: val } : a));
  };

  const removeAv = (idx: number) => {
    setAviamentos(prev => prev.filter((_, i) => i !== idx));
  };

  const filteredAvCad = avSearch
    ? SAMPLE_CAD.aviamento.filter((a:any) => (a.cod + a.nome).toLowerCase().includes(avSearch.toLowerCase()))
    : SAMPLE_CAD.aviamento;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 overflow-y-auto bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-[960px] shadow-2xl overflow-hidden" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-4 pb-3">
          <div className="flex gap-0.5 bg-gray-100 rounded-lg p-[3px]">
            {([["ficha","Ficha técnica"],["estamparia","Estamparia"]] as const).map(([id,label])=>(
              <button key={id} onClick={()=>setTab(id)} className={`px-4 py-1.5 rounded-md text-[13px] transition-all ${tab===id?"font-semibold bg-white text-gray-900 shadow-sm":"text-gray-500"}`}>{label}</button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            {uploading&&<span className="text-xs text-[#007AFF] animate-pulse">Salvando...</span>}
            <button onClick={()=>window.print()} className="text-[13px] font-medium text-[#007AFF] hover:bg-blue-50 px-3 py-1.5 rounded-lg">Exportar PDF</button>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
        </div>

        {tab==="ficha"&&(
          <div className="px-6 pb-8">
            {/* Header */}
            <div className="bg-[#1e3a5f] text-white rounded-t-xl px-5 py-2.5 flex items-center justify-between mt-1">
              <span className="text-[13px] font-bold">FICHA TÉCNICA</span>
              <span className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-white/20">{row.piloto_most||"MOSTRUÁRIO"}</span>
              <div className="text-[12px]"><span className="text-white/60">Coleção:</span> <span className="font-semibold">{row.colecao}</span></div>
            </div>
            <div className="border border-t-0 border-gray-200 rounded-b-xl overflow-hidden mb-4">
              <div className="grid grid-cols-2 text-[13px]">
                <F l="Referência" v={row.ref}/><F l="Descrição" v={row.desc}/>
                <F l="Data" v={new Date().toLocaleDateString("pt-BR")}/><F l="Operação" v={row.operacao}/>
                <F l="Estilista" v={row.estilista}/><F l="Fornecedor" v={row.fornecedor}/>
              </div>
              <div className="grid grid-cols-3 text-[13px]"><F l="Drop" v={row.drop}/><F l="Grade" v={row.grade}/><div/></div>
              <div className="border-t border-gray-200"/>
              <div className="grid grid-cols-3 text-[13px]">
                <F l="Grupo" v={row.grupo}/><F l="Subgrupo" v={row.subgrupo}/><F l="Linha" v={row.linha}/>
                <F l="Categoria" v={row.categoria}/><F l="Subcategoria" v={row.subcategoria}/><F l="Tipo" v={row.tipo}/>
              </div>
            </div>

            {/* Desenho */}
            <ImgUp image={image} inputRef={fileRef} label="Desenho técnico" sub="Clique para enviar" aspect="aspect-[16/9] max-h-[380px]" onChange={e=>handleImg(e,"imagem_url",setImage)}/>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e=>handleImg(e,"imagem_url",setImage)}/>

            {/* Tecidos */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-4 overflow-x-auto">
              <table className="w-full text-[13px] border-collapse">
                <thead><tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="text-left px-3 py-2">Artigo</th><th className="text-left px-2 py-2">Fornec.</th><th className="px-2 py-2">Preço</th><th className="text-left px-2 py-2">Localiz.</th>
                  <th className="text-center px-2 py-2">Var 01</th><th className="text-center px-2 py-2">Var 02</th><th className="text-center px-2 py-2">Var 03</th><th className="text-center px-2 py-2">Var 04</th>
                </tr></thead>
                <tbody>{f.tecidos.length>0?f.tecidos.map((t:any,i:number)=>(
                  <tr key={i} className="border-b border-gray-100">
                    <td className="px-3 py-2"><span className="text-gray-400 text-[11px] mr-1">Tec.{String(i+1).padStart(2,"0")}</span><span className="font-medium">{t.artigo}</span></td>
                    <td className="px-2 py-2">{t.forn}</td><td className="px-2 py-2 tabular-nums text-center">{t.preco>0?t.preco.toFixed(2):"—"}</td><td className="px-2 py-2 text-gray-500 text-xs">{t.localizacao||"—"}</td>
                    {(t.cores||[]).slice(0,4).map((c:string,j:number)=><td key={j} className="px-2 py-2 text-center text-[12px]">{c}</td>)}
                    {Array.from({length:Math.max(0,4-(t.cores||[]).length)}).map((_,j)=><td key={`e${j}`} className="text-center text-gray-300">—</td>)}
                  </tr>
                )):<tr><td colSpan={8} className="py-5 text-center text-gray-400">Nenhum tecido</td></tr>}</tbody>
              </table>
            </div>

            {/* Custos */}
            <div className="grid grid-cols-[1fr_1.5fr_1.5fr] gap-4 mb-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">NCM: {f.ncm||"—"}</div>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-[#acb9ca] text-[#051441] text-[11px] font-bold px-3 py-1.5 grid grid-cols-2"><span>Mão de obra</span><span>Prod. acabado</span></div>
                  <div className="text-[13px] px-3 py-1.5">
                    {([["M.P.",row.custo_forn||row.custoForn||0,"Custo",row.custo_total||row.custoTotal||0],["M.O.",0,"Avios.",avTotal],["Avios.",avTotal,"Total",row.custo_total||row.custoTotal||0],["Total",(row.custo_forn||row.custoForn||0)+avTotal,"",0]] as any[]).map(([l1,v1,l2,v2]:any,i:number)=>(
                      <div key={i} className={`grid grid-cols-2 py-0.5 ${l1==="Total"?"border-t border-gray-200 font-bold mt-1 pt-1":""}`}>
                        <div className="flex justify-between pr-4"><span className="text-gray-500">{l1}:</span><span className="tabular-nums">{v1>0?v1.toFixed(2):"—"}</span></div>
                        {l2&&<div className="flex justify-between"><span className="text-gray-500">{l2}:</span><span className="tabular-nums">{v2>0?v2.toFixed(2):"—"}</span></div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div><div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Observações</div><div className="border border-gray-200 rounded-xl p-3 min-h-[100px] text-[13px] text-gray-600 bg-gray-50">{f.observacoes||"—"}</div></div>
              <div><div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Tabela de medidas</div><div className="border border-gray-200 rounded-xl p-3 min-h-[100px] text-[13px] font-medium bg-gray-50">{f.tabelaMedidas||"—"}</div></div>
            </div>

            {/* ═══ AVIAMENTAÇÃO ═══ */}
            <div className="border-t-4 border-[#1e3a5f] pt-4 mt-6">
              <div className="bg-[#1e3a5f] text-white rounded-t-xl px-5 py-2.5 flex items-center justify-between">
                <div><span className="text-[13px] font-bold">FICHA TÉCNICA</span><span className="text-white/60 mx-2">—</span><span className="text-[13px] font-bold">AVIAMENTAÇÃO</span></div>
                <div className="text-[12px]"><span className="text-white/60">Coleção:</span> <span className="font-semibold">{row.colecao}</span></div>
              </div>
              <div className="border border-t-0 border-gray-200 px-4 py-2 text-[13px] text-gray-500 rounded-b-xl mb-3">{row.ref} · {row.desc} · {row.estilista} · {row.fornecedor}</div>

              <div className="border border-gray-200 rounded-xl overflow-hidden mb-3 overflow-x-auto">
                <table className="w-full text-[13px] border-collapse">
                  <thead><tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    <th className="text-left px-3 py-2">Matéria prima</th><th className="text-left px-2 py-2 w-24">Código</th><th className="text-center px-2 py-2 w-12">Qtd</th><th className="text-right px-2 py-2 w-16">Valor</th>
                    <th className="text-left px-2 py-2">Localização</th>
                    <th className="text-center px-2 py-2 w-28">Var 01</th><th className="text-center px-2 py-2 w-28">Var 02</th><th className="text-center px-2 py-2 w-28">Var 03</th><th className="text-center px-2 py-2 w-28">Var 04</th>
                    <th className="w-8"></th>
                  </tr></thead>
                  <tbody>
                    {aviamentos.map((a:any,i:number)=>(
                      <tr key={i} className="border-b border-gray-100">
                        <td className="px-3 py-1.5 font-medium">{a.item}</td>
                        <td className="px-2 py-1.5 font-mono text-[11px] text-gray-500">{a.cod}</td>
                        <td className="px-1 py-1.5 text-center"><input type="number" value={a.qtd} onChange={e=>updateAv(i,"qtd",parseInt(e.target.value)||1)} className="w-10 text-center text-[13px] border border-gray-200 rounded px-1 py-0.5 outline-none"/></td>
                        <td className="px-2 py-1.5 text-right tabular-nums">{a.valor>0?a.valor.toFixed(2):"—"}</td>
                        <td className="px-1 py-1.5"><input type="text" value={a.local} onChange={e=>updateAv(i,"local",e.target.value)} className="w-full text-[12px] border border-gray-200 rounded px-2 py-0.5 outline-none" placeholder="Localização..."/></td>
                        {["var01","var02","var03","var04"].map(vk=>(
                          <td key={vk} className="px-1 py-1.5">
                            <select value={a[vk]||""} onChange={e=>updateAv(i,vk,e.target.value)} className="w-full text-[11px] border border-gray-200 rounded px-1 py-0.5 outline-none bg-white">
                              <option value="">—</option>
                              {corOptions.map(c=><option key={c} value={c}>{c}</option>)}
                              <option value="BRANCO">BRANCO</option>
                              <option value="CRU">CRU</option>
                              <option value="PRETO">PRETO</option>
                            </select>
                          </td>
                        ))}
                        <td className="px-1 py-1.5 text-center"><button onClick={()=>removeAv(i)} className="text-gray-400 hover:text-red-500 text-sm">×</button></td>
                      </tr>
                    ))}
                    {aviamentos.length>0&&(
                      <tr className="border-t border-gray-300 font-bold"><td colSpan={3} className="px-3 py-2">Total</td><td className="px-2 py-2 text-right tabular-nums">R$ {avTotal.toFixed(2)}</td><td colSpan={6}/></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add aviamento button / picker */}
              {!showAvPicker ? (
                <button onClick={()=>setShowAvPicker(true)} className="text-[13px] font-semibold text-[#007AFF] bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors mb-4">
                  + Adicionar aviamento
                </button>
              ) : (
                <div className="border border-blue-200 rounded-xl p-3 mb-4 bg-blue-50/30">
                  <div className="flex gap-2 mb-2 items-center">
                    <input type="text" value={avSearch} onChange={e=>setAvSearch(e.target.value)} placeholder="Buscar aviamento por código ou nome..." className="flex-1 text-[13px] px-3 py-2 rounded-lg border border-gray-200 bg-white outline-none" autoFocus/>
                    <button onClick={()=>{setShowAvPicker(false);setAvSearch("");}} className="text-[13px] text-gray-500 hover:text-gray-700 px-2">Cancelar</button>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto rounded-lg border border-gray-200 bg-white">
                    {filteredAvCad.map((a:any)=>(
                      <button key={a.cod} onClick={()=>addAviamento(a)} className="w-full text-left px-3 py-2 text-[13px] hover:bg-blue-50 border-b border-gray-100 flex justify-between items-center transition-colors">
                        <span><span className="font-mono text-[11px] text-gray-500 mr-2">{a.cod}</span><span className="font-medium">{a.nome}</span></span>
                        <span className="tabular-nums text-gray-500">{a.preco>0?`R$ ${a.preco.toFixed(2)}`:"—"}</span>
                      </button>
                    ))}
                    {filteredAvCad.length===0&&<div className="px-3 py-4 text-center text-gray-400 text-sm">Nenhum aviamento encontrado</div>}
                  </div>
                </div>
              )}

              {/* Pilotagem */}
              <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                <div className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 py-2">Liberação de pilotagem</div>
                <table className="w-full text-[13px] border-collapse">
                  <thead><tr className="text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-200">
                    <th className="text-left px-3 py-2">Nº piloto</th><th className="text-left px-2 py-2">Lacre</th><th className="text-left px-2 py-2">Data envio</th><th className="text-left px-2 py-2">Data receb.</th><th className="text-left px-2 py-2">Data prova</th><th className="text-left px-2 py-2">Status</th>
                  </tr></thead>
                  <tbody>{(f.pilotagem||[]).map((p:any,i:number)=>(
                    <tr key={i} className="border-b border-gray-100"><td className="px-3 py-2 font-medium">{p.num}</td><td className="px-2 py-2 text-gray-500">{p.lacre||"—"}</td><td className="px-2 py-2 text-gray-500">{p.envio||"—"}</td><td className="px-2 py-2 text-gray-500">{p.receb||"—"}</td><td className="px-2 py-2 text-gray-500">{p.prova||"—"}</td>
                      <td className="px-2 py-2">{p.status?<span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${SB[p.status]||"bg-gray-100 text-gray-500"}`}>{p.status}</span>:"—"}</td></tr>
                  ))}</tbody>
                </table>
              </div>
              <div className="border border-gray-200 rounded-xl p-3 text-[13px]"><span className="font-bold text-gray-700">Obs. fechamento de custo: </span><span className="text-gray-500">{f.obsFechamento||"—"}</span></div>
            </div>
          </div>
        )}

        {tab==="estamparia"&&(
          <div className="px-6 pb-8">
            <div className="bg-[#1e3a5f] text-white rounded-t-xl px-5 py-2.5 flex items-center justify-between mt-1">
              <span className="text-[13px] font-bold">FICHA TÉCNICA DE ESTAMPARIA</span>
              <span className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-white/20">{row.piloto_most||"MOSTRUÁRIO"}</span>
              <div className="text-[12px]"><span className="text-white/60">Coleção:</span> <span className="font-semibold">{row.colecao}</span></div>
            </div>
            <div className="border border-t-0 border-gray-200 rounded-b-xl overflow-hidden mb-4">
              <div className="grid grid-cols-2 text-[13px]"><F l="Referência" v={row.ref}/><F l="Descrição" v={row.desc}/><F l="Operação" v={row.operacao}/><F l="Fornecedor" v={row.fornecedor}/><F l="Estilista" v={row.estilista}/><F l="Grade" v={row.grade}/></div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><ImgUp image={imgFrente} inputRef={fileFRef} label="Frente" aspect="aspect-[4/3]" onChange={e=>handleImg(e,"imagem_estampa_frente",setImgFrente)}/><input ref={fileFRef} type="file" accept="image/*" className="hidden" onChange={e=>handleImg(e,"imagem_estampa_frente",setImgFrente)}/></div>
              <div><ImgUp image={imgCostas} inputRef={fileCRef} label="Costas" aspect="aspect-[4/3]" onChange={e=>handleImg(e,"imagem_estampa_costas",setImgCostas)}/><input ref={fileCRef} type="file" accept="image/*" className="hidden" onChange={e=>handleImg(e,"imagem_estampa_costas",setImgCostas)}/></div>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
              <div className="bg-gray-50 border-b border-gray-200"><div className="grid grid-cols-[60px_2fr_1fr_1fr_1fr_1fr] text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 py-2"><span>#</span><span>Técnica</span><span className="text-center">Var 01</span><span className="text-center">Var 02</span><span className="text-center">Var 03</span><span className="text-center">Var 04</span></div></div>
              {(f.estamparia?.tecnicas||[]).length>0?(f.estamparia.tecnicas.map((t:any,i:number)=>(<div key={i} className="grid grid-cols-[60px_2fr_1fr_1fr_1fr_1fr] text-[13px] px-3 py-2 border-b border-gray-100"><span className="text-gray-400">{t.num||i+1}</span><span className="font-medium">{t.tecnica||"—"}</span><span className="text-center">{t.var01||"—"}</span><span className="text-center">{t.var02||"—"}</span><span className="text-center">{t.var03||"—"}</span><span className="text-center">{t.var04||"—"}</span></div>))):<div className="px-3 py-5 text-sm text-gray-400 text-center">Nenhuma técnica</div>}
            </div>
            <div className="border border-gray-200 rounded-xl p-3 text-[13px]"><span className="font-bold text-gray-700">Observações: </span><span className="text-gray-500">{f.estamparia?.observacoes||"—"}</span></div>
          </div>
        )}
      </div>
    </div>
  );
}

function F({l,v}:{l:string;v:any}){return<div className="flex items-baseline gap-2 px-3 py-1.5 border-b border-r border-gray-100"><span className="text-[11px] text-gray-400 whitespace-nowrap">{l}:</span><span className="text-[13px] font-medium text-gray-900">{v||"—"}</span></div>;}
function ImgUp({image,inputRef,label,sub,aspect,onChange}:{image:string|null;inputRef:any;label:string;sub?:string;aspect:string;onChange:(e:any)=>void}){return(<div className={`border border-gray-200 rounded-xl overflow-hidden mb-4 bg-gray-50 cursor-pointer hover:border-blue-300 transition-colors ${aspect}`} onClick={()=>inputRef.current?.click()}><div className="w-full h-full flex items-center justify-center">{image?<img src={image} alt={label} className="w-full h-full object-contain p-2"/>:(<div className="text-center p-4"><svg className="mx-auto mb-2 text-gray-300" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><p className="text-sm text-gray-400 font-medium">{label}</p>{sub&&<p className="text-xs text-gray-300 mt-0.5">{sub}</p>}</div>)}</div></div>);}
