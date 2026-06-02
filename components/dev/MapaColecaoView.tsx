"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchMapaColecao } from "@/lib/db";
import { exportMapaColecaoPDF } from "@/lib/export-pdf-mapa";

const STATUS_COLORS: Record<string, string> = {
  DESENVOLVIMENTO: "#4464AF",
  "MOSTRUÁRIO": "#EDCA35",
  "MOSTRUÁRIO LIBERADO": "#EDCA35",
  PRODUÇÃO: "#2DB564",
  "PRODUÇÃO LIBERADA": "#2DB564",
  CANCELADO: "#EA2F46",
};

function statusColor(status: string): string {
  const key = Object.keys(STATUS_COLORS).find(k => status.toUpperCase().includes(k));
  return key ? STATUS_COLORS[key] : "#aaa";
}

// Fields used in filter panel (order matches DevTable header, excluding composição/ficha/grade)
const FILTER_FIELDS: { key: string; label: string; text?: true }[] = [
  { key: "ref",          label: "Referência",      text: true },
  { key: "desc",         label: "Descrição",        text: true },
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
  { key: "tab_medidas",  label: "Tab. Medidas" },
  { key: "tipo",         label: "Tipo" },
  { key: "linha",        label: "Linha" },
  { key: "drop",         label: "Drop" },
  { key: "estilista",    label: "Estilista" },
];

