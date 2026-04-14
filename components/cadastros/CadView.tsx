"use client";
import { useState } from "react";
import { SAMPLE_CAD } from "@/lib/sample-data";

const TABS=[{k:"grupo",l:"Grupo"},{k:"subgrupo",l:"Subgrupo"},{k:"categoria",l:"Categoria"},{k:"subcategoria",l:"Subcategoria"},{k:"linha",l:"Linha"},{k:"grade",l:"Grade"},{k:"operacao",l:"Operação"},{k:"tipo",l:"Tipo"},{k:"fornecedor",l:"Fornecedor"},{k:"drop",l:"Drop"},{k:"colecao",l:"Coleção"},{k:"status",l:"Status"},{k:"piloto_most",l:"Piloto / mostr."},{k:"estilista",l:"Estilista"},{k:"cor",l:"Cores"},{k:"aviamento",l:"Aviamentos"},{k:"tecido",l:"Tecidos"}];

export default function CadView(){
  const [cad,setCad]=useState<any>(SAMPLE_CAD);const [m,setM]=useState("grupo");const [val,setVal]=useState("");
  const [tn,setTn]=useState("");const [tf,setTf]=useState("");const [tc,setTc]=useState("");const [tp,setTp]=useState("");
  const [cc,setCc]=useState("");const [cn,setCn]=useState("");
  const [ac,setAc]=useState("");const [an,setAn]=useState("");const [ap,setAp]=useState("");const [sr,setSr]=useState("");
  const iS=!["tecido","cor","aviamento"].includes(m);const items=iS?(cad[m]||[]):[];const info=TABS.find(t=>t.k===m);
  const addS=()=>{const v=val.trim().toUpperCase();if(v&&!items.includes(v)){setCad((p:any)=>({...p,[m]:[...p[m],v]}));setVal("");}};
  const remS=(x:string)=>setCad((p:any)=>({...p,[m]:p[m].filter((v:string)=>v!==x)}));
  const gc=(k:string)=>{if(k==="tecido")return cad.tecido.length;if(k==="cor")return cad.cor.length;if(k==="aviamento")return cad.aviamento.length;return(cad[k]||[]).length;};
  const fa=sr?cad.aviamento.filter((a:any)=>(a.cod+a.nome).toLowerCase().includes(sr.toLowerCase())):cad.aviamento;

  return(
    <div className="flex gap-8 min-h-[400px]">
      <div className="w-[200px] flex-shrink-0">
        <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--label-secondary)] px-3 mb-2">Cadastros</div>
        <nav className="flex flex-col gap-0.5">{TABS.map(t=>{const c=gc(t.k);const on=m===t.k;return(
          <button key={t.k} onClick={()=>{setM(t.k);setSr("");}} className={`flex justify-between items-center px-3 py-[7px] rounded-lg text-[13px] text-left transition-all ${on?"font-semibold bg-[rgba(0,122,255,0.08)] text-[var(--system-blue)]":"text-[var(--label-primary)] hover:bg-[var(--bg-secondary)]"}`}>
            <span>{t.l}</span><span className={`text-[11px] tabnum ${on?"text-blue-400":"text-[var(--label-tertiary)] bg-[var(--bg-secondary)] px-1.5 rounded"}`}>{c}</span>
          </button>);})}</nav>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[22px] font-bold tracking-[-0.02em] mb-0.5">{info?.l}</h3>
        <p className="text-[13px] text-[var(--label-tertiary)] mb-5">{m==="aviamento"?`${cad.aviamento.length} aviamentos`:m==="cor"?`${cad.cor.length} cores`:m==="tecido"?`${cad.tecido.length} tecidos`:`${items.length} itens`}</p>

        {iS&&(<><div className="flex gap-2 mb-6"><input type="text" value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addS()} placeholder="Novo item..." className="apple-input flex-1"/><button onClick={addS} className="apple-btn-primary">Adicionar</button></div>
          <div className="flex flex-wrap gap-1.5">{items.map((x:string)=>(<span key={x} className="inline-flex items-center gap-2 bg-[var(--bg-secondary)] rounded-lg px-3.5 py-[6px] text-[13px] text-[var(--label-primary)]">{x}<button onClick={()=>remS(x)} className="text-[var(--label-quaternary)] hover:text-[var(--system-red)] text-[11px] transition-colors">×</button></span>))}</div></>)}

        {m==="cor"&&(<><div className="flex gap-2 mb-5"><input className="apple-input w-24" value={cc} onChange={e=>setCc(e.target.value)} placeholder="Código"/><input className="apple-input flex-1" value={cn} onChange={e=>setCn(e.target.value)} placeholder="Nome da cor" onKeyDown={e=>e.key==="Enter"&&(()=>{if(!cc.trim()||!cn.trim())return;setCad((p:any)=>({...p,cor:[...p.cor,{cod:cc.trim().toUpperCase(),nome:cn.trim().toUpperCase()}]}));setCc("");setCn("");})()}/><button onClick={()=>{if(!cc.trim()||!cn.trim())return;setCad((p:any)=>({...p,cor:[...p.cor,{cod:cc.trim().toUpperCase(),nome:cn.trim().toUpperCase()}]}));setCc("");setCn("");}} className="apple-btn-primary">Adicionar</button></div>
          <div className="apple-card overflow-hidden"><table className="plm-table"><thead><tr><th className="w-24">Código</th><th>Nome</th><th className="w-10"></th></tr></thead><tbody>{cad.cor.map((c:any)=>(<tr key={c.cod}><td className="font-mono text-[12px] font-bold text-[var(--label-secondary)] px-3">{c.cod}</td><td className="font-medium px-3">{c.nome}</td><td className="text-center"><button onClick={()=>setCad((p:any)=>({...p,cor:p.cor.filter((x:any)=>x.cod!==c.cod)}))} className="text-[var(--label-quaternary)] hover:text-[var(--system-red)] transition-colors">×</button></td></tr>))}</tbody></table></div></>)}

        {m==="aviamento"&&(<><div className="flex gap-2 mb-3"><input className="apple-input w-28" value={ac} onChange={e=>setAc(e.target.value)} placeholder="Código"/><input className="apple-input flex-1" value={an} onChange={e=>setAn(e.target.value)} placeholder="Nome do aviamento"/><input className="apple-input w-24" value={ap} onChange={e=>setAp(e.target.value)} placeholder="Preço"/><button onClick={()=>{if(!ac.trim()||!an.trim())return;setCad((p:any)=>({...p,aviamento:[...p.aviamento,{cod:ac.trim().toUpperCase(),nome:an.trim().toUpperCase(),preco:parseFloat(ap)||0}]}));setAc("");setAn("");setAp("");}} className="apple-btn-primary">Adicionar</button></div>
          <div className="mb-4"><input type="text" value={sr} onChange={e=>setSr(e.target.value)} placeholder="Buscar aviamento..." className="apple-input w-full"/></div>
          <div className="apple-card overflow-hidden max-h-[480px] overflow-y-auto"><table className="plm-table"><thead><tr><th className="w-28">Código</th><th>Nome</th><th className="text-right w-20">Preço</th><th className="w-10"></th></tr></thead><tbody>{fa.map((a:any)=>(<tr key={a.cod}><td className="font-mono text-[12px] text-[var(--label-secondary)] px-3">{a.cod}</td><td className="font-medium px-3">{a.nome}</td><td className="text-right tabnum px-3">{a.preco>0?`R$ ${a.preco.toFixed(2)}`:"—"}</td><td className="text-center"><button onClick={()=>setCad((p:any)=>({...p,aviamento:p.aviamento.filter((x:any)=>x.cod!==a.cod)}))} className="text-[var(--label-quaternary)] hover:text-[var(--system-red)] transition-colors">×</button></td></tr>))}</tbody></table></div>
          <p className="text-[11px] text-[var(--label-tertiary)] mt-2">{fa.length} de {cad.aviamento.length}</p></>)}

        {m==="tecido"&&(<><div className="flex gap-2 mb-5 flex-wrap"><input className="apple-input flex-[2] min-w-[150px]" value={tn} onChange={e=>setTn(e.target.value)} placeholder="Nome do tecido"/><input className="apple-input flex-1 min-w-[100px]" value={tf} onChange={e=>setTf(e.target.value)} placeholder="Fornecedor"/><input className="apple-input flex-1 min-w-[100px]" value={tc} onChange={e=>setTc(e.target.value)} placeholder="Composição"/><input className="apple-input w-20" value={tp} onChange={e=>setTp(e.target.value)} placeholder="Preço"/><button onClick={()=>{if(!tn.trim())return;setCad((p:any)=>({...p,tecido:[...p.tecido,{nome:tn.trim().toUpperCase(),forn:tf.trim(),comp:tc.trim(),preco:tp}]}));setTn("");setTf("");setTc("");setTp("");}} className="apple-btn-primary">Adicionar</button></div>
          <div className="apple-card overflow-hidden"><table className="plm-table"><thead><tr><th>Nome</th><th>Fornecedor</th><th>Composição</th><th className="text-right">Preço</th><th className="w-10"></th></tr></thead><tbody>{cad.tecido.map((t:any,i:number)=>(<tr key={i}><td className="font-medium px-3">{t.nome}</td><td className="px-3">{t.forn}</td><td className="text-[12px] text-[var(--label-secondary)] px-3">{t.comp}</td><td className="text-right tabnum px-3">{t.preco?`R$ ${Number(t.preco).toFixed(2)}`:"—"}</td><td className="text-center"><button onClick={()=>setCad((p:any)=>({...p,tecido:p.tecido.filter((x:any)=>x.nome!==t.nome)}))} className="text-[var(--label-quaternary)] hover:text-[var(--system-red)] transition-colors">×</button></td></tr>))}</tbody></table></div></>)}
      </div>
    </div>
  );
}
