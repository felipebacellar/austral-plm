"use client";
import { useEffect, useMemo, useRef, useState } from "react";

/* ── Types ─────────────────────────────────────────────────────── */
interface Props { rows: any[]; variantes: Record<string, string[]> }

/* ── Helpers ────────────────────────────────────────────────────── */
const isMost = (s: string) => s?.toUpperCase().includes("MOSTRUÁRIO") || s?.toUpperCase().includes("MOSTRUARIO");
const isProd = (s: string) => s?.toUpperCase().includes("PRODUÇÃO") || s?.toUpperCase().includes("PRODUCAO") || s?.toUpperCase().includes("REPILOTANDO");
const fmtBrl = (v: number | null) => v != null && v > 0 ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—";
const fmtMkp = (v: number | null) => v != null && v > 0 ? `${v.toFixed(2)}x` : "—";

function mkpCalc(item: any, final: boolean): number | null {
  if (final) {
    if (item.varejo_final && item.custo_final && item.custo_final > 0)
      return item.varejo_final / item.custo_final;
  } else {
    if (item.markup_inicial) return item.markup_inicial;
    if (item.preco_target && item.custo_inicial && item.custo_inicial > 0)
      return item.preco_target / item.custo_inicial;
  }
  return null;
}

/* ── Filter fields (same order as MapaColecaoView) ─────────────── */
const FILTER_FIELDS = [
  { key: "tecido",       label: "Tecido" },
  { key: "forn_tecido",  label: "Forn. Tecido" },
  { key: "status",       label: "Status" },
  { key: "piloto_most",  label: "Piloto / Mostr." },
  { key: "colecao",      label: "Coleção" },
  { key: "grupo",        label: "Grupo" },
  { key: "subgrupo",     label: "Subgrupo" },
  { key: "operacao",     label: "Operação" },
  { key: "fornecedor",   label: "Fornecedor" },
  { key: "categoria",    label: "Categoria" },
  { key: "subcategoria", label: "Subcategoria" },
  { key: "tipo",         label: "Tipo" },
  { key: "linha",        label: "Linha" },
  { key: "drop",         label: "Drop" },
  { key: "estilista",    label: "Estilista" },
];

/* ── MultiSelect (inline, same as MapaColecaoView) ─────────────── */
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
        display: "flex", alignItems: "center", gap: 5, fontSize: 12,
        padding: "5px 10px", borderRadius: 7, border: "1px solid",
        cursor: "pointer", whiteSpace: "nowrap", transition: "all .15s",
        background: active ? "var(--system-blue)" : "var(--bg-secondary)",
        borderColor: active ? "var(--system-blue)" : "var(--separator)",
        color: active ? "#fff" : "var(--label-secondary)", fontWeight: active ? 600 : 400,
      }}>
        {label}{active ? ` (${selected.length})` : ""}
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s", opacity: .7 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 1000,
          background: "var(--bg-primary)", border: "1px solid var(--separator)",
          borderRadius: 10, boxShadow: "0 8px 28px rgba(0,0,0,0.15)",
          minWidth: 220, maxWidth: 300, padding: "6px 0",
        }}>
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
                <label key={opt} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px", cursor: "pointer", background: checked ? "var(--bg-secondary)" : "transparent" }}>
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