// ── Reusable multi-select dropdown ───────────────────────────────────────────
function MultiSelect({
  label, options, selected, onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const visible = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  const active  = selected.length > 0;

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 5,
          fontSize: 12, padding: "5px 10px", borderRadius: 7, border: "1px solid",
          cursor: "pointer", whiteSpace: "nowrap", transition: "all .15s",
          background: active ? "var(--system-blue)" : "var(--bg-secondary)",
          borderColor: active ? "var(--system-blue)" : "var(--separator)",
          color: active ? "#fff" : "var(--label-secondary)",
          fontWeight: active ? 600 : 400,
        }}
      >
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
          {/* Search */}
          {options.length > 6 && (
            <div style={{ padding: "4px 10px 6px", borderBottom: "1px solid var(--separator)" }}>
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar…"
                style={{
                  width: "100%", fontSize: 12, padding: "4px 8px",
                  border: "1px solid var(--separator)", borderRadius: 6,
                  background: "var(--bg-secondary)", color: "var(--label-primary)", outline: "none",
                }}
              />
            </div>
          )}
          {/* Select all / clear */}
          <div style={{ display: "flex", gap: 8, padding: "4px 10px 5px", borderBottom: "1px solid var(--separator)" }}>
            <button onClick={() => onChange(options)} style={{ fontSize: 11, color: "var(--system-blue)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Todos</button>
            <span style={{ color: "var(--separator)" }}>·</span>
            <button onClick={() => onChange([])} style={{ fontSize: 11, color: "var(--label-tertiary)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Limpar</button>
          </div>
          {/* Options */}
          <div style={{ maxHeight: 260, overflowY: "auto" }}>
            {visible.length === 0 && (
              <div style={{ padding: "10px 12px", fontSize: 12, color: "var(--label-tertiary)" }}>Nenhum resultado</div>
            )}
            {visible.map(opt => {
              const checked = selected.includes(opt);
              const dot = statusColor(opt);
              return (
                <label key={opt}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "5px 12px",
                    cursor: "pointer", background: checked ? "var(--bg-secondary)" : "transparent",
                  }}
                >
                  <input type="checkbox" checked={checked}
                    onChange={() => onChange(checked ? selected.filter(x => x !== opt) : [...selected, opt])}
                    style={{ accentColor: "var(--system-blue)", width: 13, height: 13, flexShrink: 0 }}
                  />
                  {dot !== "#aaa" && <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot, flexShrink: 0 }} />}
                  <span style={{ fontSize: 12, color: "var(--label-primary)", lineHeight: 1.3 }}>{opt || "—"}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface Props { rows: any[] }

export default function MapaColecaoView({ rows: _rows }: Props) {
  const [items, setItems]         = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [exporting, setExporting] = useState(false);
  const [imageMode, setImageMode] = useState<"desenho" | "foto">("desenho");
  const [zoom, setZoom]           = useState<any | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // text searches
  const [searchRef,  setSearchRef]  = useState("");
  const [searchDesc, setSearchDesc] = useState("");

  // multi-select filters: key → selected values
  const [filters, setFilters] = useState<Record<string, string[]>>({});

  const setFilter = (key: string, vals: string[]) =>
    setFilters(prev => ({ ...prev, [key]: vals }));

  useEffect(() => {
    fetchMapaColecao().then(data => { setItems(data); setLoading(false); });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setZoom(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Unique sorted option lists for each field
  const optionsFor = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const f of FILTER_FIELDS) {
      if (f.text) continue;
      map[f.key] = Array.from(new Set(
        items.map(i => i[f.key] || "").filter(Boolean)
      )).sort();
    }
    return map;
  }, [items]);

  const activeCount = useMemo(() =>
    (searchRef ? 1 : 0) + (searchDesc ? 1 : 0) +
    Object.values(filters).filter(v => v.length > 0).length,
  [searchRef, searchDesc, filters]);

  const filtered = useMemo(() => items.filter(i => {
    if (searchRef  && !i.ref.toLowerCase().includes(searchRef.toLowerCase()))   return false;
    if (searchDesc && !i.desc.toLowerCase().includes(searchDesc.toLowerCase())) return false;
    for (const [key, vals] of Object.entries(filters)) {
      if (vals.length === 0) continue;
      const v = i[key] || "";
      if (!vals.includes(v)) return false;
    }
    return true;
  }), [items, searchRef, searchDesc, filters]);

  const groups = useMemo(() => {
    const g: Record<string, any[]> = {};
    for (const it of filtered) { const k = it.grupo || "SEM GRUPO"; if (!g[k]) g[k] = []; g[k].push(it); }
    return Object.entries(g).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const imgOf = (item: any) => imageMode === "foto" ? (item.imagem_modelo || item.imagem_url) : item.imagem_url;

  const clearAll = () => { setSearchRef(""); setSearchDesc(""); setFilters({}); };

  const handleExport = async () => {
    setExporting(true);
    try {
      const fStr = (key: string) => (filters[key] || []).join(", ");
      await exportMapaColecaoPDF(
        filtered,
        {
          colecao: fStr("colecao"), fornecedor: fStr("fornecedor"),
          grupo: fStr("grupo"), linha: fStr("linha"), status: fStr("status"),
        },
        imageMode,
        "mapa-colecao"
      );
    } finally { setExporting(false); }
  };

  if (loading) return (
    <div className="plm-loading"><div className="plm-loading-spinner" /><span>Carregando mapa...</span></div>
  );

  return (
    <div style={{ padding: "0 0 40px" }}>

      {/* ── Lightbox ── */}
      {zoom && (
        <div onClick={() => setZoom(null)} style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "var(--bg-primary)", borderRadius: 16,
            boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
            maxWidth: 700, width: "90vw", overflow: "hidden",
            display: "flex", flexDirection: "column",
          }}>
            <div style={{ background: "#fff", padding: 16, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 360 }}>
              {imgOf(zoom) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imgOf(zoom)} alt={zoom.ref} style={{ maxWidth: "100%", maxHeight: "55vh", objectFit: "contain" }} />
              ) : (
                <div style={{ color: "var(--label-tertiary)", textAlign: "center", fontSize: 13 }}>Sem imagem</div>
              )}
            </div>
            <div style={{ padding: "16px 20px 20px", borderTop: "1px solid var(--separator)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "var(--label-primary)" }}>{zoom.ref}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--label-primary)", marginTop: 2 }}>{zoom.desc}</div>
                </div>
                <button onClick={() => setZoom(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--label-tertiary)", padding: 4 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 20px", marginTop: 12, fontSize: 12 }}>
                {zoom.tecido     && <div><span style={{ color: "var(--label-tertiary)" }}>Tecido: </span><span style={{ color: "var(--label-secondary)", fontWeight: 500 }}>{zoom.tecido}</span></div>}
                {zoom.composicao && <div><span style={{ color: "var(--label-tertiary)" }}>Comp.: </span><span style={{ color: "var(--label-secondary)" }}>{zoom.composicao}</span></div>}
                {zoom.forn_tecido && <div><span style={{ color: "var(--label-tertiary)" }}>Forn. Tecido: </span><span style={{ color: "var(--label-secondary)" }}>{zoom.forn_tecido}</span></div>}
                {zoom.fornecedor && <div><span style={{ color: "var(--label-tertiary)" }}>Fornecedor: </span><span style={{ color: "var(--system-blue)", fontWeight: 600 }}>{zoom.fornecedor}</span></div>}
                {zoom.colecao    && <div><span style={{ color: "var(--label-tertiary)" }}>Coleção: </span><span style={{ color: "var(--label-secondary)" }}>{zoom.colecao}</span></div>}
                {zoom.grupo      && <div><span style={{ color: "var(--label-tertiary)" }}>Grupo: </span><span style={{ color: "var(--label-secondary)" }}>{zoom.grupo}</span></div>}
                {zoom.linha      && <div><span style={{ color: "var(--label-tertiary)" }}>Linha: </span><span style={{ color: "var(--label-secondary)" }}>{zoom.linha}</span></div>}
                {zoom.estilista  && <div><span style={{ color: "var(--label-tertiary)" }}>Estilista: </span><span style={{ color: "var(--label-secondary)" }}>{zoom.estilista}</span></div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toolbar (row 1) ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
        marginBottom: filtersOpen ? 0 : 16, padding: "12px 0",
        borderBottom: filtersOpen ? "none" : "1px solid var(--separator)",
      }}>

        {/* Image mode toggle */}
        <div style={{ display: "flex", background: "var(--bg-secondary)", borderRadius: 8, border: "1px solid var(--separator)", padding: 2, gap: 2 }}>
          {(["desenho", "foto"] as const).map(mode => (
            <button key={mode} onClick={() => setImageMode(mode)} style={{
              fontSize: 12, fontWeight: 600, padding: "5px 14px", borderRadius: 6, border: "none",
              cursor: "pointer", transition: "all .15s",
              background: imageMode === mode ? "var(--bg-primary)" : "transparent",
              color: imageMode === mode ? "var(--system-blue)" : "var(--label-tertiary)",
              boxShadow: imageMode === mode ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
            }}>
              {mode === "desenho" ? "✏️ Desenho" : "📷 Foto"}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 24, background: "var(--separator)" }} />

        {/* Filters toggle button */}
        <button
          onClick={() => setFiltersOpen(o => !o)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 7,
            border: "1px solid", cursor: "pointer", transition: "all .15s",
            background: activeCount > 0 ? "var(--system-blue)" : "var(--bg-secondary)",
            borderColor: activeCount > 0 ? "var(--system-blue)" : "var(--separator)",
            color: activeCount > 0 ? "#fff" : "var(--label-secondary)",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
          Filtros{activeCount > 0 ? ` (${activeCount})` : ""}
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            style={{ transform: filtersOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {activeCount > 0 && (
          <button className="apple-btn-secondary" onClick={clearAll} style={{ fontSize: 12, padding: "5px 10px" }}>
            Limpar tudo
          </button>
        )}

        <span style={{ fontSize: 12, color: "var(--label-tertiary)", marginLeft: 4 }}>
          {filtered.length} produto{filtered.length !== 1 ? "s" : ""} · {groups.length} grupo{groups.length !== 1 ? "s" : ""}
        </span>

        <div style={{ marginLeft: "auto" }}>
          <button className="apple-btn-primary" onClick={handleExport} disabled={exporting || filtered.length === 0}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, padding: "7px 16px" }}>
            {exporting ? (
              <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />Gerando...</>
            ) : (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Exportar PDF</>
            )}
          </button>
        </div>
      </div>

      {/* ── Filter panel (row 2, collapsible) ── */}
      {filtersOpen && (
        <div style={{
          padding: "14px 16px", marginBottom: 16,
          background: "var(--bg-secondary)", borderRadius: "0 0 10px 10px",
          border: "1px solid var(--separator)", borderTop: "none",
        }}>
          {/* Text searches */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
            {[{ key: "searchRef", label: "Referência", val: searchRef, set: setSearchRef },
              { key: "searchDesc", label: "Descrição", val: searchDesc, set: setSearchDesc }]
              .map(({ key, label, val, set }) => (
                <div key={key} style={{ position: "relative" }}>
                  <input
                    value={val}
                    onChange={e => set(e.target.value)}
                    placeholder={label}
                    className="apple-input"
                    style={{ fontSize: 12, padding: "5px 28px 5px 10px", minWidth: 160, borderRadius: 7,
                      borderColor: val ? "var(--system-blue)" : undefined,
                      background: val ? "var(--system-blue-tint, #eef3ff)" : undefined,
                    }}
                  />
                  {val && (
                    <button onClick={() => set("")} style={{
                      position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer", color: "var(--label-tertiary)", padding: 0, lineHeight: 1,
                    }}>✕</button>
                  )}
                </div>
              ))}
          </div>

          {/* Multi-select filters */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {FILTER_FIELDS.filter(f => !f.text).map(f => (
              <MultiSelect
                key={f.key}
                label={f.label}
                options={optionsFor[f.key] || []}
                selected={filters[f.key] || []}
                onChange={vals => setFilter(f.key, vals)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Groups ── */}
      {groups.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--label-tertiary)", fontSize: 14 }}>Nenhum produto encontrado.</div>
      ) : groups.map(([grupo, gItems]) => (
        <div key={grupo} style={{ marginBottom: 36 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "var(--bg-secondary)", borderLeft: "4px solid var(--system-blue)",
            borderRadius: "0 6px 6px 0", padding: "8px 14px", marginBottom: 16,
          }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: "var(--label-primary)", letterSpacing: "0.04em", textTransform: "uppercase" }}>{grupo}</span>
            <span style={{ fontSize: 12, color: "var(--label-tertiary)", fontWeight: 500 }}>· {gItems.length} peça{gItems.length !== 1 ? "s" : ""}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
            {gItems.map(item => {
              const img = imgOf(item);
              return (
                <div key={item.ref}
                  onClick={() => setZoom(item)}
                  style={{
                    background: "var(--bg-primary)", border: "1px solid var(--separator)",
                    borderRadius: 12, overflow: "hidden", position: "relative",
                    cursor: "zoom-in", transition: "box-shadow .15s, transform .15s",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 20px rgba(0,0,0,0.13)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.07)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
                >
                  <div style={{ position: "absolute", top: 9, right: 9, width: 10, height: 10, borderRadius: "50%", background: statusColor(item.status), border: "1.5px solid rgba(255,255,255,0.9)", zIndex: 2 }} title={item.status} />

                  <div style={{ width: "100%", aspectRatio: "4/3", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={item.ref} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    ) : (
                      <div style={{ textAlign: "center", color: "var(--label-tertiary)" }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" style={{ opacity: 0.35 }}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        <div style={{ fontSize: 10, marginTop: 4, opacity: 0.45 }}>{item.ref}</div>
                      </div>
                    )}
                  </div>

                  <div style={{ padding: "10px 12px 12px", borderTop: "1px solid var(--separator)" }}>
                    <div style={{ fontWeight: 700, fontSize: 11, color: "var(--label-primary)", marginBottom: 2 }}>{item.ref}</div>
                    <div style={{ fontSize: 12, color: "var(--label-primary)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.35, marginBottom: 6 }}>{item.desc}</div>
                    {(item.tecido || item.composicao) && (
                      <div style={{ fontSize: 10, color: "var(--label-secondary)", marginBottom: 1, lineHeight: 1.4 }}>{[item.tecido, item.composicao].filter(Boolean).join("  ·  ")}</div>
                    )}
                    {item.forn_tecido && <div style={{ fontSize: 10, color: "var(--label-tertiary)", marginBottom: 1 }}>{item.forn_tecido}</div>}
                    {(item.fornecedor || item.colecao) && (
                      <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid var(--separator)" }}>
                        {item.fornecedor && <div style={{ fontSize: 10, color: "var(--system-blue)", fontWeight: 600, marginBottom: 1 }}>{item.fornecedor}</div>}
                        {item.colecao && <div style={{ fontSize: 10, color: "var(--label-tertiary)" }}>Coleção: {item.colecao}</div>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
