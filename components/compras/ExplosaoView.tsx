"use client";
import { useState, useEffect, useMemo } from "react";
import { fetchExplosaoData } from "@/lib/db";
import { exportToExcel } from "@/lib/export-excel";

type Props = { comprasRows: any[] };

function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ExplosaoView({ comprasRows }: Props) {
  const [data, setData] = useState<{ fichas: any[]; avFichas: any[]; avLib: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [flFornProd, setFlFornProd] = useState("");
  const [flStatus, setFlStatus] = useState("");
  const [flColecao, setFlColecao] = useState("");
  const [flFornAvi, setFlFornAvi] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);

  useEffect(() => {
    fetchExplosaoData().then(d => { setData(d); setLoading(false); });
  }, []);

  const avLibMap = useMemo(() => {
    if (!data) return {};
    const m: Record<string, { nome: string; fornecedor: string; preco: number; imagem: string }> = {};
    data.avLib.forEach(a => { m[a.codigo] = { nome: a.nome, fornecedor: a.fornecedor || "", preco: Number(a.preco) || 0, imagem: a.imagem || "" }; });
    return m;
  }, [data]);

  // filter produto rows first
  const filteredProd = useMemo(() => {
    let r = comprasRows;
    if (flFornProd) r = r.filter(x => x.fornecedor === flFornProd);
    if (flStatus) r = r.filter(x => x.status === flStatus);
    if (flColecao) r = r.filter(x => x.colecao === flColecao);
    return r;
  }, [comprasRows, flFornProd, flStatus, flColecao]);

  const refSet = useMemo(() => new Set(filteredProd.map(r => r.ref)), [filteredProd]);

  // map ficha_id → produto_ref for filtered products
  const fichaRefMap = useMemo(() => {
    if (!data) return new Map<number, string>();
    const m = new Map<number, string>();
    data.fichas.forEach(f => { if (refSet.has(f.produto_ref)) m.set(f.id, f.produto_ref); });
    return m;
  }, [data, refSet]);

  // ref → product fornecedor map (from filteredProd)
  const refFornMap = useMemo(() => {
    const m: Record<string, string> = {};
    filteredProd.forEach(p => { m[p.ref] = p.fornecedor || ""; });
    return m;
  }, [filteredProd]);

  // aggregate aviamentos
  const aggregated = useMemo(() => {
    if (!data) return [];
    const byCode: Record<string, { codigo: string; nome: string; fornAvi: string; preco: number; imagem: string; qtd: number; valorUnit: number; refs: Set<string>; fornsProd: Set<string> }> = {};
    data.avFichas.forEach(av => {
      const ref = fichaRefMap.get(av.ficha_id);
      if (!ref) return;
      const lib = avLibMap[av.codigo] || { nome: av.codigo, fornecedor: "", preco: 0, imagem: "" };
      if (!byCode[av.codigo]) {
        byCode[av.codigo] = { codigo: av.codigo, nome: lib.nome, fornAvi: lib.fornecedor, preco: lib.preco, imagem: lib.imagem || "", qtd: 0, valorUnit: lib.preco || Number(av.valor) || 0, refs: new Set(), fornsProd: new Set() };
      }
      byCode[av.codigo].qtd += Number(av.qtd) || 0;
      byCode[av.codigo].refs.add(ref);
      const forn = refFornMap[ref];
      if (forn) byCode[av.codigo].fornsProd.add(forn);
    });
    let rows = Object.values(byCode).map(r => ({
      ...r,
      fornecedor: r.fornAvi,
      fornProd: Array.from(r.fornsProd).sort().join(", "),
      refs: Array.from(r.refs).sort().join(", "),
      valorTotal: r.qtd * r.valorUnit,
    }));
    // filter by fornecedor aviamento
    if (flFornAvi) rows = rows.filter(r => r.fornecedor === flFornAvi);
    return rows;
  }, [data, fichaRefMap, avLibMap, refFornMap, flFornAvi]);

  const sorted = useMemo(() => {
    if (!sort) return aggregated;
    return [...aggregated].sort((a, b) => {
      const av = (a as any)[sort.key] ?? "", bv = (b as any)[sort.key] ?? "";
      const cmp = typeof av === "number"
        ? av - bv
        : String(av).localeCompare(String(bv), "pt-BR", { sensitivity: "base" });
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [aggregated, sort]);

  const toggleSort = (k: string) => setSort(prev => {
    if (!prev || prev.key !== k) return { key: k, dir: "asc" };
    if (prev.dir === "asc") return { key: k, dir: "desc" };
    return null;
  });

  // distinct filter options
  const uv = (key: "fornecedor" | "status" | "colecao") => Array.from(new Set(comprasRows.map(r => r[key]).filter(Boolean))).sort();
  const uvFornAvi = useMemo(() => Array.from(new Set(Object.values(avLibMap).map(a => a.fornecedor).filter(Boolean))).sort(), [avLibMap]);

  const handleExport = () => {
    const headers = ["Código", "Nome", "Forn. Aviamento", "Fornecedor", "Qtd Total", "Vlr. Unit (R$)", "Vlr. Total (R$)", "Referências"];
    const dataRows = sorted.map(r => [r.codigo, r.nome, r.fornecedor, r.fornProd, r.qtd, r.valorUnit, r.valorTotal, r.refs]);
    const date = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");
    exportToExcel(`explosao_aviamentos_${date}`, headers, dataRows);
  };

  const COLS = [
    { key: "_img",      label: "",               w: 64  },
    { key: "codigo",    label: "Código",          w: 110 },
    { key: "nome",      label: "Nome",            w: 260 },
    { key: "fornecedor",label: "Forn. Aviamento", w: 160 },
    { key: "fornProd",  label: "Fornecedor",      w: 160 },
    { key: "qtd",       label: "Qtd Total",       w: 100, num: true },
    { key: "valorUnit", label: "Vlr. Unit",        w: 110, num: true, fmt: fmtBRL },
    { key: "valorTotal",label: "Vlr. Total",       w: 120, num: true, fmt: fmtBRL },
    { key: "refs",      label: "Referências",     w: 300 },
  ];

  if (loading) return <div className="plm-loading"><div className="plm-loading-spinner" /><span>Carregando explosão...</span></div>;

  return (
    <div>
      {/* Filters */}
      <div className="apple-card p-4 mb-4 bg-[var(--bg-secondary)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--label-secondary)]">Filtrar por</span>
          {(flFornProd || flStatus || flColecao || flFornAvi) && (
            <button onClick={() => { setFlFornProd(""); setFlStatus(""); setFlColecao(""); setFlFornAvi(""); }} className="text-[12px] text-[var(--system-blue)] font-medium">Limpar</button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div>
            <label className="text-[11px] text-[var(--label-secondary)] mb-1 block font-medium">Fornecedor (Produto)</label>
            <select value={flFornProd} onChange={e => setFlFornProd(e.target.value)} className={`apple-select w-full text-[12px] py-1.5 ${flFornProd ? "!border-[var(--system-blue)] !bg-blue-50/60 text-[var(--system-blue)] font-semibold" : ""}`}>
              <option value="">Todos</option>
              {uv("fornecedor").map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-[var(--label-secondary)] mb-1 block font-medium">Status Atual</label>
            <select value={flStatus} onChange={e => setFlStatus(e.target.value)} className={`apple-select w-full text-[12px] py-1.5 ${flStatus ? "!border-[var(--system-blue)] !bg-blue-50/60 text-[var(--system-blue)] font-semibold" : ""}`}>
              <option value="">Todos</option>
              {uv("status").map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-[var(--label-secondary)] mb-1 block font-medium">Coleção</label>
            <select value={flColecao} onChange={e => setFlColecao(e.target.value)} className={`apple-select w-full text-[12px] py-1.5 ${flColecao ? "!border-[var(--system-blue)] !bg-blue-50/60 text-[var(--system-blue)] font-semibold" : ""}`}>
              <option value="">Todas</option>
              {uv("colecao").map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-[var(--label-secondary)] mb-1 block font-medium">Fornecedor de Aviamento</label>
            <select value={flFornAvi} onChange={e => setFlFornAvi(e.target.value)} className={`apple-select w-full text-[12px] py-1.5 ${flFornAvi ? "!border-[var(--system-blue)] !bg-blue-50/60 text-[var(--system-blue)] font-semibold" : ""}`}>
              <option value="">Todos</option>
              {uvFornAvi.map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-[28px] font-bold tabnum tracking-[-0.03em]">{sorted.length}</span>
        <span className="text-[14px] text-[var(--label-secondary)]">aviamento{sorted.length !== 1 && "s"}</span>
        <span className="text-[12px] text-[var(--label-tertiary)]">
          de {filteredProd.length} referência{filteredProd.length !== 1 && "s"}
        </span>
        <button onClick={handleExport} className="ml-auto apple-input flex items-center gap-2 cursor-pointer transition-all hover:!border-[var(--system-green)] hover:text-[var(--system-green)]" title="Exportar para Excel">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Exportar
        </button>
      </div>

      {/* Table */}
      <div className="apple-card-scroll">
        <table className="plm-table" style={{ width: "max-content", minWidth: "100%" }}>
          <thead>
            <tr>
              {COLS.map(c => {
                const isActive = sort?.key === c.key;
                return (
                  <th key={c.key} style={{ width: c.w, minWidth: c.w }}>
                    {c.key === "_img" ? null : (
                      <button onClick={() => toggleSort(c.key)} className={`inline-flex items-center gap-1 select-none cursor-pointer hover:text-[var(--label-primary)] transition-colors ${isActive ? "text-[var(--system-blue)]" : ""}`}>
                        <span>{c.label}</span>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={isActive ? "opacity-100" : "opacity-30"}>
                          {isActive && sort?.dir === "desc" ? <path d="M6 9l6 6 6-6" /> : <path d="M18 15l-6-6-6 6" />}
                        </svg>
                      </button>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => (
              <tr key={`${r.codigo}-${i}`}>
                {COLS.map(c => {
                  if (c.key === "_img") return (
                    <td key="_img" style={{ width: c.w, minWidth: c.w, textAlign: "center", padding: "4px 6px" }}>
                      {r.imagem
                        ? <img src={r.imagem} alt={r.nome} style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8, border: "1px solid var(--separator)", display: "inline-block" }} />
                        : <div style={{ width: 44, height: 44, borderRadius: 8, border: "1px dashed var(--separator)", background: "var(--bg-secondary)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--label-quaternary)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                          </div>}
                    </td>
                  );
                  const val = (r as any)[c.key];
                  const display = c.fmt ? c.fmt(val) : val ?? "—";
                  return (
                    <td key={c.key} style={{ width: c.w, minWidth: c.w, textAlign: c.num ? "right" : "left" }}>
                      <span className={`text-[13px] px-2.5 py-1 block ${c.num ? "tabnum" : ""} ${val != null && val !== "" && val !== 0 ? "" : "text-[var(--label-quaternary)]"}`}>
                        {c.num && val === 0 ? "—" : display}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr><td colSpan={COLS.length} className="py-16 text-center text-[var(--label-tertiary)]">Nenhum aviamento encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
