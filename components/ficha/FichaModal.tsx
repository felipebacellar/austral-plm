"use client";
import { useState, useRef } from "react";
import { uploadImage } from "@/lib/storage";
import { saveFichaImagem } from "@/lib/db";
import { SAMPLE_CAD, TABELA_PONTOS } from "@/lib/sample-data";

type Props = { row: any; onClose: () => void; onSave: (row: any) => void };
const SB: Record<string,string> = {"MOSTRUÁRIO LIBERADO":"bg-emerald-50 text-emerald-700","PRODUÇÃO LIBERADA":"bg-blue-50 text-blue-700","DESENVOLVIMENTO":"bg-amber-50 text-amber-700","CANCELADO":"bg-red-50 text-red-700","Aguardando":"bg-amber-50 text-amber-700","LIBERADO":"bg-emerald-50 text-emerald-700","LIBERADO COM RESTRIÇÃO":"bg-amber-50 text-amber-700"};

export default function FichaModal({ row, onClose, onSave }: Props) {
  const [tab, setTab] = useState<"ficha"|"estamparia"|"liberacao">("ficha");
  const [image, setImage] = useState<string|null>(row.ficha?.imagem_url||null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const f = row.ficha || {tecidos:[],aviamentos:[],pilotagem:[{num:"Piloto 1",lacre:"",envio:"",receb:"",prova:"",status:""},{num:"Piloto 2",lacre:"",envio:"",receb:"",prova:"",status:""},{num:"Piloto 3",lacre:"",envio:"",receb:"",prova:"",status:""}],estamparia:{tecnicas:[]}};
  const [tecidos, setTecidos] = useState<any[]>(f.tecidos||[]);
  const [aviamentos, setAviamentos] = useState<any[]>(f.aviamentos||[]);
  const [showAvPicker, setShowAvPicker] = useState(false);
  const [avSearch, setAvSearch] = useState("");
  const avTotal = aviamentos.reduce((s:number,a:any)=>s+(a.valor*a.qtd),0);
  const corOpts = SAMPLE_CAD.cor.map((c:any)=>`${c.cod} - ${c.nome}`);

  // Ficha de liberação state
  const tabMedidas = row.tab_medidas || "";
  const pontos = TABELA_PONTOS[tabMedidas] || [];
  const [provas, setProvas] = useState<Record<string,{p1:string,p2:string,p3:string}>>(()=>{
    const init:any={};pontos.forEach((p:any)=>{init[p.cod]={p1:"",p2:"",p3:""};});return init;
  });
  const [anotacoes, setAnotacoes] = useState({p1:"",p2:"",p3:""});
  const [videoLinks, setVideoLinks] = useState({p1:"",p2:"",p3:""});

  const handleImg = async (e:any,field:string,setter:(u:string)=>void)=>{
    const file=e.target.files?.[0];if(!file)return;
    setUploading(true);
    const url=await uploadImage(file,`${row.ref}/${field}`);
    if(url){setter(url);if(row.ficha?.id)await saveFichaImagem(row.ficha.id,field,url);}
    setUploading(false);
  };

  // Save ficha edits back to parent
  const save = () => {
    const updated = {...row, ficha:{...f, tecidos, aviamentos, imagem_url:image}};
    onSave(updated);
  };

  const updateTecidoCor = (ti:number,ci:number,val:string)=>{
    const next = tecidos.map((t:any,i:number)=>{if(i!==ti)return t;const c=[...(t.cores||[])];while(c.length<4)c.push("");c[ci]=val;return{...t,cores:c};});
    setTecidos(next);
  };
  const updateAv = (idx:number,field:string,val:any)=>setAviamentos(prev=>prev.map((a,i)=>i===idx?{...a,[field]:val}:a));
  const removeAv = (idx:number)=>setAviamentos(prev=>prev.filter((_,i)=>i!==idx));
  const addAviamento = (av:any)=>{setAviamentos(prev=>[...prev,{item:av.nome,cod:av.cod,qtd:1,valor:av.preco,local:"",var01:"",var02:"",var03:"",var04:""}]);setShowAvPicker(false);setAvSearch("");};
  const filteredAvCad = avSearch?SAMPLE_CAD.aviamento.filter((a:any)=>(a.cod+a.nome).toLowerCase().includes(avSearch.toLowerCase())):SAMPLE_CAD.aviamento;

  const getDif = (tabela:string,medido:string)=>{if(!medido)return"";const t=parseFloat(tabela),m=parseFloat(medido);if(isNaN(t)||isNaN(m))return"";const d=m-t;return d===0?"0":d>0?`+${d.toFixed(1)}`:d.toFixed(1);};
  const getDifCls = (tabela:string,medido:string)=>{if(!medido)return"";const d=parseFloat(medido)-parseFloat(tabela);if(isNaN(d))return"";return Math.abs(d)>1?"text-red-500 font-bold":d===0?"text-emerald-600":"text-amber-600";};

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 overflow-y-auto bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-[980px] shadow-2xl overflow-hidden" onClick={e=>e.stopPropagation()}>
        {/* Tab bar */}
        <div className="flex items-center justify-between px-6 pt-4 pb-3">
          <div className="flex gap-0.5 bg-gray-100 rounded-lg p-[3px]">
            {([["ficha","Ficha técnica"],["estamparia","Estamparia"],["liberacao","Ficha de liberação"]] as const).map(([id,label])=>(
              <button key={id} onClick={()=>setTab(id)} className={`px-4 py-1.5 rounded-md text-[13px] transition-all ${tab===id?"font-semibold bg-white text-gray-900 shadow-sm":"text-gray-500"}`}>{label}</button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            {uploading&&<span className="text-xs text-[#007AFF] animate-pulse">Salvando...</span>}
            <button onClick={save} className="text-[13px] font-semibold text-white bg-[#007AFF] hover:opacity-90 px-4 py-1.5 rounded-lg">Salvar</button>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
        </div>

        {/* ═══ FICHA TÉCNICA ═══ */}
        {tab==="ficha"&&(
          <div className="px-6 pb-8">
            <div className="bg-[#1e3a5f] text-white rounded-t-xl px-5 py-2.5 flex items-center justify-between mt-1">
              <span className="text-[13px] font-bold">FICHA TÉCNICA</span>
              <span className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-white/20">{row.piloto_most||"MOSTRUÁRIO"}</span>
              <div className="text-[12px]"><span className="text-white/60">Coleção:</span> <span className="font-semibold">{row.colecao}</span></div>
            </div>
            <div className="border border-t-0 border-gray-200 rounded-b-xl overflow-hidden mb-4">
              <div className="grid grid-cols-2 text-[13px]"><F l="Referência" v={row.ref}/><F l="Descrição" v={row.desc}/><F l="Tecido" v={row.tecido}/><F l="Forn. tecido" v={row.forn_tecido}/><F l="Operação" v={row.operacao}/><F l="Fornecedor" v={row.fornecedor}/><F l="Estilista" v={row.estilista}/><F l="Tab. medidas" v={row.tab_medidas}/></div>
              <div className="grid grid-cols-4 text-[13px]"><F l="Drop" v={row.drop}/><F l="Grade" v={row.grade}/><F l="Lavagem" v={row.lavagem}/><F l="Linha" v={row.linha}/></div>
              <div className="border-t border-gray-200"/>
              <div className="grid grid-cols-3 text-[13px]"><F l="Grupo" v={row.grupo}/><F l="Subgrupo" v={row.subgrupo}/><F l="Categoria" v={row.categoria}/><F l="Subcategoria" v={row.subcategoria}/><F l="Tipo" v={row.tipo}/><div/></div>
            </div>
            <ImgUp image={image} inputRef={fileRef} label="Desenho técnico" sub="Clique para enviar" aspect="aspect-[16/9] max-h-[380px]" onChange={e=>handleImg(e,"imagem_url",setImage)}/>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e=>handleImg(e,"imagem_url",setImage)}/>

            {/* Tecidos com variantes dropdown */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-4 overflow-x-auto">
              <table className="w-full text-[13px] border-collapse"><thead><tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400"><th className="text-left px-3 py-2">Artigo</th><th className="text-left px-2 py-2 w-24">Fornec.</th><th className="text-center px-2 py-2 w-16">Preço</th><th className="text-center px-2 py-2 w-36">Var 01</th><th className="text-center px-2 py-2 w-36">Var 02</th><th className="text-center px-2 py-2 w-36">Var 03</th><th className="text-center px-2 py-2 w-36">Var 04</th></tr></thead>
                <tbody>{tecidos.map((t:any,ti:number)=>{const cores=t.cores||["","","",""];while(cores.length<4)cores.push("");return(
                  <tr key={ti} className="border-b border-gray-100"><td className="px-3 py-2"><span className="text-gray-400 text-[11px] mr-1">Tec.{String(ti+1).padStart(2,"0")}</span><span className="font-medium">{t.artigo}</span></td><td className="px-2 py-2">{t.forn}</td><td className="px-2 py-2 tabular-nums text-center">{t.preco>0?t.preco.toFixed(2):"—"}</td>
                    {cores.slice(0,4).map((cor:string,ci:number)=>(<td key={ci} className="px-1 py-1.5"><select value={cor} onChange={e=>updateTecidoCor(ti,ci,e.target.value)} className={`w-full text-[12px] px-1.5 py-1 rounded-lg border outline-none cursor-pointer ${cor?"border-[#007AFF] bg-blue-50/40 text-[#007AFF] font-medium":"border-gray-200 bg-white text-gray-400"}`}><option value="">Selecionar cor</option>{corOpts.map(c=><option key={c} value={c}>{c}</option>)}</select></td>))}</tr>);})}</tbody>
              </table>
            </div>

            {/* Custos */}
            <div className="grid grid-cols-[1fr_1.5fr] gap-4 mb-4">
              <div className="border border-gray-200 rounded-xl overflow-hidden"><div className="bg-[#acb9ca] text-[#051441] text-[11px] font-bold px-3 py-1.5 grid grid-cols-2"><span>Mão de obra</span><span>Prod. acabado</span></div><div className="text-[13px] px-3 py-1.5">{([["M.P.",0,"Custo",0],["Avios.",avTotal,"Total",0],["Total",avTotal,"",0]] as any[]).map(([l1,v1,l2,v2]:any,i:number)=>(<div key={i} className={`grid grid-cols-2 py-0.5 ${l1==="Total"?"border-t border-gray-200 font-bold mt-1 pt-1":""}`}><div className="flex justify-between pr-4"><span className="text-gray-500">{l1}:</span><span className="tabular-nums">{v1>0?v1.toFixed(2):"—"}</span></div>{l2&&<div className="flex justify-between"><span className="text-gray-500">{l2}:</span><span className="tabular-nums">{v2>0?v2.toFixed(2):"—"}</span></div>}</div>))}</div></div>
              <div><div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Observações</div><div className="border border-gray-200 rounded-xl p-3 min-h-[80px] text-[13px] text-gray-600 bg-gray-50">{f.observacoes||"—"}</div></div>
            </div>

            {/* Aviamentação */}
            <div className="border-t-4 border-[#1e3a5f] pt-4 mt-6">
              <div className="bg-[#1e3a5f] text-white rounded-xl px-5 py-2.5 flex items-center justify-between mb-3"><div><span className="text-[13px] font-bold">AVIAMENTAÇÃO</span></div><div className="text-[12px]"><span className="text-white/60">Coleção:</span> <span className="font-semibold">{row.colecao}</span></div></div>
              <div className="border border-gray-200 rounded-xl overflow-hidden mb-3 overflow-x-auto">
                <table className="w-full text-[13px] border-collapse"><thead><tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400"><th className="text-left px-3 py-2">Matéria prima</th><th className="text-left px-2 py-2 w-24">Código</th><th className="text-center px-2 py-2 w-12">Qtd</th><th className="text-right px-2 py-2 w-16">Valor</th><th className="text-left px-2 py-2">Localização</th><th className="text-center px-2 py-2 w-28">Var 01</th><th className="text-center px-2 py-2 w-28">Var 02</th><th className="text-center px-2 py-2 w-28">Var 03</th><th className="text-center px-2 py-2 w-28">Var 04</th><th className="w-8"></th></tr></thead>
                  <tbody>{aviamentos.map((a:any,i:number)=>(<tr key={i} className="border-b border-gray-100"><td className="px-3 py-1.5 font-medium">{a.item}</td><td className="px-2 py-1.5 font-mono text-[11px] text-gray-500">{a.cod}</td><td className="px-1 py-1.5 text-center"><input type="number" value={a.qtd} onChange={e=>updateAv(i,"qtd",parseInt(e.target.value)||1)} className="w-10 text-center text-[13px] border border-gray-200 rounded px-1 py-0.5 outline-none"/></td><td className="px-2 py-1.5 text-right tabular-nums">{a.valor>0?a.valor.toFixed(2):"—"}</td><td className="px-1 py-1.5"><input type="text" value={a.local} onChange={e=>updateAv(i,"local",e.target.value)} className="w-full text-[12px] border border-gray-200 rounded px-2 py-0.5 outline-none" placeholder="Localização..."/></td>{["var01","var02","var03","var04"].map(vk=>(<td key={vk} className="px-1 py-1.5"><select value={a[vk]||""} onChange={e=>updateAv(i,vk,e.target.value)} className="w-full text-[11px] border border-gray-200 rounded px-1 py-0.5 outline-none bg-white"><option value="">—</option>{corOpts.map(c=><option key={c} value={c}>{c}</option>)}<option value="BRANCO">BRANCO</option><option value="CRU">CRU</option><option value="PRETO">PRETO</option></select></td>))}<td className="px-1 text-center"><button onClick={()=>removeAv(i)} className="text-gray-400 hover:text-red-500 text-sm">×</button></td></tr>))}
                    {aviamentos.length>0&&<tr className="border-t border-gray-300 font-bold"><td colSpan={3} className="px-3 py-2">Total</td><td className="px-2 py-2 text-right tabular-nums">R$ {avTotal.toFixed(2)}</td><td colSpan={6}/></tr>}
                  </tbody></table>
              </div>
              {!showAvPicker?<button onClick={()=>setShowAvPicker(true)} className="text-[13px] font-semibold text-[#007AFF] bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl mb-4">+ Adicionar aviamento</button>:(
                <div className="border border-blue-200 rounded-xl p-3 mb-4 bg-blue-50/30"><div className="flex gap-2 mb-2"><input type="text" value={avSearch} onChange={e=>setAvSearch(e.target.value)} placeholder="Buscar aviamento..." className="flex-1 text-[13px] px-3 py-2 rounded-lg border border-gray-200 bg-white outline-none" autoFocus/><button onClick={()=>{setShowAvPicker(false);setAvSearch("");}} className="text-[13px] text-gray-500 px-2">Cancelar</button></div><div className="max-h-[200px] overflow-y-auto rounded-lg border border-gray-200 bg-white">{filteredAvCad.map((a:any)=>(<button key={a.cod} onClick={()=>addAviamento(a)} className="w-full text-left px-3 py-2 text-[13px] hover:bg-blue-50 border-b border-gray-100 flex justify-between"><span><span className="font-mono text-[11px] text-gray-500 mr-2">{a.cod}</span><span className="font-medium">{a.nome}</span></span><span className="tabular-nums text-gray-500">{a.preco>0?`R$ ${a.preco.toFixed(2)}`:"—"}</span></button>))}</div></div>
              )}
            </div>
          </div>
        )}

        {/* ═══ ESTAMPARIA ═══ */}
        {tab==="estamparia"&&(
          <div className="px-6 pb-8">
            <div className="bg-[#1e3a5f] text-white rounded-xl px-5 py-2.5 flex items-center justify-between mt-1 mb-4"><span className="text-[13px] font-bold">ESTAMPARIA</span><div className="text-[12px]"><span className="text-white/60">Coleção:</span> <span className="font-semibold">{row.colecao}</span></div></div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {["Frente","Costas"].map(side=>(<div key={side} className="border border-dashed border-gray-300 rounded-xl bg-gray-50 aspect-[4/3] flex items-center justify-center"><div className="text-center p-4"><svg className="mx-auto mb-2 text-gray-300" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><p className="text-sm text-gray-400 font-medium">{side}</p></div></div>))}
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
              <div className="bg-gray-50 border-b border-gray-200"><div className="grid grid-cols-[60px_2fr_1fr_1fr_1fr_1fr] text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 py-2"><span>#</span><span>Técnica</span><span className="text-center">Var 01</span><span className="text-center">Var 02</span><span className="text-center">Var 03</span><span className="text-center">Var 04</span></div></div>
              {(f.estamparia?.tecnicas||[]).length>0?(f.estamparia.tecnicas.map((t:any,i:number)=>(<div key={i} className="grid grid-cols-[60px_2fr_1fr_1fr_1fr_1fr] text-[13px] px-3 py-2 border-b border-gray-100"><span className="text-gray-400">{t.num||i+1}</span><span className="font-medium">{t.tecnica||"—"}</span><span className="text-center">{t.var01||"—"}</span><span className="text-center">{t.var02||"—"}</span><span className="text-center">{t.var03||"—"}</span><span className="text-center">{t.var04||"—"}</span></div>))):<div className="px-3 py-5 text-sm text-gray-400 text-center">Nenhuma técnica</div>}
            </div>
          </div>
        )}

        {/* ═══ FICHA DE LIBERAÇÃO ═══ */}
        {tab==="liberacao"&&(
          <div className="px-6 pb-8">
            <div className="bg-[#1e3a5f] text-white rounded-t-xl px-5 py-2.5 flex items-center justify-between mt-1">
              <span className="text-[13px] font-bold">TABELA DE MEDIDAS — LIBERAÇÃO</span>
              <div className="text-[12px]"><span className="text-white/60">Coleção:</span> <span className="font-semibold">{row.colecao}</span></div>
            </div>
            <div className="border border-t-0 border-gray-200 rounded-b-xl overflow-hidden mb-4">
              <div className="grid grid-cols-2 text-[13px]"><F l="Referência" v={row.ref}/><F l="Descrição" v={row.desc}/><F l="Tabela base" v={tabMedidas}/><F l="Tamanho" v="M"/><F l="Tecido" v={row.tecido}/><F l="Fornecedor" v={row.fornecedor}/><F l="Estilista" v={row.estilista}/><F l="Grade" v={row.grade}/></div>
            </div>

            {!tabMedidas ? (
              <div className="border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-400">
                <p className="text-lg font-medium mb-2">Nenhuma tabela de medidas selecionada</p>
                <p className="text-sm">Selecione uma tabela de medidas na coluna "Tab. medidas" da tabela de desenvolvimento</p>
              </div>
            ) : (
              <>
                {/* Measurement table with editable proofs */}
                <div className="border border-gray-200 rounded-xl overflow-hidden mb-4 overflow-x-auto">
                  <table className="w-full text-[13px] border-collapse">
                    <thead>
                      <tr className="bg-gray-50"><th colSpan={3}/><th/><th colSpan={2} className="text-center text-[10px] font-bold uppercase tracking-wider text-[#007AFF] py-1 border-b border-blue-100">Prova 1</th><th colSpan={2} className="text-center text-[10px] font-bold uppercase tracking-wider text-gray-400 py-1 border-b border-gray-200">Prova 2</th><th colSpan={2} className="text-center text-[10px] font-bold uppercase tracking-wider text-gray-400 py-1 border-b border-gray-200">Prova 3</th><th/></tr>
                      <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <th className="text-center px-2 py-2 w-12">Cód</th><th className="text-left px-3 py-2">Descrição</th><th className="text-center px-2 py-2 w-16">Tabela</th>
                        <th className="text-center px-2 py-2 w-16 bg-blue-50/30 text-[#007AFF]">Medidas</th><th className="text-center px-2 py-2 w-14 bg-blue-50/30 text-[#007AFF]">Dif.</th>
                        <th className="text-center px-2 py-2 w-16">Medidas</th><th className="text-center px-2 py-2 w-14">Dif.</th>
                        <th className="text-center px-2 py-2 w-16">Medidas</th><th className="text-center px-2 py-2 w-14">Dif.</th>
                        <th className="text-center px-2 py-2 w-24">Tolerância</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pontos.map((p:any)=>{const pv=provas[p.cod]||{p1:"",p2:"",p3:""};return(
                        <tr key={p.cod} className="border-b border-gray-100 hover:bg-gray-50/50">
                          <td className="text-center px-2 py-2 font-bold text-gray-400">{p.cod}</td>
                          <td className="px-3 py-2 font-medium">{p.desc}</td>
                          <td className="text-center px-2 py-2 tabular-nums font-semibold">{p.tabela}</td>
                          {(["p1","p2","p3"] as const).map(pk=>{const val=pv[pk];const dif=getDif(p.tabela,val);const cls=getDifCls(p.tabela,val);return(
                            <><td key={pk} className={`px-1 py-1.5 ${pk==="p1"?"bg-blue-50/20":""}`}><input type="text" value={val} onChange={e=>{const nv={...provas};nv[p.cod]={...pv,[pk]:e.target.value};setProvas(nv);}} className="w-14 text-center text-[13px] tabular-nums border border-gray-200 rounded px-1 py-0.5 outline-none focus:border-[#007AFF]" placeholder="—"/></td>
                              <td key={pk+"d"} className={`text-center px-1 py-2 tabular-nums text-[12px] ${cls} ${pk==="p1"?"bg-blue-50/20":""}`}>{dif||"—"}</td></>
                          );})}
                          <td className="text-center px-2 py-2 text-[12px] text-gray-500">{p.tol}</td>
                        </tr>
                      );})}
                    </tbody>
                  </table>
                </div>

                {/* Modo de medir + modelo */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {["Modo de medir","Modelo"].map(label=>(
                    <div key={label}><div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{label}</div><div className="border border-dashed border-gray-300 rounded-xl bg-gray-50 aspect-[4/3] flex items-center justify-center"><div className="text-center p-3"><svg className="mx-auto mb-1 text-gray-300" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><p className="text-xs text-gray-400">{label}</p></div></div></div>
                  ))}
                </div>

                {/* Comentários de prova */}
                <div className="space-y-3 mb-4">
                  {([["p1","Prova 1"],["p2","Prova 2"],["p3","Prova 3"]] as const).map(([pk,label])=>(
                    <div key={pk} className="border border-gray-200 rounded-xl p-4">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Anotações — {label}</div>
                      <textarea value={anotacoes[pk]} onChange={e=>setAnotacoes(prev=>({...prev,[pk]:e.target.value}))} placeholder="Anotações da prova..." className="w-full text-[13px] border border-gray-200 rounded-lg p-2 outline-none resize-none h-16 focus:border-[#007AFF]"/>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[11px] text-gray-400">Link do vídeo:</span>
                        <input type="text" value={videoLinks[pk]} onChange={e=>setVideoLinks(prev=>({...prev,[pk]:e.target.value}))} placeholder="https://..." className="flex-1 text-[12px] border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-[#007AFF]"/>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function F({l,v}:{l:string;v:any}){return<div className="flex items-baseline gap-2 px-3 py-1.5 border-b border-r border-gray-100"><span className="text-[11px] text-gray-400 whitespace-nowrap">{l}:</span><span className="text-[13px] font-medium text-gray-900">{v||"—"}</span></div>;}
function ImgUp({image,inputRef,label,sub,aspect,onChange}:{image:string|null;inputRef:any;label:string;sub?:string;aspect:string;onChange:(e:any)=>void}){return(<div className={`border border-gray-200 rounded-xl overflow-hidden mb-4 bg-gray-50 cursor-pointer hover:border-blue-300 transition-colors ${aspect}`} onClick={()=>inputRef.current?.click()}><div className="w-full h-full flex items-center justify-center">{image?<img src={image} alt={label} className="w-full h-full object-contain p-2"/>:(<div className="text-center p-4"><svg className="mx-auto mb-2 text-gray-300" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><p className="text-sm text-gray-400 font-medium">{label}</p>{sub&&<p className="text-xs text-gray-300 mt-0.5">{sub}</p>}</div>)}</div></div>);}
