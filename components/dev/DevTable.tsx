"use client";

import { useState, useMemo } from "react";
import InlineCell from "@/components/ui/InlineCell";
import COLUMNS from "@/lib/columns";
import type { Produto } from "@/lib/types";

// TODO: replace with Supabase fetch
import { SAMPLE_ROWS, SAMPLE_CAD } from "@/lib/sample-data";

type Props = {
  onOpenFicha: (row: any) => void;
};

export default function DevTable({ onOpenFicha }: Props) {
  const [rows, setRows] = useState(SAMPLE_ROWS);
  const [cad] = useState(SAMPLE_CAD);
  const [query, setQuery] = useState("");
  const [filterGrupo, setFilterGrupo] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const filtered = useMemo(() => {
    let r = rows;
    if (filterGrupo) r = r.filter((x: any) => x.grupo === filterGrupo);
    if (filterStatus) r = r.filter((x: any) => x.status === filterStatus);
    if (query) {
      const q = query.toLowerCase();
      r = r.filter((x: any) => (x.ref + x.desc + x.tecido).toLowerCase().includes(q));
    }
    return r;
  }, [rows, filterGrupo, filterStatus, query]);

  const updateCell = (id: number, key: string, val: string | number) => {
    setRows((prev: any[]) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [key]: val };
        // Auto-fill forn_tecido when tecido changes
        if (key === "tecido") {
          const t = cad.tecido?.find((t: any) => t.nome === val);
          if (t) updated.forn_tecido = t.forn;
        }
        return updated;
      })
    );
  };

  const addRow = () => {
    const newId = Math.max(0, ...rows.map((r: any) => r.id)) + 1;
    const blank: any = { id: newId, ficha: null };
    COLUMNS.forEach((c) => {
      if (c.type !== "action") blank[c.key] = c.type === "number" ? 0 : "";
    });
    setRows((prev: any) => [...prev, blank]);
  };

  const deleteRow = (id: number) => {
    setRows((prev: any[]) => prev.filter((r) => r.id !== id));
  };

  const getOptions = (cadKey: string): string[] => {
    if (cadKey === "tecido") return (cad.tecido || []).map((t: any) => t.nome);
    return cad[cadKey] || [];
  };

  const grupos = [...new Set(rows.map((r: any) => r.grupo).filter(Boolean))].sort();
  const statuses = [...new Set(rows.map((r: any) => r.status).filter(Boolean))].sort();

  return (
    <div>
      {/* ── Toolbar ── */}
      <div className="flex gap-2 mb-5 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            type="text"
            placeholder="Buscar referência, descrição ou tecido..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white outline-none"
          />
        </div>
        <select value={filterGrupo} onChange={(e) => setFilterGrupo(e.target.value)} className="text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-white outline-none cursor-pointer">
          <option value="">Todos os grupos</option>
          {grupos.map((g) => <option key={g}>{g}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-white outline-none cursor-pointer">
          <option value="">Todos os status</option>
          {statuses.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button onClick={addRow} className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-apple-blue text-white hover:opacity-90 transition-opacity">
          + Novo SKU
        </button>
      </div>

      {/* ── Count bar ── */}
      <div className="flex items-baseline gap-3 mb-4 pl-1">
        <span className="text-3xl font-bold tabular-nums tracking-tight">{filtered.length}</span>
        <span className="text-sm text-gray-500">SKU{filtered.length !== 1 && "s"}</span>
        <span className="text-xs text-gray-400 ml-auto italic">duplo-clique para editar</span>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="plm-table" style={{ width: "max-content", minWidth: "100%" }}>
          <thead>
            <tr>
              {COLUMNS.map((c) => (
                <th key={c.key} style={{ width: c.width, minWidth: c.width, textAlign: c.type === "number" ? "right" : "left" }}>
                  {c.label}
                </th>
              ))}
              <th style={{ width: 32 }} />
            </tr>
          </thead>
          <tbody>
            {filtered.map((row: any) => (
              <tr key={row.id}>
                {COLUMNS.map((c) => (
                  <td key={c.key} style={{ width: c.width, maxWidth: c.width }}>
                    {c.type === "action" ? (
                      <button
                        onClick={() => onOpenFicha(row)}
                        className="text-xs font-semibold text-apple-blue bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Abrir
                      </button>
                    ) : (
                      <InlineCell
                        value={row[c.key]}
                        type={c.type}
                        options={c.cad ? getOptions(c.cad) : undefined}
                        isStatus={c.key === "status"}
                        onChange={(v) => updateCell(row.id, c.key, v)}
                      />
                    )}
                  </td>
                ))}
                <td className="text-center">
                  <button
                    onClick={() => deleteRow(row.id)}
                    title="Remover"
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg w-7 h-7 inline-flex items-center justify-center transition-all"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="py-12 text-center text-gray-400 text-sm">
                  Nenhum item encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
