"use client";
import { useEffect, useMemo, useRef, useState } from "react";

interface Props { rows: any[]; variantes: Record<string, string[]> }

/* ── Helpers ── */
const isMostOrProd = (s: string) => {
  const u = (s || "").toUpperCase();
  return u.includes("MOSTRUÁRIO") || u.includes("MOSTRUARIO") ||
         u.includes("PRODUÇÃO")   || u.includes("PRODUCAO")   || u.includes("REPILOTANDO");
};
const fmtBrl = (v: number | null | undefined) =>
  v != null && v > 0 ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "";
const fmtMkp = (v: number | null | undefined) =>
  v != null && v > 0 ? v.toFixed(2) : "";

/* ── Filter fields ── */
const FILTER_FIELDS = [
  { key: "status",       label: "Status" },
  { key: "colecao",      label: "Coleção" },
  { key: "grupo",        label: "Grupo" },
  { key: "subgrupo",     label: "Subgrupo" },
  { key: "fornecedor",   label: "Fornecedor" },
  { key: "linha",        label: "Linha" },
  { key: "tecido",       label: "Tecido" },
  { key: "forn_tecido",  label: "Forn. Tecido" },
  { key: "operacao",     label: "Operação" },
  { key: "categoria",    label: "Categoria" },
  { key: "subcategoria", label: "Subcategoria" },
  { key: "tipo",         label: "Tipo" },
  { key: "drop",         label: "Drop" },
  { key: "estilista",    label: "Estilista" },
];

