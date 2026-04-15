"use client";
import { useState, useEffect } from "react";
import { fetchCadastros, addCadastro, removeCadastro, fetchTecidos, addTecido, removeTecido, fetchAviamentos, addAviamento, removeAviamento } from "@/lib/db";
import { subscribeRealtime } from "@/lib/realtime";

const TABS=[{k:"grupo",l:"Grupo"},{k:"subgrupo",l:"Subgrupo"},{k:"categoria",l:"Categoria"},{k:"subcategoria",l:"Subcategoria"},{k:"linha",l:"Linha"},{k:"grade",l:"Grade"},{k:"operacao",l:"Operação"},{k:"tipo",l:"Tipo"},{k:"fornecedor",l:"Fornecedor"},{k:"drop",l:"Drop"},{k:"colecao",l:"Coleção"},{k:"status",l:"Status"},{k:"piloto_most",l:"Piloto / mostr."},{k:"estilista",l:"Estilista"},{k:"cor",l:"Cores"},{k:"aviamento",l:"Aviamentos"},{k:"tecido",l:"Tecidos"}];

export default function CadView(){
  const [cad,setCad]=useState<Record<string,any>>({});const [tecidos,setTecidos]=useState<any[]>([]);const [aviamentos,setAviamentos]=useState<any[]>([]);
  const [m,setM]=useState("grupo");const [val,setVal]=useState("");const [loading,setLoading]=useState(true);
  const [tn,setTn]=useState("");const [tf,setTf]=useState("");const [tc,setTc]=useState("");const [tp,setTp]=useState("");
  const [cc,setCc]=useState("");const [cn,setCn]=useState("");
  const [ac,setAc]=useState("");const [an,setAn]=useState("");const [ap,setAp]=useState("");const [sr,setSr]=useState("");

  useEffect(()=>{loadAll();},[]);

  /* Realtime: sincroniza cadastros entre usuários */
  useEffect(() => {
    const unsub = subscribeRealtime("cadastros-sync", [
      { table: "cadastros", onInsert: () => fetchCadastros().then(setCad), onUpdate: () => fetchCadastros().then(setCad), onDelete: () => fetchCadastros().then(setCad) },
      { table: "tecidos", onInsert: () => fetchTecidos().then(setTecidos), onUpdate: () => fetchTecidos().then(setTecidos), onDelete: () => fetchTecidos().then(setTecidos) },
      { table: "aviamentos", onInsert: () => fetchAviamentos().then(setAviamentos), onUpdate: () => fetchAviamentos().then(setAviamentos), onDelete: () => fetchAviamentos().then(setAviamentos) },
    ]);
    return unsub;
  }, []);
  const loadAll=async()=>{setLoading(true);const [c,t,a]=await Promise.all([fetchCadastros(),fetchTecidos(),fetchAviamentos()]);setCad(c);setTecidos(t);setAviamentos(a);setLoading(false);};

  const isSpecial=["tecido","cor","aviamento"].includes(m);const items=!isSpecial?(cad[m]||[]):[];const info=TABS.find(t=>t.k===m);

  const addS=async()=>{const v=val.trim().toUpperCase();if(!v||items.includes(v))return;await addCadastro(m,v);setCad(p=>({...p,[m]:[...(p[m]||[]),v]}));setVal("");};
  const remS=async(x:string)=>{await removeCadastro(m,x);setCad(p=>({...p,[m]:(p[m]||[]).filter((v:string)=>v!==x)}));};

  const addT=async()=>{if(!tn.trim())return;const t={nome:tn.trim().toUpperCase(),forn:tf.trim(),comp:tc.trim(),preco:tp};await addTecido(t);setTecidos(p=>[...p,t]);setTn("");setTf("");setTc("");setTp("");};
  const remT=async(n:string)=>{await removeTecido(n);setTecidos(p=>p.filter(t=>t.nome!==n));};

  const addAv=async()=>{if(!ac.trim()||!an.trim())return;const a={cod:ac.trim().toUpperCase(),nome:an.trim().toUpperCase(),preco:parseFloat(ap)||0};await addAviamento(a);setAviamentos(p=>[...p,a]);setAc("");setAn("");setAp("");};
  const remAv=async(cod:string)=>{await removeAviamento(cod);setAviamentos(p=>p.filter(a=>a.cod!==cod));};

  const addCor=async()=>{if(!cc.trim()||!cn.trim())return;const nome=`${cc.trim().toUpperCase()} - ${cn.trim().toUpperCase()}`;await addCadastro("cor",nome);setCad(p=>({...p,cor:[...(p.cor||[]),nome]}));setCc("");setCn("");};
  const remCor=async(nome:string)=>{await removeCadastro("cor",nome);setCad(p=>({...p,cor:(p.cor||[]).filter((c:string)=>c!==nome)}));};

  const gc=(k:string)=>{if(k==="tecido")return tecidos.length;if(k==="aviamento")return aviamentos.length;if(k==="cor")return(cad.cor||[]).length;return(cad[k]||[]).length;};
  const fa=sr?aviamentos.filter((a:any)=>(a.cod+a.nome).toLowerCase().includes(sr.toLowerCase())):aviamentos;
  const inp="apple-input";const btn="apple-btn-primary";

  if(loading) return <div className="text-center py-20 text-[var(--label-tertiary)]">Carregando cadastros...</div>;

  return(
    <div className="flex flex-col sm:flex-row gap-5 min-h-[400px]">
      {/* Sidebar de categorias */}
      <div className="w-full sm:w-[220px] flex-shrink-0">
        <div className="apple-card p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--label-tertiary)] px-2 mb-2">Cadastros</div>
          <nav className="flex sm:flex-col gap-0.5 overflow-x-auto sm:overflow-x-visible sm:max-h-[calc(100vh-220px)] sm:overflow-y-auto">
            {TABS.map(t=>{const c=gc(t.k);const on=m===t.k;return(
              <button key={t.k} onClick={()=>{setM(t.k);setSr("");}} className={`flex justify-between items-center px-2.5 py-[7px] rounded-lg text-[13px] text-left transition-all whitespace-nowrap ${on?"font-semibold bg-[var(--system-blue)] text-white":"text-[var(--label-primary)] hover:bg-[var(--bg-secondary)]"}`}>
                <span>{t.l}</span>
                <span className={`text-[11px] tabnum ml-2 ${on?"text-white/70":"text-[var(--label-tertiary)]"}`}>{c}</span>
              </button>
            );})}
          </nav>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 min-w-0">
        <div className="apple-card">
          {/* Header do cadastro */}
          <div className="px-5 pt-5 pb-4 border-b border-[var(--separator)]">
            <div className="flex items-baseline justify-between mb-1">
              <h3 className="text-[20px] font-bold tracking-[-0.02em]">{info?.l}</h3>
              <span className="text-[12px] text-[var(--label-tertiary)] tabnum">{m==="aviamento"?`${aviamentos.length} aviamentos`:m==="cor"?`${(cad.cor||[]).length} cores`:m==="tecido"?`${tecidos.length} tecidos`:`${items.length} itens`}</span>
            </div>
          </div>

          {/* Conteúdo interno */}
          <div className="px-5 py-5">
            {/* Cadastros simples (grupo, subgrupo, etc.) */}
            {!isSpecial&&m!=="cor"&&(<>
              <div className="flex gap-2 mb-5">
                <input type="text" value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addS()} placeholder="Novo item..." className={`${inp} flex-1`}/>
                <button onClick={addS} className={btn}>Adicionar</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {items.map((x:string)=>(
                  <span key={x} className="inline-flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--separator)] rounded-lg px-3.5 py-[7px] text-[13px] font-medium transition-all hover:border-[var(--label-quaternary)]">
                    {x}
                    <button onClick={()=>remS(x)} className="text-[var(--label-quaternary)] hover:text-[var(--system-red)] text-[14px] leading-none transition-colors">×</button>
                  </span>
                ))}
                {items.length === 0 && <p className="text-[13px] text-[var(--label-tertiary)] py-8 text-center w-full">Nenhum item cadastrado</p>}
              </div>
            </>)}

            {/* Cores */}
            {m==="cor"&&(<>
              <div className="flex flex-wrap gap-2 mb-5">
                <input className={`${inp} w-24`} value={cc} onChange={e=>setCc(e.target.value)} placeholder="Código"/>
                <input className={`${inp} flex-1 min-w-[140px]`} value={cn} onChange={e=>setCn(e.target.value)} placeholder="Nome da cor" onKeyDown={e=>e.key==="Enter"&&addCor()}/>
                <button onClick={addCor} className={btn}>Adicionar</button>
              </div>
              <div className="border border-[var(--separator)] rounded-xl overflow-hidden">
                <table className="plm-table"><thead><tr><th className="px-4">Cor (Código - Nome)</th><th className="w-10"></th></tr></thead>
                <tbody>{(cad.cor||[]).map((c:string)=>(
                  <tr key={c}><td className="font-medium px-4">{c}</td><td className="text-center"><button onClick={()=>remCor(c)} className="text-[var(--label-quaternary)] hover:text-[var(--system-red)] transition-colors">×</button></td></tr>
                ))}</tbody></table>
              </div>
            </>)}

            {/* Aviamentos */}
            {m==="aviamento"&&(<>
              <div className="flex flex-wrap gap-2 mb-3">
                <input className={`${inp} w-28`} value={ac} onChange={e=>setAc(e.target.value)} placeholder="Código"/>
                <input className={`${inp} flex-1 min-w-[120px]`} value={an} onChange={e=>setAn(e.target.value)} placeholder="Nome"/>
                <input className={`${inp} w-24`} value={ap} onChange={e=>setAp(e.target.value)} placeholder="Preço"/>
                <button onClick={addAv} className={btn}>Adicionar</button>
              </div>
              <div className="mb-4">
                <input type="text" value={sr} onChange={e=>setSr(e.target.value)} placeholder="Buscar aviamento..." className={`${inp} w-full`}/>
              </div>
              <div className="border border-[var(--separator)] rounded-xl overflow-hidden max-h-[480px] overflow-y-auto overscroll-y-contain">
                <table className="plm-table"><thead><tr><th className="w-28 px-4">Código</th><th>Nome</th><th className="text-right w-20">Preço</th><th className="w-10"></th></tr></thead>
                <tbody>{fa.map((a:any)=>(
                  <tr key={a.cod}>
                    <td className="font-mono text-[12px] text-[var(--label-secondary)] px-4">{a.cod}</td>
                    <td className="font-medium px-3">{a.nome}</td>
                    <td className="text-right tabnum px-3">{a.preco>0?`R$ ${a.preco.toFixed(2)}`:"—"}</td>
                    <td className="text-center"><button onClick={()=>remAv(a.cod)} className="text-[var(--label-quaternary)] hover:text-[var(--system-red)] transition-colors">×</button></td>
                  </tr>
                ))}</tbody></table>
              </div>
              <p className="text-[11px] text-[var(--label-tertiary)] mt-2">{fa.length} de {aviamentos.length}</p>
            </>)}

            {/* Tecidos */}
            {m==="tecido"&&(<>
              <div className="flex gap-2 mb-5 flex-wrap">
                <input className={`${inp} flex-[2] min-w-[150px]`} value={tn} onChange={e=>setTn(e.target.value)} placeholder="Nome do tecido"/>
                <input className={`${inp} flex-1 min-w-[100px]`} value={tf} onChange={e=>setTf(e.target.value)} placeholder="Fornecedor"/>
                <input className={`${inp} flex-1 min-w-[100px]`} value={tc} onChange={e=>setTc(e.target.value)} placeholder="Composição"/>
                <input className={`${inp} w-20`} value={tp} onChange={e=>setTp(e.target.value)} placeholder="Preço"/>
                <button onClick={addT} className={btn}>Adicionar</button>
              </div>
              <div className="border border-[var(--separator)] rounded-xl overflow-hidden">
                <table className="plm-table"><thead><tr><th className="px-4">Nome</th><th>Fornecedor</th><th>Composição</th><th className="text-right">Preço</th><th className="w-10"></th></tr></thead>
                <tbody>{tecidos.map((t:any,i:number)=>(
                  <tr key={i}>
                    <td className="font-medium px-4">{t.nome}</td>
                    <td className="px-3">{t.forn}</td>
                    <td className="text-[12px] text-[var(--label-secondary)] px-3">{t.comp}</td>
                    <td className="text-right tabnum px-3">{t.preco?`R$ ${Number(t.preco).toFixed(2)}`:"—"}</td>
                    <td className="text-center"><button onClick={()=>remT(t.nome)} className="text-[var(--label-quaternary)] hover:text-[var(--system-red)] transition-colors">×</button></td>
                  </tr>
                ))}</tbody></table>
              </div>
            </>)}
          </div>
        </div>
      </div>
    </div>
  );
}
