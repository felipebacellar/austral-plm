"use client";

import { useState } from "react";
import { SAMPLE_CAD } from "@/lib/sample-data";

const TABS = [
  { k: "grupo", l: "Grupo" }, { k: "subgrupo", l: "Subgrupo" },
  { k: "categoria", l: "Categoria" }, { k: "subcategoria", l: "Subcategoria" },
  { k: "linha", l: "Linha" }, { k: "grade", l: "Grade" },
  { k: "operacao", l: "Operação" }, { k: "tipo", l: "Tipo" },
  { k: "fornecedor", l: "Fornecedor" }, { k: "cor", l: "Cor" },
  { k: "drop", l: "Drop" }, { k: "colecao", l: "Coleção" },
  { k: "status", l: "Status" }, { k: "piloto_most", l: "Piloto / mostr." },
  { k: "tecido", l: "Tecidos" },
];

export default function CadView() {
  const [cad, setCad] = useState<any>(SAMPLE_CAD);
  const [active, setActive] = useState("grupo");
  const [val, setVal] = useState("");
  const [tn, setTn] = useState("");
  const [tf, setTf] = useState("");
  const [tc, setTc] = useState("");
  const [tp, setTp] = useState("");

  const isTecido = active === "tecido";
  const items = isTecido ? cad.tecido : (cad[active] || []);
  const info = TABS.find((t) => t.k === active);

  const addSimple = () => {
    const v = val.trim().toUpperCase();
    if (v && !items.includes(v)) {
      setCad((p: any) => ({ ...p, [active]: [...p[active], v] }));
      setVal("");
    }
  };

  const removeSimple = (x: string) => {
    setCad((p: any) => ({ ...p, [active]: p[active].filter((v: string) => v !== x) }));
  };

  const addTecido = () => {
    if (!tn.trim()) return;
    setCad((p: any) => ({
      ...p,
      tecido: [...p.tecido, { nome: tn.trim().toUpperCase(), forn: tf.trim(), comp: tc.trim(), preco: tp }],
    }));
    setTn(""); setTf(""); setTc(""); setTp("");
  };

  const removeTecido = (n: string) => {
    setCad((p: any) => ({ ...p, tecido: p.tecido.filter((t: any) => t.nome !== n) }));
  };

  return (
    <div className="flex gap-6 min-h-[340px]">
      {/* ── Sidebar ── */}
      <div className="w-48 flex-shrink-0">
        <div className="text-xxs font-bold uppercase tracking-[0.06em] text-gray-400 px-3 mb-2.5">
          Cadastros
        </div>
        <nav className="flex flex-col gap-px">
          {TABS.map((t) => {
            const cnt = t.k === "tecido" ? cad.tecido.length : (cad[t.k] || []).length;
            const isActive = active === t.k;
            return (
              <button
                key={t.k}
                onClick={() => setActive(t.k)}
                className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm text-left transition-all ${
                  isActive
                    ? "font-semibold bg-blue-50 text-apple-blue"
                    : "text-gray-900 hover:bg-gray-50"
                }`}
              >
                <span>{t.l}</span>
                <span className={`text-xs tabular-nums ${isActive ? "text-blue-400" : "text-gray-400 bg-gray-100 px-1.5 rounded"}`}>
                  {cnt}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Main ── */}
      <div className="flex-1 min-w-0">
        <h3 className="text-2xl font-bold tracking-tight mb-1">{info?.l}</h3>
        <p className="text-sm text-gray-400 mb-5">
          {items.length} ite{items.length !== 1 ? "ns" : "m"} cadastrado{items.length !== 1 ? "s" : ""}
        </p>

        {/* Simple cadastro */}
        {!isTecido && (
          <>
            <div className="flex gap-2 mb-6">
              <input
                type="text" value={val}
                onChange={(e) => setVal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSimple()}
                placeholder="Novo item..."
                className="flex-1 text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white outline-none"
              />
              <button onClick={addSimple} className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-apple-blue text-white hover:opacity-90 transition-opacity">
                Adicionar
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {items.map((x: string) => (
                <span key={x} className="inline-flex items-center gap-1.5 bg-gray-100 rounded-lg px-3 py-1.5 text-sm">
                  {x}
                  <button
                    onClick={() => removeSimple(x)}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded w-4 h-4 inline-flex items-center justify-center transition-all text-xs"
                  >×</button>
                </span>
              ))}
            </div>
          </>
        )}

        {/* Tecidos cadastro */}
        {isTecido && (
          <>
            <div className="flex gap-1.5 mb-5 flex-wrap">
              <input className="flex-[2] min-w-[150px] text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-white outline-none" value={tn} onChange={(e) => setTn(e.target.value)} placeholder="Nome do tecido" />
              <input className="flex-1 min-w-[100px] text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-white outline-none" value={tf} onChange={(e) => setTf(e.target.value)} placeholder="Fornecedor" />
              <input className="flex-1 min-w-[100px] text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-white outline-none" value={tc} onChange={(e) => setTc(e.target.value)} placeholder="Composição" />
              <input className="w-20 text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-white outline-none" value={tp} onChange={(e) => setTp(e.target.value)} placeholder="Preço" />
              <button onClick={addTecido} className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-apple-blue text-white hover:opacity-90 transition-opacity">
                Adicionar
              </button>
            </div>
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <table className="plm-table">
                <thead>
                  <tr>
                    <th>Nome</th><th>Fornecedor</th><th>Composição</th>
                    <th className="text-right">Preço</th><th style={{ width: 36 }} />
                  </tr>
                </thead>
                <tbody>
                  {cad.tecido.map((t: any, i: number) => (
                    <tr key={i}>
                      <td className="font-medium">{t.nome}</td>
                      <td>{t.forn}</td>
                      <td className="text-gray-500 text-xs">{t.comp}</td>
                      <td className="text-right tabular-nums">{t.preco ? `R$ ${Number(t.preco).toFixed(2)}` : "—"}</td>
                      <td className="text-center">
                        <button onClick={() => removeTecido(t.nome)} className="text-gray-400 hover:text-red-500 transition-colors">×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
