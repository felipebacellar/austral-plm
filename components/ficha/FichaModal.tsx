"use client";
import { useState, useRef } from "react";
import { uploadImage } from "@/lib/storage";
import { saveFichaImagem } from "@/lib/db";
import { SAMPLE_CAD, TABELA_PONTOS } from "@/lib/sample-data";

type Props={row:any;onClose:()=>void;onSave:(r:any)=>void};

export default function FichaModal({row,onClose,onSave}:Props){
  const [tab,setTab]=useState<"ficha"|"estamparia"|"liberacao">("ficha");
  const [img,setImg]=useState<string|null>(row.ficha?.imagem_url||null);
  const [up,setUp]=useState(false);
  const fr=useRef<HTMLInputElement>(null);

  const f=row.ficha||{tecidos:[],aviamentos:[],pilotagem:[{num:"Piloto 1",lacre:"",envio:"",receb:"",prova:"",status:""},{num:"Piloto 2",lacre:"",envio:"",receb:"",prova:"",status:""},{num:"Piloto 3",lacre:"",envio:"",receb:"",prova:"",status:""}],estamparia:{tecnicas:[]}};
  const [tec,setTec]=useState<any[]>(f.tecidos||[]);
  const [avi,setAvi]=useState<any[]>(f.aviamentos||[]);
  const [sap,setSap]=useState(false);const [asq,setAsq]=useState("");
  const avT=avi.reduce((s:number,a:any)=>s+(a.valor*a.qtd),0);
  const co=SAMPLE_CAD.cor.map((c:any)=>`${c.cod} - ${c.nome}`);

  const tm=row.tab_medidas||"";const pts=TABELA_PONTOS[tm]||[];
  const [pv,setPv]=useState<Record<string,{p1:string,p2:string,p3:string}>>(()=>{const i:any={};pts.forEach((p:any)=>{i[p.cod]={p1:"",p2:"",p3:""};});return i;});
  const [an,setAn]=useState({p1:"",p2:"",p3:""});const [vl,setVl]=useState({p1:"",p2:"",p3:""});

  const hi=async(e:any,fd:string,s:(u:string)=>void)=>{const file=e.target.files?.[0];if(!file)return;setUp(true);const url=await uploadImage(file,`${row.ref}/${fd}`);if(url){s(url);if(row.ficha?.id)await saveFichaImagem(row.ficha.id,fd,url);}setUp(false);};
  const save=()=>onSave({...row,ficha:{...f,tecidos:tec,aviamentos:avi,imagem_url:img}});
  const utc=(ti:number,ci:number,v:string)=>setTec(p=>p.map((t:any,i:number)=>{if(i!==ti)return t;const c=[...(t.cores||[])];while(c.length<4)c.push("");c[ci]=v;return{...t,cores:c};}));
  const ua=(i:number,k:string,v:any)=>setAvi(p=>p.map((a,j)=>j===i?{...a,[k]:v}:a));
  const ra=(i:number)=>setAvi(p=>p.filter((_,j)=>j!==i));
  const aa=(a:any)=>{setAvi(p=>[...p,{item:a.nome,cod:a.cod,qtd:1,valor:a.preco,local:"",var01:"",var02:"",var03:"",var04:""}]);setSap(false);setAsq("");};
  const fa=asq?SAMPLE_CAD.aviamento.filter((a:any)=>(a.cod+a.nome).toLowerCase().includes(asq.toLowerCase())):SAMPLE_CAD.aviamento;
  const gd=(t:string,m:string)=>{if(!m)return"";const a=parseFloat(t),b=parseFloat(m);if(isNaN(a)||isNaN(b))return"";const d=b-a;return d===0?"0":d>0?`+${d.toFixed(1)}`:d.toFixed(1);};
  const gc=(t:string,m:string)=>{if(!m)return"";const d=parseFloat(m)-parseFloat(t);if(isNaN(d))return"";return Math.abs(d)>1?"text-[var(--system-red)] font-semibold":d===0?"text-[var(--system-green)]":"text-[var(--system-orange)]";};

  return(
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8 overflow-y-auto bg-black/30 backdrop-blur-[6px]" onClick={onClose}>
      <div className="bg-[var(--bg-primary)] rounded-2xl w-full max-w-[980px] shadow-[0_24px_80px_rgba(0,0,0,0.18)] overflow-hidden" onClick={e=>e.stopPropagation()}>

        {/* Tab bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[var(--separator)]">
          <div className="seg-control">
            {([["ficha","Ficha técnica"],["estamparia","Estamparia"],["liberacao","Liberação"]] as const).map(([id,l])=>(
              <button key={id} onClick={()=>setTab(id)} className={`seg-btn ${tab===id?"active":""}`}>{l}</button>
            ))}
          </div>
          <div className="flex gap-2.5 items-center">
            {up&&<span className="text-[12px] text-[var(--system-blue)] animate-pulse font-medium">Salvando...</span>}
            <button onClick={save} className="apple-btn-primary">Salvar</button>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--label-secondary)] transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        {/* ═══ FICHA TÉCNICA ═══ */}
        {tab==="ficha"&&(<div className="px-6 py-6 space-y-5">
          {/* Header navy */}
          <div className="bg-[#1c3654] text-white rounded-xl px-5 py-3 flex items-center justify-between">
            <span className="text-[13px] font-bold tracking-[0.01em]">FICHA TÉCNICA</span>
            <span className="text-[11px] font-semibold bg-white/15 px-3 py-0.5 rounded-full">{row.piloto_most||"MOSTRUÁRIO"}</span>
            <span className="text-[12px]"><span className="text-white/50">Coleção</span> <span className="font-semibold ml-1">{row.colecao}</span></span>
          </div>

          {/* Fields grid */}
          <div className="apple-card">
            <div className="grid grid-cols-2">{([["Referência",row.ref],["Descrição",row.desc],["Tecido",row.tecido],["Forn. tecido",row.forn_tecido],["Operação",row.operacao],["Fornecedor",row.fornecedor],["Estilista",row.estilista],["Tab. medidas",row.tab_medidas]] as [string,any][]).map(([l,v])=><F key={l} l={l} v={v}/>)}</div>
            <div className="grid grid-cols-4">{([["Drop",row.drop],["Grade",row.grade],["Lavagem",row.lavagem],["Linha",row.linha]] as [string,any][]).map(([l,v])=><F key={l} l={l} v={v}/>)}</div>
            <div className="border-t border-[var(--separator)]"/>
            <div className="grid grid-cols-3">{([["Grupo",row.grupo],["Subgrupo",row.subgrupo],["Categoria",row.categoria],["Subcategoria",row.subcategoria],["Tipo",row.tipo],["—",""]] as [string,any][]).map(([l,v],i)=>l==="—"?<div key={i}/>:<F key={l} l={l} v={v}/>)}</div>
          </div>

          {/* Drawing */}
          <div className="apple-card bg-[var(--bg-secondary)] cursor-pointer hover:border-[var(--system-blue)] transition-colors" onClick={()=>fr.current?.click()}>
            <div className="aspect-[16/9] max-h-[380px] flex items-center justify-center">
              {img?<img src={img} alt="Desenho" className="w-full h-full object-contain p-3"/>:
              <div className="text-center"><svg className="mx-auto mb-2 text-[var(--label-quaternary)]" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><p className="text-[13px] text-[var(--label-tertiary)] font-medium">Desenho técnico</p><p className="text-[11px] text-[var(--label-quaternary)] mt-0.5">Clique para enviar</p></div>}
            </div>
          </div>
          <input ref={fr} type="file" accept="image/*" className="hidden" onChange={e=>hi(e,"imagem_url",setImg)}/>

          {/* Tecidos + variantes */}
          <div className="apple-card overflow-x-auto">
            <table className="plm-table">
              <thead><tr><th className="px-4">Artigo</th><th className="w-24">Fornec.</th><th className="text-center w-16">Preço</th><th className="text-center w-[140px]">Var 01</th><th className="text-center w-[140px]">Var 02</th><th className="text-center w-[140px]">Var 03</th><th className="text-center w-[140px]">Var 04</th></tr></thead>
              <tbody>{tec.map((t:any,ti:number)=>{const cs=t.cores||["","","",""];while(cs.length<4)cs.push("");return(
                <tr key={ti}><td className="px-4"><span className="text-[var(--label-tertiary)] text-[11px] mr-1.5">Tec.{String(ti+1).padStart(2,"0")}</span><span className="font-semibold">{t.artigo}</span></td><td>{t.forn}</td><td className="text-center tabnum">{t.preco>0?t.preco.toFixed(2):"—"}</td>
                  {cs.slice(0,4).map((c:string,ci:number)=>(<td key={ci} className="px-1.5 py-1.5"><select value={c} onChange={e=>utc(ti,ci,e.target.value)} className={`w-full text-[12px] px-2 py-1.5 rounded-lg border outline-none cursor-pointer transition-all ${c?"border-[var(--system-blue)] bg-[rgba(0,122,255,0.06)] text-[var(--system-blue)] font-medium":"border-[var(--separator-opaque)] text-[var(--label-quaternary)]"}`}><option value="">Selecionar</option>{co.map(x=><option key={x} value={x}>{x}</option>)}</select></td>))}</tr>);})}
              </tbody>
            </table>
          </div>

          {/* Custos */}
          <div className="grid grid-cols-[1fr_1.5fr] gap-4">
            <div className="apple-card overflow-hidden"><div className="bg-[#b8c5d4] text-[#0a1f3a] text-[11px] font-bold px-4 py-2 grid grid-cols-2"><span>Mão de obra</span><span>Prod. acabado</span></div><div className="text-[13px] px-4 py-2 space-y-0.5">{([["M.P.",0,"Custo",0],["Avios.",avT,"Total",0],["Total",avT,"",0]] as any[]).map(([l1,v1,l2,v2]:any,i:number)=>(<div key={i} className={`grid grid-cols-2 py-0.5 ${l1==="Total"?"border-t border-[var(--separator)] font-bold mt-1 pt-1.5":""}`}><div className="flex justify-between pr-4"><span className="text-[var(--label-secondary)]">{l1}:</span><span className="tabnum">{v1>0?v1.toFixed(2):"—"}</span></div>{l2&&<div className="flex justify-between"><span className="text-[var(--label-secondary)]">{l2}:</span><span className="tabnum">{v2>0?v2.toFixed(2):"—"}</span></div>}</div>))}</div></div>
            <div><div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--label-secondary)] mb-1.5">Observações</div><div className="apple-card p-4 min-h-[90px] text-[13px] text-[var(--label-secondary)] bg-[var(--bg-secondary)]">{f.observacoes||"—"}</div></div>
          </div>

          {/* ═══ AVIAMENTAÇÃO ═══ */}
          <div className="pt-5 border-t-2 border-[#1c3654]">
            <div className="bg-[#1c3654] text-white rounded-xl px-5 py-3 flex items-center justify-between mb-4">
              <span className="text-[13px] font-bold">AVIAMENTAÇÃO</span>
              <span className="text-[12px]"><span className="text-white/50">Coleção</span> <span className="font-semibold ml-1">{row.colecao}</span></span>
            </div>

            <div className="apple-card overflow-x-auto mb-3">
              <table className="plm-table">
                <thead><tr><th className="px-4">Matéria prima</th><th className="w-24">Código</th><th className="text-center w-12">Qtd</th><th className="text-right w-16">Valor</th><th className="min-w-[200px]">Localização</th><th className="text-center w-28">Var 01</th><th className="text-center w-28">Var 02</th><th className="text-center w-28">Var 03</th><th className="text-center w-28">Var 04</th><th className="w-8"></th></tr></thead>
                <tbody>{avi.map((a:any,i:number)=>(<tr key={i}>
                  <td className="font-medium px-4">{a.item}</td>
                  <td className="font-mono text-[11px] text-[var(--label-secondary)]">{a.cod}</td>
                  <td className="text-center px-1"><input type="number" value={a.qtd} onChange={e=>ua(i,"qtd",parseInt(e.target.value)||1)} className="w-11 text-center text-[13px] border border-[var(--separator-opaque)] rounded-md px-1 py-1 outline-none"/></td>
                  <td className="text-right tabnum">{a.valor>0?a.valor.toFixed(2):"—"}</td>
                  <td className="px-1 py-1"><textarea value={a.local} onChange={e=>ua(i,"local",e.target.value)} rows={2} className="w-full text-[12px] border border-[var(--separator-opaque)] rounded-lg px-2.5 py-1.5 outline-none resize-none leading-tight" placeholder="Localização..."/></td>
                  {["var01","var02","var03","var04"].map(k=>(<td key={k} className="px-1 py-1"><select value={a[k]||""} onChange={e=>ua(i,k,e.target.value)} className="w-full text-[11px] border border-[var(--separator-opaque)] rounded-md px-1.5 py-1 outline-none"><option value="">—</option>{co.map(c=><option key={c} value={c}>{c}</option>)}<option value="BRANCO">BRANCO</option><option value="CRU">CRU</option><option value="PRETO">PRETO</option></select></td>))}
                  <td className="text-center"><button onClick={()=>ra(i)} className="text-[var(--label-quaternary)] hover:text-[var(--system-red)] transition-colors">×</button></td>
                </tr>))}
                {avi.length>0&&<tr className="border-t border-[var(--separator-opaque)]"><td colSpan={3} className="px-4 py-2.5 font-bold">Total</td><td className="text-right tabnum font-bold py-2.5">R$ {avT.toFixed(2)}</td><td colSpan={6}/></tr>}
                </tbody>
              </table>
            </div>

            {!sap?<button onClick={()=>setSap(true)} className="apple-btn-secondary mb-4">+ Adicionar aviamento</button>:(
              <div className="apple-card p-3.5 mb-4 bg-[rgba(0,122,255,0.03)] border-[var(--system-blue)]">
                <div className="flex gap-2 mb-2"><input type="text" value={asq} onChange={e=>setAsq(e.target.value)} placeholder="Buscar aviamento..." className="apple-input flex-1" autoFocus/><button onClick={()=>{setSap(false);setAsq("");}} className="text-[13px] text-[var(--label-secondary)] px-2">Cancelar</button></div>
                <div className="max-h-[200px] overflow-y-auto apple-card">{fa.map((a:any)=>(<button key={a.cod} onClick={()=>aa(a)} className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-[var(--bg-secondary)] border-b border-[var(--separator)] flex justify-between transition-colors"><span><span className="font-mono text-[11px] text-[var(--label-tertiary)] mr-2">{a.cod}</span><span className="font-medium">{a.nome}</span></span><span className="tabnum text-[var(--label-secondary)]">{a.preco>0?`R$ ${a.preco.toFixed(2)}`:"—"}</span></button>))}{fa.length===0&&<div className="px-4 py-6 text-center text-[var(--label-tertiary)]">Nenhum encontrado</div>}</div>
              </div>
            )}

            {/* Pilotagem */}
            <div className="apple-card overflow-hidden">
              <div className="bg-[var(--bg-secondary)] text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--label-secondary)] px-4 py-2.5">Liberação de pilotagem</div>
              <table className="plm-table"><thead><tr><th className="px-4">Nº piloto</th><th>Lacre</th><th>Data envio</th><th>Data receb.</th><th>Data prova</th><th>Status</th></tr></thead>
                <tbody>{(f.pilotagem||[]).map((p:any,i:number)=>(<tr key={i}><td className="font-medium px-4">{p.num}</td><td className="text-[var(--label-secondary)]">{p.lacre||"—"}</td><td className="text-[var(--label-secondary)]">{p.envio||"—"}</td><td className="text-[var(--label-secondary)]">{p.receb||"—"}</td><td className="text-[var(--label-secondary)]">{p.prova||"—"}</td><td>{p.status?<span className={`pill ${p.status==="Aguardando"?"pill-orange":"pill-green"}`}>{p.status}</span>:"—"}</td></tr>))}</tbody>
              </table>
            </div>
          </div>
        </div>)}

        {/* ═══ ESTAMPARIA ═══ */}
        {tab==="estamparia"&&(<div className="px-6 py-6 space-y-5">
          <div className="bg-[#1c3654] text-white rounded-xl px-5 py-3 flex items-center justify-between"><span className="text-[13px] font-bold">ESTAMPARIA</span><span className="text-[12px]"><span className="text-white/50">Coleção</span> <span className="font-semibold ml-1">{row.colecao}</span></span></div>
          <div className="grid grid-cols-2 gap-5">{["Frente","Costas"].map(s=>(<div key={s} className="apple-card bg-[var(--bg-secondary)] aspect-[4/3] flex items-center justify-center"><div className="text-center"><svg className="mx-auto mb-2 text-[var(--label-quaternary)]" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><p className="text-[13px] text-[var(--label-tertiary)] font-medium">{s}</p></div></div>))}</div>
          <div className="apple-card overflow-hidden"><div className="bg-[var(--bg-secondary)] border-b border-[var(--separator)]"><div className="grid grid-cols-[60px_2fr_1fr_1fr_1fr_1fr] text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--label-secondary)] px-4 py-2.5"><span>#</span><span>Técnica</span><span className="text-center">Var 01</span><span className="text-center">Var 02</span><span className="text-center">Var 03</span><span className="text-center">Var 04</span></div></div>
            {(f.estamparia?.tecnicas||[]).length>0?(f.estamparia.tecnicas.map((t:any,i:number)=>(<div key={i} className="grid grid-cols-[60px_2fr_1fr_1fr_1fr_1fr] text-[13px] px-4 py-2.5 border-b border-[var(--separator)]"><span className="text-[var(--label-tertiary)]">{t.num||i+1}</span><span className="font-medium">{t.tecnica||"—"}</span><span className="text-center">{t.var01||"—"}</span><span className="text-center">{t.var02||"—"}</span><span className="text-center">{t.var03||"—"}</span><span className="text-center">{t.var04||"—"}</span></div>))):<div className="px-4 py-8 text-center text-[var(--label-tertiary)]">Nenhuma técnica</div>}
          </div>
        </div>)}

        {/* ═══ LIBERAÇÃO ═══ */}
        {tab==="liberacao"&&(<div className="px-6 py-6 space-y-5">
          <div className="bg-[#1c3654] text-white rounded-xl px-5 py-3 flex items-center justify-between"><span className="text-[13px] font-bold">TABELA DE MEDIDAS — LIBERAÇÃO</span><span className="text-[12px]"><span className="text-white/50">Coleção</span> <span className="font-semibold ml-1">{row.colecao}</span></span></div>
          <div className="apple-card"><div className="grid grid-cols-2">{([["Referência",row.ref],["Descrição",row.desc],["Tabela base",tm],["Tamanho","M"],["Tecido",row.tecido],["Fornecedor",row.fornecedor],["Estilista",row.estilista],["Grade",row.grade]] as [string,any][]).map(([l,v])=><F key={l} l={l} v={v}/>)}</div></div>

          {!tm?(<div className="apple-card p-16 text-center"><p className="text-[16px] font-medium text-[var(--label-secondary)] mb-1">Nenhuma tabela selecionada</p><p className="text-[13px] text-[var(--label-tertiary)]">Selecione em "Tab. medidas" na tabela de desenvolvimento</p></div>):(
            <>
            <div className="apple-card overflow-x-auto">
              <table className="plm-table">
                <thead>
                  <tr><th colSpan={3} className="border-b-0"/><th colSpan={2} className="text-center !text-[var(--system-blue)] border-b border-blue-100 !bg-[rgba(0,122,255,0.04)] py-1.5">Prova 1</th><th colSpan={2} className="text-center border-b py-1.5">Prova 2</th><th colSpan={2} className="text-center border-b py-1.5">Prova 3</th><th className="border-b-0"/></tr>
                  <tr><th className="text-center w-12">Cód</th><th>Descrição</th><th className="text-center w-16">Tabela</th>
                    <th className="text-center w-16 !bg-[rgba(0,122,255,0.04)] !text-[var(--system-blue)]">Med.</th><th className="text-center w-14 !bg-[rgba(0,122,255,0.04)] !text-[var(--system-blue)]">Dif.</th>
                    <th className="text-center w-16">Med.</th><th className="text-center w-14">Dif.</th>
                    <th className="text-center w-16">Med.</th><th className="text-center w-14">Dif.</th>
                    <th className="text-center w-24">Tol.</th></tr>
                </thead>
                <tbody>{pts.map((p:any)=>{const v=pv[p.cod]||{p1:"",p2:"",p3:""};return(
                  <tr key={p.cod}>
                    <td className="text-center font-bold text-[var(--label-secondary)] px-3">{p.cod}</td>
                    <td className="font-medium px-3">{p.desc}</td>
                    <td className="text-center tabnum font-semibold px-2">{p.tabela}</td>
                    {(["p1","p2","p3"] as const).map(pk=>{const val=v[pk];const d=gd(p.tabela,val);const cl=gc(p.tabela,val);return[
                      <td key={pk} className={`px-1 py-1 ${pk==="p1"?"bg-[rgba(0,122,255,0.02)]":""}`}><input type="text" value={val} onChange={e=>{const n={...pv};n[p.cod]={...v,[pk]:e.target.value};setPv(n);}} className="w-14 text-center text-[13px] tabnum border border-[var(--separator-opaque)] rounded-md px-1 py-1 outline-none focus:border-[var(--system-blue)]" placeholder="—"/></td>,
                      <td key={pk+"d"} className={`text-center tabnum text-[12px] ${cl} ${pk==="p1"?"bg-[rgba(0,122,255,0.02)]":""}`}>{d||"—"}</td>
                    ];})}
                    <td className="text-center text-[12px] text-[var(--label-secondary)] px-2">{p.tol}</td>
                  </tr>);})}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-5">{["Modo de medir","Modelo"].map(l=>(
              <div key={l}><div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--label-secondary)] mb-1.5">{l}</div><div className="apple-card bg-[var(--bg-secondary)] aspect-[4/3] flex items-center justify-center"><div className="text-center"><svg className="mx-auto mb-1 text-[var(--label-quaternary)]" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><p className="text-[12px] text-[var(--label-tertiary)]">{l}</p></div></div></div>
            ))}</div>

            <div className="space-y-3">{(["p1","p2","p3"] as const).map((pk,i)=>(
              <div key={pk} className="apple-card p-4"><div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--label-secondary)] mb-2">Anotações — Prova {i+1}</div>
                <textarea value={an[pk]} onChange={e=>setAn(p=>({...p,[pk]:e.target.value}))} placeholder="Anotações..." className="apple-input w-full resize-none h-14 mb-2"/>
                <div className="flex items-center gap-2"><span className="text-[11px] text-[var(--label-tertiary)]">Vídeo:</span><input type="text" value={vl[pk]} onChange={e=>setVl(p=>({...p,[pk]:e.target.value}))} placeholder="https://..." className="apple-input flex-1 text-[12px]"/></div>
              </div>
            ))}</div>
            </>
          )}
        </div>)}
      </div>
    </div>
  );
}

function F({l,v}:{l:string;v:any}){return<div className="flex items-baseline gap-2.5 px-4 py-2 border-b border-r border-[var(--separator)]"><span className="text-[11px] text-[var(--label-secondary)] whitespace-nowrap font-medium">{l}:</span><span className="text-[13px] font-semibold">{v||"—"}</span></div>;}
