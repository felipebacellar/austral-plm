"use client";

import { useState } from "react";
import { SAMPLE_CAD } from "@/lib/sample-data";

const TABS = [
  {k:"grupo",l:"Grupo"},{k:"subgrupo",l:"Subgrupo"},{k:"categoria",l:"Categoria"},
  {k:"subcategoria",l:"Subcategoria"},{k:"linha",l:"Linha"},{k:"grade",l:"Grade"},
  {k:"operacao",l:"Operação"},{k:"tipo",l:"Tipo"},{k:"fornecedor",l:"Fornecedor"},
  {k:"drop",l:"Drop"},{k:"colecao",l:"Coleção"},{k:"status",l:"Status"},
  {k:"piloto_most",l:"Piloto / mostr."},{k:"estilista",l:"Estilista"},
  {k:"cor",l:"Cores"},{k:"aviamento",l:"Aviamentos"},{k:"tecido",l:"Tecidos"},
];

export default function CadView() {
  const [cad, setCad] = useState<any>(SAMPLE_CAD);
  const [active, setActive] = useState("grupo");
  const [val, setVal] = useState("");
  const [tn,setTn]=useState("");const [tf,setTf]=useState("");const [tc,setTc]=useState("");const [tp,setTp]=useState("");
  const [corCod,setCorCod]=useState("");const [corNome,setCorNome]=useState("");
  const [avCod,setAvCod]=useState("");const [avNome,setAvNome]=useState("");const [avPreco,setAvPreco]=useState("");
  const [search,setSearch]=useState("");

  const mode=active;
  const isSimple=!["tecido","cor","aviamento"].includes(mode);
  const items=isSimple?(cad[mode]||[]):[];
  const info=TABS.find(t=>t.k===mode);

  const addSimple=()=>{const v=val.trim().toUpperCase();if(v&&!items.includes(v)){setCad((p:any)=>({...p,[mode]:[...p[mode],v]}));setVal("");}};
  const remSimple=(x:string)=>setCad((p:any)=>({...p,[mode]:p[mode].filter((v:string)=>v!==x)}));
  const addTecido=()=>{if(!tn.trim())return;setCad((p:any)=>({...p,tecido:[...p.tecido,{nome:tn.trim().toUpperCase(),forn:tf.trim(),comp:tc.trim(),preco:tp}]}));setTn("");setTf("");setTc("");setTp("");};
  const remTecido=(n:string)=>setCad((p:any)=>({...p,tecido:p.tecido.filter((t:any)=>t.nome!==n)}));
  const addCor=()=>{if(!corCod.trim()||!corNome.trim())return;setCad((p:any)=>({...p,cor:[...p.cor,{cod:corCod.trim().toUpperCase(),nome:corNome.trim().toUpperCase()}]}));setCorCod("");setCorNome("");};
  const remCor=(cod:string)=>setCad((p:any)=>({...p,cor:p.cor.filter((c:any)=>c.cod!==cod)}));
  const addAviamento=()=>{if(!avCod.trim()||!avNome.trim())return;setCad((p:any)=>({...p,aviamento:[...p.aviamento,{cod:avCod.trim().toUpperCase(),nome:avNome.trim().toUpperCase(),preco:parseFloat(avPreco)||0}]}));setAvCod("");setAvNome("");setAvPreco("");};
  const remAviamento=(cod:string)=>setCad((p:any)=>({...p,aviamento:p.aviamento.filter((a:any)=>a.cod!==cod)}));

  const getCount=(k:string)=>{if(k==="tecido")return cad.tecido.length;if(k==="cor")return cad.cor.length;if(k==="aviamento")return cad.aviamento.length;return(cad[k]||[]).length;};
  const filteredAv=search?cad.aviamento.filter((a:any)=>(a.cod+a.nome).toLowerCase().includes(search.toLowerCase())):cad.aviamento;
  const inp="text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-white outline-none";
  const btn="text-sm font-semibold px-5 py-2.5 rounded-xl bg-[#007AFF] text-white hover:opacity-90 transition-opacity";

  return (
    <div className="flex gap-6 min-h-[340px]">
      <div className="w-48 flex-shrink-0">
        <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-gray-400 px-3 mb-2.5">Cadastros</div>
        <nav className="flex flex-col gap-px">{TABS.map(t=>{const cnt=getCount(t.k);const on=mode===t.k;return(
          <button key={t.k} onClick={()=>{setActive(t.k);setSearch("");}} className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm text-left transition-all ${on?"font-semibold bg-blue-50 text-[#007AFF]":"text-gray-900 hover:bg-gray-50"}`}>
            <span>{t.l}</span><span className={`text-xs tabular-nums ${on?"text-blue-400":"text-gray-400 bg-gray-100 px-1.5 rounded"}`}>{cnt}</span>
          </button>);})}</nav>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-2xl font-bold tracking-tight mb-1">{info?.l}</h3>
        <p className="text-sm text-gray-400 mb-5">{mode==="aviamento"?`${cad.aviamento.length} aviamentos`:mode==="cor"?`${cad.cor.length} cores`:mode==="tecido"?`${cad.tecido.length} tecidos`:`${items.length} itens`}</p>

        {isSimple&&(<><div className="flex gap-2 mb-6"><input type="text" value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addSimple()} placeholder="Novo item..." className={`flex-1 ${inp}`}/><button onClick={addSimple} className={btn}>Adicionar</button></div><div className="flex flex-wrap gap-1.5">{items.map((x:string)=>(<span key={x} className="inline-flex items-center gap-1.5 bg-gray-100 rounded-lg px-3 py-1.5 text-sm">{x}<button onClick={()=>remSimple(x)} className="text-gray-400 hover:text-red-500 rounded w-4 h-4 inline-flex items-center justify-center text-xs">×</button></span>))}</div></>)}

        {mode==="cor"&&(<><div className="flex gap-2 mb-5"><input className={`w-24 ${inp}`} value={corCod} onChange={e=>setCorCod(e.target.value)} placeholder="Código"/><input className={`flex-1 ${inp}`} value={corNome} onChange={e=>setCorNome(e.target.value)} placeholder="Nome da cor" onKeyDown={e=>e.key==="Enter"&&addCor()}/><button onClick={addCor} className={btn}>Adicionar</button></div><div className="border border-gray-200 rounded-xl overflow-hidden"><table className="plm-table"><thead><tr><th className="w-24">Código</th><th>Nome</th><th className="w-10"></th></tr></thead><tbody>{cad.cor.map((c:any)=>(<tr key={c.cod}><td className="font-mono font-bold text-gray-500">{c.cod}</td><td className="font-medium">{c.nome}</td><td className="text-center"><button onClick={()=>remCor(c.cod)} className="text-gray-400 hover:text-red-500">×</button></td></tr>))}</tbody></table></div></>)}

        {mode==="aviamento"&&(<><div className="flex gap-2 mb-3"><input className={`w-28 ${inp}`} value={avCod} onChange={e=>setAvCod(e.target.value)} placeholder="Código"/><input className={`flex-1 ${inp}`} value={avNome} onChange={e=>setAvNome(e.target.value)} placeholder="Nome do aviamento"/><input className={`w-24 ${inp}`} value={avPreco} onChange={e=>setAvPreco(e.target.value)} placeholder="Preço"/><button onClick={addAviamento} className={btn}>Adicionar</button></div><div className="mb-4"><input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar aviamento..." className={`w-full ${inp}`}/></div><div className="border border-gray-200 rounded-xl overflow-hidden max-h-[500px] overflow-y-auto"><table className="plm-table"><thead><tr><th className="w-28">Código</th><th>Nome</th><th className="text-right w-20">Preço</th><th className="w-10"></th></tr></thead><tbody>{filteredAv.map((a:any)=>(<tr key={a.cod}><td className="font-mono text-[12px] text-gray-500">{a.cod}</td><td className="font-medium">{a.nome}</td><td className="text-right tabular-nums">{a.preco>0?`R$ ${a.preco.toFixed(2)}`:"—"}</td><td className="text-center"><button onClick={()=>remAviamento(a.cod)} className="text-gray-400 hover:text-red-500">×</button></td></tr>))}</tbody></table></div><p className="text-[11px] text-gray-400 mt-2">{filteredAv.length} de {cad.aviamento.length}</p></>)}

        {mode==="tecido"&&(<><div className="flex gap-1.5 mb-5 flex-wrap"><input className={`flex-[2] min-w-[150px] ${inp}`} value={tn} onChange={e=>setTn(e.target.value)} placeholder="Nome do tecido"/><input className={`flex-1 min-w-[100px] ${inp}`} value={tf} onChange={e=>setTf(e.target.value)} placeholder="Fornecedor"/><input className={`flex-1 min-w-[100px] ${inp}`} value={tc} onChange={e=>setTc(e.target.value)} placeholder="Composição"/><input className={`w-20 ${inp}`} value={tp} onChange={e=>setTp(e.target.value)} placeholder="Preço"/><button onClick={addTecido} className={btn}>Adicionar</button></div><div className="rounded-xl border border-gray-200 overflow-hidden"><table className="plm-table"><thead><tr><th>Nome</th><th>Fornecedor</th><th>Composição</th><th className="text-right">Preço</th><th className="w-10"></th></tr></thead><tbody>{cad.tecido.map((t:any,i:number)=>(<tr key={i}><td className="font-medium">{t.nome}</td><td>{t.forn}</td><td className="text-gray-500 text-xs">{t.comp}</td><td className="text-right tabular-nums">{t.preco?`R$ ${Number(t.preco).toFixed(2)}`:"—"}</td><td className="text-center"><button onClick={()=>remTecido(t.nome)} className="text-gray-400 hover:text-red-500">×</button></td></tr>))}</tbody></table></div></>)}
      </div>
    </div>
  );
}
