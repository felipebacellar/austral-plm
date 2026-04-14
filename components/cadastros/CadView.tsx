"use client";

import { useState } from "react";
import { SAMPLE_CAD, SAMPLE_VARIANTES, SAMPLE_ROWS } from "@/lib/sample-data";

const TABS = [
  { k: "grupo", l: "Grupo" }, { k: "subgrupo", l: "Subgrupo" },
  { k: "categoria", l: "Categoria" }, { k: "subcategoria", l: "Subcategoria" },
  { k: "linha", l: "Linha" }, { k: "grade", l: "Grade" },
  { k: "operacao", l: "Operação" }, { k: "tipo", l: "Tipo" },
  { k: "fornecedor", l: "Fornecedor" }, { k: "drop", l: "Drop" },
  { k: "colecao", l: "Coleção" }, { k: "status", l: "Status" },
  { k: "piloto_most", l: "Piloto / mostr." },
  { k: "cor", l: "Cores" }, { k: "tecido", l: "Tecidos" },
  { k: "variantes", l: "Variantes de cor" },
];

export default function CadView() {
  const [cad, setCad] = useState<any>(SAMPLE_CAD);
  const [variantes, setVariantes] = useState<Record<string,string[]>>(SAMPLE_VARIANTES);
  const [active, setActive] = useState("grupo");
  const [val, setVal] = useState("");
  // Tecido fields
  const [tn, setTn] = useState(""); const [tf, setTf] = useState(""); const [tc, setTc] = useState(""); const [tp, setTp] = useState("");
  // Cor fields
  const [corCod, setCorCod] = useState(""); const [corNome, setCorNome] = useState("");
  // Variantes fields
  const [varRef, setVarRef] = useState(""); const [varCor, setVarCor] = useState("");

  const isTecido = active === "tecido";
  const isCor = active === "cor";
  const isVariante = active === "variantes";
  const isSimple = !isTecido && !isCor && !isVariante;
  const items = isSimple ? (cad[active] || []) : [];
  const info = TABS.find(t => t.k === active);

  const addSimple = () => { const v = val.trim().toUpperCase(); if (v && !items.includes(v)) { setCad((p:any) => ({ ...p, [active]: [...p[active], v] })); setVal(""); } };
  const remSimple = (x: string) => setCad((p:any) => ({ ...p, [active]: p[active].filter((v:string) => v !== x) }));
  const addTecido = () => { if (!tn.trim()) return; setCad((p:any) => ({ ...p, tecido: [...p.tecido, { nome: tn.trim().toUpperCase(), forn: tf.trim(), comp: tc.trim(), preco: tp }] })); setTn(""); setTf(""); setTc(""); setTp(""); };
  const remTecido = (n: string) => setCad((p:any) => ({ ...p, tecido: p.tecido.filter((t:any) => t.nome !== n) }));
  const addCor = () => { if (!corCod.trim() || !corNome.trim()) return; setCad((p:any) => ({ ...p, cor: [...p.cor, { cod: corCod.trim().toUpperCase(), nome: corNome.trim().toUpperCase() }] })); setCorCod(""); setCorNome(""); };
  const remCor = (cod: string) => setCad((p:any) => ({ ...p, cor: p.cor.filter((c:any) => c.cod !== cod) }));
  const addVariante = () => {
    if (!varRef || !varCor) return;
    setVariantes(p => ({ ...p, [varRef]: [...(p[varRef] || []), varCor] }));
    setVarCor("");
  };
  const remVariante = (ref: string, cor: string) => {
    setVariantes(p => ({ ...p, [ref]: (p[ref] || []).filter(c => c !== cor) }));
  };

  const getCount = (k: string) => {
    if (k === "tecido") return cad.tecido.length;
    if (k === "cor") return cad.cor.length;
    if (k === "variantes") return Object.keys(variantes).length;
    return (cad[k] || []).length;
  };

  const refs = [...new Set(SAMPLE_ROWS.map((r:any) => r.ref))];
  const corOptions = cad.cor.map((c:any) => `${c.cod} - ${c.nome}`);

  return (
    <div className="flex gap-6 min-h-[340px]">
      {/* Sidebar */}
      <div className="w-48 flex-shrink-0">
        <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-gray-400 px-3 mb-2.5">Cadastros</div>
        <nav className="flex flex-col gap-px">
          {TABS.map(t => {
            const cnt = getCount(t.k);
            const isActive = active === t.k;
            return (
              <button key={t.k} onClick={() => setActive(t.k)}
                className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm text-left transition-all ${isActive ? "font-semibold bg-blue-50 text-[#007AFF]" : "text-gray-900 hover:bg-gray-50"}`}>
                <span>{t.l}</span>
                <span className={`text-xs tabular-nums ${isActive ? "text-blue-400" : "text-gray-400 bg-gray-100 px-1.5 rounded"}`}>{cnt}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <h3 className="text-2xl font-bold tracking-tight mb-1">{info?.l}</h3>
        <p className="text-sm text-gray-400 mb-5">
          {isCor ? `${cad.cor.length} cores` : isVariante ? `${Object.keys(variantes).length} produtos com variantes` : isTecido ? `${cad.tecido.length} tecidos` : `${items.length} itens`}
        </p>

        {/* Simple cadastro */}
        {isSimple && (
          <>
            <div className="flex gap-2 mb-6">
              <input type="text" value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === "Enter" && addSimple()} placeholder="Novo item..."
                className="flex-1 text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white outline-none" />
              <button onClick={addSimple} className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-[#007AFF] text-white hover:opacity-90 transition-opacity">Adicionar</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {items.map((x: string) => (
                <span key={x} className="inline-flex items-center gap-1.5 bg-gray-100 rounded-lg px-3 py-1.5 text-sm">
                  {x}
                  <button onClick={() => remSimple(x)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded w-4 h-4 inline-flex items-center justify-center transition-all text-xs">×</button>
                </span>
              ))}
            </div>
          </>
        )}

        {/* Cores — cod + nome */}
        {isCor && (
          <>
            <div className="flex gap-2 mb-5">
              <input className="w-24 text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-white outline-none" value={corCod} onChange={e => setCorCod(e.target.value)} placeholder="Código (C01)" />
              <input className="flex-1 text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-white outline-none" value={corNome} onChange={e => setCorNome(e.target.value)} placeholder="Nome da cor" onKeyDown={e => e.key === "Enter" && addCor()} />
              <button onClick={addCor} className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-[#007AFF] text-white hover:opacity-90">Adicionar</button>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="plm-table">
                <thead><tr><th className="w-24">Código</th><th>Nome</th><th className="w-10"></th></tr></thead>
                <tbody>
                  {cad.cor.map((c: any) => (
                    <tr key={c.cod}>
                      <td className="font-mono font-bold text-gray-500">{c.cod}</td>
                      <td className="font-medium">{c.nome}</td>
                      <td className="text-center"><button onClick={() => remCor(c.cod)} className="text-gray-400 hover:text-red-500 transition-colors">×</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Tecidos */}
        {isTecido && (
          <>
            <div className="flex gap-1.5 mb-5 flex-wrap">
              <input className="flex-[2] min-w-[150px] text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-white outline-none" value={tn} onChange={e => setTn(e.target.value)} placeholder="Nome do tecido" />
              <input className="flex-1 min-w-[100px] text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-white outline-none" value={tf} onChange={e => setTf(e.target.value)} placeholder="Fornecedor" />
              <input className="flex-1 min-w-[100px] text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-white outline-none" value={tc} onChange={e => setTc(e.target.value)} placeholder="Composição" />
              <input className="w-20 text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-white outline-none" value={tp} onChange={e => setTp(e.target.value)} placeholder="Preço" />
              <button onClick={addTecido} className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-[#007AFF] text-white hover:opacity-90">Adicionar</button>
            </div>
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <table className="plm-table">
                <thead><tr><th>Nome</th><th>Fornecedor</th><th>Composição</th><th className="text-right">Preço</th><th className="w-10"></th></tr></thead>
                <tbody>
                  {cad.tecido.map((t: any, i: number) => (
                    <tr key={i}>
                      <td className="font-medium">{t.nome}</td><td>{t.forn}</td><td className="text-gray-500 text-xs">{t.comp}</td>
                      <td className="text-right tabular-nums">{t.preco ? `R$ ${Number(t.preco).toFixed(2)}` : "—"}</td>
                      <td className="text-center"><button onClick={() => remTecido(t.nome)} className="text-gray-400 hover:text-red-500 transition-colors">×</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Variantes de cor */}
        {isVariante && (
          <>
            <div className="flex gap-2 mb-5">
              <select className="text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-white outline-none" value={varRef} onChange={e => setVarRef(e.target.value)}>
                <option value="">Selecione a referência</option>
                {refs.map(r => <option key={r} value={r}>{r} — {SAMPLE_ROWS.find((row:any) => row.ref === r)?.desc}</option>)}
              </select>
              <select className="text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-white outline-none" value={varCor} onChange={e => setVarCor(e.target.value)}>
                <option value="">Selecione a cor</option>
                {corOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={addVariante} className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-[#007AFF] text-white hover:opacity-90">Adicionar</button>
            </div>

            <div className="space-y-4">
              {Object.entries(variantes).map(([ref, cores]) => {
                const prod = SAMPLE_ROWS.find((r:any) => r.ref === ref);
                return (
                  <div key={ref} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2.5 flex items-center gap-3 border-b border-gray-200">
                      <span className="font-mono text-[12px] text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">{ref}</span>
                      <span className="text-[13px] font-medium">{prod?.desc || ref}</span>
                      <span className="text-[12px] text-gray-400 ml-auto">{cores.length} variante{cores.length !== 1 && "s"}</span>
                    </div>
                    <div className="px-4 py-3 flex flex-wrap gap-2">
                      {cores.map(c => (
                        <span key={c} className="inline-flex items-center gap-1.5 bg-gray-100 rounded-lg px-3 py-1.5 text-[13px]">
                          {c}
                          <button onClick={() => remVariante(ref, c)} className="text-gray-400 hover:text-red-500 transition-colors text-xs">×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
              {Object.keys(variantes).length === 0 && (
                <div className="text-center text-gray-400 text-sm py-8">Nenhuma variante cadastrada</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