/* ── MultiSelect ── */
function MultiSelect({ label, options, selected, onChange }: {
  label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    if (open) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  const visible = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  const active = selected.length > 0;
  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: "flex", alignItems: "center", gap: 5, fontSize: 12, padding: "5px 10px",
        borderRadius: 7, border: "1px solid", cursor: "pointer", whiteSpace: "nowrap",
        background: active ? "var(--system-blue)" : "var(--bg-secondary)",
        borderColor: active ? "var(--system-blue)" : "var(--separator)",
        color: active ? "#fff" : "var(--label-secondary)", fontWeight: active ? 600 : 400,
      }}>
        {label}{active ? ` (${selected.length})` : ""}
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          style={{ transform: open ? "rotate(180deg)" : "none", opacity: .7 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 1000,
          background: "var(--bg-primary)", border: "1px solid var(--separator)", borderRadius: 10,
          boxShadow: "0 8px 28px rgba(0,0,0,0.15)", minWidth: 220, maxWidth: 300, padding: "6px 0" }}>
          {options.length > 6 && (
            <div style={{ padding: "4px 10px 6px", borderBottom: "1px solid var(--separator)" }}>
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar…"
                style={{ width: "100%", fontSize: 12, padding: "4px 8px", border: "1px solid var(--separator)",
                  borderRadius: 6, background: "var(--bg-secondary)", color: "var(--label-primary)", outline: "none" }} />
            </div>
          )}
          <div style={{ display: "flex", gap: 8, padding: "4px 10px 5px", borderBottom: "1px solid var(--separator)" }}>
            <button onClick={() => onChange(options)} style={{ fontSize: 11, color: "var(--system-blue)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Todos</button>
            <span style={{ color: "var(--separator)" }}>·</span>
            <button onClick={() => onChange([])} style={{ fontSize: 11, color: "var(--label-tertiary)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Limpar</button>
          </div>
          <div style={{ maxHeight: 260, overflowY: "auto" }}>
            {visible.length === 0 && <div style={{ padding: "10px 12px", fontSize: 12, color: "var(--label-tertiary)" }}>Nenhum resultado</div>}
            {visible.map(opt => {
              const checked = selected.includes(opt);
              return (
                <label key={opt} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px",
                  cursor: "pointer", background: checked ? "var(--bg-secondary)" : "transparent" }}>
                  <input type="checkbox" checked={checked}
                    onChange={() => onChange(checked ? selected.filter(x => x !== opt) : [...selected, opt])}
                    style={{ accentColor: "var(--system-blue)", width: 13, height: 13, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "var(--label-primary)" }}>{opt || "—"}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Label component ── */
function Etiqueta({ item, cores }: { item: any; cores: string[] }) {
  const useFinal = isMostOrProd(item.status);
  const custo   = useFinal ? item.custo_final  : item.custo_inicial;
  const varejo  = useFinal ? item.varejo_final : item.preco_target;
  const mkpVal  = useFinal
    ? (item.varejo_final && item.custo_final && item.custo_final > 0 ? item.varejo_final / item.custo_final : null)
    : (item.markup_inicial || null);
  const precoMkp = custo && mkpVal ? custo * mkpVal : null;
  const coresStr = cores.length > 0 ? cores.join(" · ") : "—";

  return (
    <div className="etq">
      {/* ── Row 1: REF / FORN / COL ── */}
      <div className="etq-row etq-row-header">
        <div className="etq-cell etq-cell-wide">
          <span className="etq-lbl">REF.:</span>
          <span className="etq-val etq-val-bold etq-accent">{item.ref}</span>
        </div>
        <div className="etq-cell etq-cell-wide">
          <span className="etq-lbl">FORN.:</span>
          <span className="etq-val etq-accent">{item.fornecedor || "—"}</span>
        </div>
        <div className="etq-cell">
          <span className="etq-lbl">COL.:</span>
          <span className="etq-val etq-accent">{item.colecao || "—"}</span>
        </div>
      </div>

      {/* ── Row 2: DESC ── */}
      <div className="etq-row">
        <div className="etq-cell etq-cell-full">
          <span className="etq-lbl">DESC.:</span>
          <span className="etq-val etq-val-bold">{item.desc}</span>
        </div>
      </div>

      {/* ── Row 3: TECIDO ── */}
      <div className="etq-row">
        <div className="etq-cell etq-cell-half">
          <span className="etq-lbl">TECIDO:</span>
          <span className="etq-val">{item.tecido || "—"}</span>
        </div>
        <div className="etq-cell etq-cell-half">
          <span className="etq-lbl">FORN. TECIDO:</span>
          <span className="etq-val">{item.forn_tecido || "—"}</span>
        </div>
      </div>

      {/* ── Row 4: COMP ── */}
      <div className="etq-row">
        <div className="etq-cell etq-cell-full">
          <span className="etq-lbl">COMP.:</span>
          <span className="etq-val">{item.composicao || "—"}</span>
        </div>
      </div>

      {/* ── Row 5: $ FORN / AVIOS / $ TOTAL ── */}
      <div className="etq-row">
        <div className="etq-cell">
          <span className="etq-lbl">$ FORN:</span>
          <span className="etq-val">{fmtBrl(custo) || "—"}</span>
        </div>
        <div className="etq-sep">-</div>
        <div className="etq-cell">
          <span className="etq-lbl">AVIOS:</span>
          <span className="etq-val">R$</span>
        </div>
        <div className="etq-cell etq-ml-auto">
          <span className="etq-lbl">$ TOTAL:</span>
          <span className="etq-val etq-val-bold">{fmtBrl(custo) || "—"}</span>
        </div>
      </div>

      {/* ── Row 6: $ MKP / PREÇO FINAL ── */}
      <div className="etq-row">
        <div className="etq-cell">
          <span className="etq-lbl">$ MKP {mkpVal ? fmtMkp(mkpVal) : ""}:</span>
          <span className="etq-val">{fmtBrl(precoMkp) || "R$"}</span>
        </div>
        <div className="etq-cell etq-ml-auto">
          <span className="etq-lbl etq-accent">PREÇO FINAL</span>
          <span className="etq-val etq-val-bold etq-val-lg etq-accent">{fmtBrl(varejo) || "R$"}</span>
        </div>
      </div>

      {/* ── Row 7: COR / MKP FINAL ── */}
      <div className="etq-row">
        <div className="etq-cell etq-cell-half">
          <span className="etq-lbl">COR:</span>
          <span className="etq-val etq-cor">{coresStr}</span>
        </div>
        <div className="etq-cell etq-ml-auto">
          <span className="etq-lbl etq-accent">MKP FINAL</span>
          <span className="etq-val etq-accent">{mkpVal ? `${fmtMkp(mkpVal)}x` : ""}</span>
        </div>
      </div>

      {/* ── OBS box ── */}
      <div className="etq-obs">
        <span className="etq-lbl">OBS.:</span>
        <div className="etq-obs-area" />
      </div>

      {/* ── Footer checkboxes ── */}
      <div className="etq-footer">
        <div className="etq-check-block">
          <div className="etq-check-box" />
          <span className="etq-check-lbl etq-lbl-green">APROVADO</span>
        </div>
        <div className="etq-check-block">
          <div className="etq-check-box" />
          <span className="etq-check-lbl etq-lbl-red">COR<br/>CANCELADA</span>
        </div>
        <div className="etq-check-block">
          <div className="etq-check-box" />
          <span className="etq-check-lbl etq-lbl-red">REF.<br/>CANCELADA</span>
        </div>
      </div>
    </div>
  );
}

/* ── Main view ── */
export default function EtiquetasLineView({ rows, variantes }: Props) {
  const [filters, setFilters]       = useState<Record<string, string[]>>({});
  const [selected, setSelected]     = useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);

  const setFilter = (key: string, vals: string[]) =>
    setFilters(prev => ({ ...prev, [key]: vals }));

  const optionsFor = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const f of FILTER_FIELDS)
      map[f.key] = Array.from(new Set(rows.map(i => i[f.key] || "").filter(Boolean))).sort();
    return map;
  }, [rows]);

  const filtered = useMemo(() => rows.filter(i => {
    for (const [key, vals] of Object.entries(filters)) {
      if (vals.length === 0) continue;
      if (!vals.includes(i[key] || "")) return false;
    }
    return true;
  }), [rows, filters]);

  const activeCount = Object.values(filters).filter(v => v.length > 0).length;

  useEffect(() => { setSelected(new Set(filtered.map(r => r.ref))); }, [filtered]);

  const toggleRef  = (ref: string) => setSelected(prev => { const n = new Set(prev); n.has(ref) ? n.delete(ref) : n.add(ref); return n; });
  const toggleAll  = () => setSelected(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(r => r.ref)));
  const toGenerate = filtered.filter(r => selected.has(r.ref));

  return (
    <>
      <style>{`
        /* ════════════ SCREEN ════════════ */
        @media screen {
          .etq {
            width: 340px;
            border: 1.5px solid #c8a800;
            background: #fff;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 10px;
          }
          .etq-row {
            display: flex; align-items: center;
            border-bottom: 1px solid #e8d080;
            padding: 2px 5px; min-height: 17px; gap: 6px;
          }
          .etq-row-header { background: #fdf3b0; }
          .etq-cell { display: flex; align-items: baseline; gap: 3px; flex-shrink: 0; }
          .etq-cell-full { flex: 1; }
          .etq-cell-wide { flex: 1; }
          .etq-cell-half { flex: 1; min-width: 0; overflow: hidden; }
          .etq-lbl { color: #8a7000; font-weight: 700; font-size: 8px; text-transform: uppercase; white-space: nowrap; }
          .etq-val { color: #00008b; font-size: 9px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .etq-val-bold { font-weight: 700; }
          .etq-val-lg { font-size: 11px; }
          .etq-accent { color: #0033cc; }
          .etq-cor { font-size: 8px; overflow: hidden; text-overflow: ellipsis; }
          .etq-sep { color: #999; font-size: 9px; }
          .etq-ml-auto { margin-left: auto; }
          .etq-obs { border-bottom: 1px solid #e8d080; padding: 2px 5px; }
          .etq-obs-area { height: 22px; border: 1px solid #ddd; margin-top: 2px; background: #fafafa; }
          .etq-footer {
            display: flex; border-top: 1.5px solid #c8a800;
            background: #fdf3b0;
          }
          .etq-check-block {
            flex: 1; display: flex; align-items: center; justify-content: center;
            gap: 4px; padding: 4px 2px; border-right: 1px solid #e8d080;
          }
          .etq-check-block:last-child { border-right: none; }
          .etq-check-box {
            width: 12px; height: 12px; border: 1.5px solid #888;
            flex-shrink: 0; background: white;
          }
          .etq-check-lbl { font-size: 7.5px; font-weight: 700; text-align: center; line-height: 1.2; }
          .etq-lbl-green { color: #1a7a1a; }
          .etq-lbl-red { color: #cc0000; }
        }

        /* ════════════ PRINT — Pimaco 6183 (99.1×57mm, 2×5=10/A4) ════════════ */
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body > * { display: none !important; }
          #etq-print { display: block !important; position: fixed; inset: 0; background: white; }

          .etq-sheet {
            padding-top: 15.1mm;
            padding-left: 4.7mm;
            display: grid;
            grid-template-columns: 99.1mm 99.1mm;
            column-gap: 2.5mm;
            row-gap: 0mm;
            page-break-after: always;
          }
          .etq {
            width: 99.1mm;
            height: 57mm;
            box-sizing: border-box;
            border: 0.4pt solid #c8a800;
            background: white;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 6.5pt;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            page-break-inside: avoid;
          }
          .etq-row {
            display: flex; align-items: center;
            border-bottom: 0.3pt solid #e8d080;
            padding: 1pt 3pt; min-height: 0; gap: 4pt; flex-shrink: 0;
          }
          .etq-row-header { background: #fdf3b0; }
          .etq-cell { display: flex; align-items: baseline; gap: 2pt; flex-shrink: 0; }
          .etq-cell-full { flex: 1; min-width: 0; }
          .etq-cell-wide { flex: 1; min-width: 0; }
          .etq-cell-half { flex: 1; min-width: 0; overflow: hidden; }
          .etq-lbl { color: #8a7000; font-weight: 700; font-size: 5pt; text-transform: uppercase; white-space: nowrap; }
          .etq-val { color: #00008b; font-size: 6pt; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .etq-val-bold { font-weight: 700; }
          .etq-val-lg { font-size: 7.5pt; }
          .etq-accent { color: #0033cc; }
          .etq-cor { font-size: 5pt; max-width: 40mm; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .etq-sep { color: #999; font-size: 6pt; }
          .etq-ml-auto { margin-left: auto; }
          .etq-obs { border-bottom: 0.3pt solid #e8d080; padding: 1pt 3pt; flex-shrink: 0; }
          .etq-obs-area { height: 5mm; border: 0.3pt solid #ccc; margin-top: 1pt; background: white; }
          .etq-footer {
            display: flex; border-top: 0.4pt solid #c8a800;
            background: #fdf3b0; margin-top: auto;
          }
          .etq-check-block {
            flex: 1; display: flex; align-items: center; justify-content: center;
            gap: 2pt; padding: 2pt; border-right: 0.3pt solid #e8d080;
          }
          .etq-check-block:last-child { border-right: none; }
          .etq-check-box { width: 4mm; height: 4mm; border: 0.5pt solid #888; flex-shrink: 0; background: white; }
          .etq-check-lbl { font-size: 5pt; font-weight: 700; text-align: center; line-height: 1.2; }
          .etq-lbl-green { color: #1a7a1a; }
          .etq-lbl-red { color: #cc0000; }
        }
      `}</style>

      <div style={{ padding: "0 0 40px" }}>

        {/* ── Toolbar ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
          padding: "12px 0", borderBottom: filtersOpen ? "none" : "1px solid var(--separator)", marginBottom: filtersOpen ? 0 : 16 }}>

          <button onClick={() => setFiltersOpen(o => !o)} style={{
            display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600,
            padding: "5px 12px", borderRadius: 7, border: "1px solid", cursor: "pointer",
            background: activeCount > 0 ? "var(--system-blue)" : "var(--bg-secondary)",
            borderColor: activeCount > 0 ? "var(--system-blue)" : "var(--separator)",
            color: activeCount > 0 ? "#fff" : "var(--label-secondary)",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
            Filtros{activeCount > 0 ? ` (${activeCount})` : ""}
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              style={{ transform: filtersOpen ? "rotate(180deg)" : "none" }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {activeCount > 0 && (
            <button className="apple-btn-secondary" onClick={() => setFilters({})} style={{ fontSize: 12, padding: "5px 10px" }}>
              Limpar
            </button>
          )}

          <div style={{ width: 1, height: 24, background: "var(--separator)" }} />

          <button className="apple-btn-secondary" onClick={toggleAll} style={{ fontSize: 12, padding: "5px 12px" }}>
            {selected.size === filtered.length ? "Desmarcar todos" : "Selecionar todos"}
          </button>

          <span style={{ fontSize: 12, color: "var(--label-tertiary)" }}>
            {selected.size} selecionada{selected.size !== 1 ? "s" : ""} de {filtered.length}
          </span>

          <div style={{ marginLeft: "auto" }}>
            <button className="apple-btn-primary" onClick={() => window.print()} disabled={toGenerate.length === 0}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, padding: "7px 16px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Imprimir ({toGenerate.length})
            </button>
          </div>
        </div>

        {/* ── Filter panel ── */}
        {filtersOpen && (
          <div style={{ padding: "14px 16px", marginBottom: 16, background: "var(--bg-secondary)",
            borderRadius: "0 0 10px 10px", border: "1px solid var(--separator)", borderTop: "none" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {FILTER_FIELDS.map(f => (
                <MultiSelect key={f.key} label={f.label} options={optionsFor[f.key] || []}
                  selected={filters[f.key] || []} onChange={vals => setFilter(f.key, vals)} />
              ))}
            </div>
          </div>
        )}

        {/* ── Preview grid ── */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "var(--label-tertiary)", fontSize: 14 }}>Nenhum produto encontrado.</div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            {filtered.map(item => {
              const sel = selected.has(item.ref);
              const cores = variantes[item.ref] || [];
              return (
                <div key={item.ref} onClick={() => toggleRef(item.ref)} style={{
                  position: "relative", cursor: "pointer",
                  outline: sel ? "2.5px solid var(--system-blue)" : "2.5px solid transparent",
                  outlineOffset: 3, borderRadius: 4,
                  opacity: sel ? 1 : 0.45,
                  transition: "opacity .15s, outline .1s",
                }}>
                  {/* Checkmark badge */}
                  <div style={{
                    position: "absolute", top: -7, right: -7, zIndex: 3,
                    width: 20, height: 20, borderRadius: "50%",
                    background: sel ? "var(--system-blue)" : "#fff",
                    border: `2px solid ${sel ? "var(--system-blue)" : "#ccc"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
                  }}>
                    {sel && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <Etiqueta item={item} cores={cores} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Print area ── */}
      <div id="etq-print" style={{ display: "none" }}>
        {Array.from({ length: Math.ceil(toGenerate.length / 10) }, (_, si) => {
          const page = toGenerate.slice(si * 10, si * 10 + 10);
          const padded = [...page];
          if (padded.length % 2 !== 0) padded.push(null as any);
          return (
            <div key={si} className="etq-sheet">
              {padded.map((item, idx) =>
                item
                  ? <Etiqueta key={item.ref + idx} item={item} cores={variantes[item.ref] || []} />
                  : <div key={"pad" + idx} style={{ width: "99.1mm", height: "57mm" }} />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