/* ── Single label component (print + screen) ────────────────────── */
function Etiqueta({ item, cores }: { item: any; cores: string[] }) {
  const useFinal = isMost(item.status) || isProd(item.status);
  const custo   = useFinal ? item.custo_final   : item.custo_inicial;
  const varejo  = useFinal ? item.varejo_final  : item.preco_target;
  const mkp     = mkpCalc(item, useFinal);
  const statusLabel = useFinal ? (isProd(item.status) ? "PRODUÇÃO" : "MOSTRUÁRIO") : "DESENVOLVIMENTO";

  return (
    <div className="etiqueta-line">
      {/* Header strip */}
      <div className="etq-header">
        <span className="etq-brand">AUSTRAL</span>
        <span className="etq-status-badge" data-status={statusLabel}>{statusLabel}</span>
      </div>

      {/* Ref + Desc */}
      <div className="etq-body">
        <div className="etq-ref-row">
          <span className="etq-ref">{item.ref}</span>
          {item.colecao && <span className="etq-colecao">{item.colecao}</span>}
        </div>
        <div className="etq-desc">{item.desc}</div>

        {/* Fabric */}
        {(item.tecido || item.composicao) && (
          <div className="etq-fabric">
            {[item.tecido, item.composicao].filter(Boolean).join(" · ")}
          </div>
        )}

        {/* Cores/Variantes */}
        {cores.length > 0 && (
          <div className="etq-cores-row">
            {cores.map(c => <span key={c} className="etq-cor-chip">{c}</span>)}
          </div>
        )}
      </div>

      {/* Price footer */}
      <div className="etq-footer">
        <div className="etq-price-block">
          <span className="etq-price-label">Custo</span>
          <span className="etq-price-value">{fmtBrl(custo)}</span>
        </div>
        <div className="etq-price-divider" />
        <div className="etq-price-block">
          <span className="etq-price-label">Markup</span>
          <span className="etq-price-value">{fmtMkp(mkp)}</span>
        </div>
        <div className="etq-price-divider" />
        <div className="etq-price-block etq-price-main">
          <span className="etq-price-label">Varejo</span>
          <span className="etq-price-value etq-varejo">{fmtBrl(varejo)}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Main view ──────────────────────────────────────────────────── */
export default function EtiquetasLineView({ rows, variantes }: Props) {
  const [filters, setFilters]     = useState<Record<string, string[]>>({});
  const [selected, setSelected]   = useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);

  const setFilter = (key: string, vals: string[]) =>
    setFilters(prev => ({ ...prev, [key]: vals }));

  const optionsFor = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const f of FILTER_FIELDS) {
      map[f.key] = Array.from(new Set(rows.map(i => i[f.key] || "").filter(Boolean))).sort();
    }
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

  // Auto-select all filtered on filter change
  useEffect(() => {
    setSelected(new Set(filtered.map(r => r.ref)));
  }, [filtered]);

  const toggleRef = (ref: string) =>
    setSelected(prev => { const n = new Set(prev); n.has(ref) ? n.delete(ref) : n.add(ref); return n; });

  const toggleAll = () =>
    setSelected(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(r => r.ref)));

  const toGenerate = filtered.filter(r => selected.has(r.ref));

  const handlePrint = () => window.print();

  return (
    <>
      {/* ── Print styles (Pimaco 6183: 99.1×57mm, 2col×5row) ── */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #etiquetas-print-area { display: block !important; }
          #etiquetas-print-area {
            position: fixed; inset: 0; z-index: 99999;
            background: white;
          }
          .etiquetas-sheet {
            padding: 15.1mm 4.7mm 0;
            width: 210mm;
            display: grid;
            grid-template-columns: 99.1mm 99.1mm;
            column-gap: 2.5mm;
            row-gap: 0;
            page-break-after: always;
          }
          .etiqueta-line {
            width: 99.1mm;
            height: 57mm;
            box-sizing: border-box;
            border: 0.3pt solid #ccc;
            display: flex;
            flex-direction: column;
            font-family: Arial, sans-serif;
            overflow: hidden;
            page-break-inside: avoid;
            background: white;
          }
          .etq-header {
            background: #1a1a2e;
            padding: 2mm 3mm;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-shrink: 0;
          }
          .etq-brand {
            color: white;
            font-size: 8pt;
            font-weight: 700;
            letter-spacing: 0.12em;
          }
          .etq-status-badge {
            font-size: 5.5pt;
            font-weight: 700;
            padding: 0.5mm 2mm;
            border-radius: 2mm;
            letter-spacing: 0.04em;
          }
          .etq-status-badge[data-status="DESENVOLVIMENTO"] { background: #4464AF22; color: #4464AF; }
          .etq-status-badge[data-status="MOSTRUÁRIO"] { background: #EDCA3522; color: #a07b00; }
          .etq-status-badge[data-status="PRODUÇÃO"] { background: #2DB56422; color: #1a6e3c; }
          .etq-body {
            flex: 1;
            padding: 1.5mm 3mm 1mm;
            display: flex;
            flex-direction: column;
            gap: 0.8mm;
            overflow: hidden;
          }
          .etq-ref-row { display: flex; align-items: baseline; justify-content: space-between; gap: 2mm; }
          .etq-ref { font-size: 9pt; font-weight: 700; color: #111; }
          .etq-colecao { font-size: 5.5pt; color: #666; letter-spacing: 0.04em; }
          .etq-desc { font-size: 7pt; color: #222; line-height: 1.25; max-height: 2.5em; overflow: hidden; font-weight: 500; }
          .etq-fabric { font-size: 5.5pt; color: #666; line-height: 1.3; }
          .etq-cores-row { display: flex; flex-wrap: wrap; gap: 0.8mm; margin-top: 0.5mm; }
          .etq-cor-chip {
            font-size: 5pt; padding: 0.3mm 1.5mm;
            border: 0.3pt solid #bbb; border-radius: 1mm;
            color: #444; background: #f5f5f5; white-space: nowrap;
          }
          .etq-footer {
            border-top: 0.3pt solid #ddd;
            display: flex;
            align-items: stretch;
            flex-shrink: 0;
            background: #f9f9fb;
          }
          .etq-price-block {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 1.5mm 1mm;
          }
          .etq-price-main { flex: 1.4; background: #1a1a2e08; }
          .etq-price-label { font-size: 5pt; color: #999; text-transform: uppercase; letter-spacing: 0.06em; }
          .etq-price-value { font-size: 7pt; font-weight: 700; color: #111; }
          .etq-varejo { font-size: 8.5pt; color: #1a1a2e; }
          .etq-price-divider { width: 0.3pt; background: #ddd; margin: 2mm 0; }
          /* Hide screen elements */
          .etq-screen-only { display: none !important; }
        }

        @media screen {
          .etiqueta-line {
            width: 250px;
            height: 145px;
            border: 1px solid var(--separator);
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            background: var(--bg-primary);
            box-shadow: 0 1px 4px rgba(0,0,0,0.07);
            font-family: var(--font-sans, system-ui);
            transition: box-shadow .15s, transform .15s;
          }
          .etq-header {
            background: #1a1a2e;
            padding: 5px 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-shrink: 0;
          }
          .etq-brand {
            color: white; font-size: 9px; font-weight: 800;
            letter-spacing: 0.14em;
          }
          .etq-status-badge {
            font-size: 8px; font-weight: 700;
            padding: 2px 6px; border-radius: 4px;
            letter-spacing: 0.03em;
          }
          .etq-status-badge[data-status="DESENVOLVIMENTO"] { background: #4464AF25; color: #4464AF; }
          .etq-status-badge[data-status="MOSTRUÁRIO"] { background: #EDCA3525; color: #9a7600; }
          .etq-status-badge[data-status="PRODUÇÃO"] { background: #2DB56425; color: #1a7040; }
          .etq-body {
            flex: 1; padding: 6px 10px 4px;
            display: flex; flex-direction: column; gap: 2px; overflow: hidden;
          }
          .etq-ref-row { display: flex; align-items: baseline; justify-content: space-between; gap: 6px; }
          .etq-ref { font-size: 11px; font-weight: 700; color: var(--label-primary); }
          .etq-colecao { font-size: 9px; color: var(--label-tertiary); }
          .etq-desc { font-size: 10px; color: var(--label-secondary); line-height: 1.3;
            overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
          .etq-fabric { font-size: 9px; color: var(--label-tertiary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .etq-cores-row { display: flex; flex-wrap: wrap; gap: 3px; }
          .etq-cor-chip { font-size: 8px; padding: 1px 5px; border: 1px solid var(--separator);
            border-radius: 3px; color: var(--label-secondary); background: var(--bg-secondary); white-space: nowrap; }
          .etq-footer {
            border-top: 1px solid var(--separator);
            display: flex; align-items: stretch; flex-shrink: 0;
            background: var(--bg-secondary);
          }
          .etq-price-block {
            flex: 1; display: flex; flex-direction: column;
            align-items: center; justify-content: center; padding: 5px 4px;
          }
          .etq-price-main { flex: 1.4; background: rgba(0,0,0,0.02); }
          .etq-price-label { font-size: 8px; color: var(--label-tertiary); text-transform: uppercase; letter-spacing: 0.05em; }
          .etq-price-value { font-size: 10px; font-weight: 700; color: var(--label-primary); }
          .etq-varejo { font-size: 12px; color: #1a1a2e; }
          .etq-price-divider { width: 1px; background: var(--separator); margin: 4px 0; }
        }
      `}</style>

      <div style={{ padding: "0 0 40px" }}>

        {/* ── Toolbar ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
          padding: "12px 0", borderBottom: filtersOpen ? "none" : "1px solid var(--separator)", marginBottom: filtersOpen ? 0 : 16 }}>

          {/* Filters toggle */}
          <button onClick={() => setFiltersOpen(o => !o)} style={{
            display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600,
            padding: "5px 12px", borderRadius: 7, border: "1px solid", cursor: "pointer", transition: "all .15s",
            background: activeCount > 0 ? "var(--system-blue)" : "var(--bg-secondary)",
            borderColor: activeCount > 0 ? "var(--system-blue)" : "var(--separator)",
            color: activeCount > 0 ? "#fff" : "var(--label-secondary)",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
            Filtros{activeCount > 0 ? ` (${activeCount})` : ""}
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              style={{ transform: filtersOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {activeCount > 0 && (
            <button className="apple-btn-secondary" onClick={() => setFilters({})} style={{ fontSize: 12, padding: "5px 10px" }}>
              Limpar
            </button>
          )}

          <div style={{ width: 1, height: 24, background: "var(--separator)" }} />

          {/* Select all / none */}
          <button className="apple-btn-secondary" onClick={toggleAll} style={{ fontSize: 12, padding: "5px 12px" }}>
            {selected.size === filtered.length ? "Desmarcar todos" : "Selecionar todos"}
          </button>

          <span style={{ fontSize: 12, color: "var(--label-tertiary)" }}>
            {selected.size} selecionada{selected.size !== 1 ? "s" : ""} de {filtered.length}
          </span>

          <div style={{ marginLeft: "auto" }}>
            <button className="apple-btn-primary" onClick={handlePrint} disabled={toGenerate.length === 0}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, padding: "7px 16px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Imprimir ({toGenerate.length})
            </button>
          </div>
        </div>

        {/* ── Filter panel ── */}
        {filtersOpen && (
          <div style={{
            padding: "14px 16px", marginBottom: 16,
            background: "var(--bg-secondary)", borderRadius: "0 0 10px 10px",
            border: "1px solid var(--separator)", borderTop: "none",
          }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {FILTER_FIELDS.map(f => (
                <MultiSelect key={f.key} label={f.label} options={optionsFor[f.key] || []}
                  selected={filters[f.key] || []} onChange={vals => setFilter(f.key, vals)} />
              ))}
            </div>
          </div>
        )}

        {/* ── Selection grid (screen only) ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          {filtered.map(item => {
            const sel = selected.has(item.ref);
            const cores = variantes[item.ref] || [];
            return (
              <div key={item.ref} onClick={() => toggleRef(item.ref)} style={{
                position: "relative", cursor: "pointer",
                outline: sel ? "2px solid var(--system-blue)" : "2px solid transparent",
                borderRadius: 10, transition: "outline .1s",
              }}>
                {/* Checkbox */}
                <div style={{
                  position: "absolute", top: -6, right: -6, zIndex: 3,
                  width: 20, height: 20, borderRadius: "50%",
                  background: sel ? "var(--system-blue)" : "var(--bg-secondary)",
                  border: `2px solid ${sel ? "var(--system-blue)" : "var(--separator)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                }}>
                  {sel && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <Etiqueta item={item} cores={cores} />
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "var(--label-tertiary)", fontSize: 14 }}>Nenhum produto encontrado.</div>
        )}
      </div>

      {/* ── Print area (hidden on screen) ── */}
      <div id="etiquetas-print-area" style={{ display: "none" }}>
        {/* Split into sheets of 10 */}
        {Array.from({ length: Math.ceil(toGenerate.length / 10) }, (_, si) => {
          const pageItems = toGenerate.slice(si * 10, si * 10 + 10);
          // Pad to even number for grid
          const padded = [...pageItems];
          if (padded.length % 2 !== 0) padded.push(null as any);
          return (
            <div key={si} className="etiquetas-sheet">
              {padded.map((item, idx) =>
                item ? (
                  <Etiqueta key={item.ref + idx} item={item} cores={variantes[item.ref] || []} />
                ) : (
                  <div key={"pad-" + idx} style={{ width: "99.1mm", height: "57mm" }} />
                )
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
