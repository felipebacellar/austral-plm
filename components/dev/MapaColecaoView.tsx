"use client";
import { useEffect, useMemo, useState } from "react";
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

interface Props { rows: any[] }

export default function MapaColecaoView({ rows: _rows }: Props) {
  const [items, setItems]           = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [exporting, setExporting]   = useState(false);
  const [filterColecao, setFilterColecao]       = useState("");
  const [filterFornecedor, setFilterFornecedor] = useState("");
  const [filterGrupo, setFilterGrupo]           = useState("");
  const [filterLinha, setFilterLinha]           = useState("");
  const [filterStatuses, setFilterStatuses]     = useState<string[]>([]);
  const [statusDropOpen, setStatusDropOpen]     = useState(false);
  const [imageMode, setImageMode]   = useState<"desenho" | "foto">("desenho");
  const [zoom, setZoom]             = useState<any | null>(null); // item being zoomed

  useEffect(() => {
    fetchMapaColecao().then(data => { setItems(data); setLoading(false); });
  }, []);

  // Close zoom on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setZoom(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const colecoes    = useMemo(() => Array.from(new Set(items.map(i => i.colecao).filter(Boolean))).sort() as string[], [items]);
  const fornecedores = useMemo(() => Array.from(new Set(items.map(i => i.fornecedor).filter(Boolean))).sort() as string[], [items]);
  const grupos      = useMemo(() => Array.from(new Set(items.map(i => i.grupo).filter(Boolean))).sort() as string[], [items]);
  const linhas      = useMemo(() => Array.from(new Set(items.map(i => i.linha).filter(Boolean))).sort() as string[], [items]);
  const statuses    = useMemo(() => ["(SEM STATUS)", ...Array.from(new Set(items.map(i => i.status).filter(Boolean))).sort() as string[]], [items]);

  const filtered = useMemo(() => items.filter(i => {
    if (filterColecao    && i.colecao    !== filterColecao)    return false;
    if (filterFornecedor && i.fornecedor !== filterFornecedor) return false;
    if (filterGrupo      && (i.grupo || "SEM GRUPO") !== filterGrupo) return false;
    if (filterLinha      && i.linha !== filterLinha) return false;
    if (filterStatuses.length > 0) {
      const s = i.status || "(SEM STATUS)";
      if (!filterStatuses.includes(s)) return false;
    }
    return true;
  }), [items, filterColecao, filterFornecedor, filterGrupo, filterLinha, filterStatuses]);

  const groups = useMemo(() => {
    const g: Record<string, any[]> = {};
    for (const it of filtered) { const k = it.grupo || "SEM GRUPO"; if (!g[k]) g[k] = []; g[k].push(it); }
    return Object.entries(g).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const imgOf = (item: any) => imageMode === "foto" ? (item.imagem_modelo || item.imagem_url) : item.imagem_url;

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportMapaColecaoPDF(filtered, { colecao: filterColecao, fornecedor: filterFornecedor, grupo: filterGrupo, linha: filterLinha, status: filterStatuses.join(", ") }, imageMode, "mapa-colecao");
    } finally { setExporting(false); }
  };

  if (loading) return (
    <div className="plm-loading"><div className="plm-loading-spinner" /><span>Carregando mapa...</span></div>
  );

  return (
    <div style={{ padding: "0 0 40px" }}>

      {/* ── Lightbox zoom ── */}
      {zoom && (
        <div
          onClick={() => setZoom(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "var(--bg-primary)", borderRadius: 16,
              boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
              maxWidth: 700, width: "90vw", overflow: "hidden",
              display: "flex", flexDirection: "column",
            }}
          >
            {/* image */}
            <div style={{ background: "#fff", padding: 16, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 360 }}>
              {imgOf(zoom) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imgOf(zoom)} alt={zoom.ref} style={{ maxWidth: "100%", maxHeight: "55vh", objectFit: "contain" }} />
              ) : (
                <div style={{ color: "var(--label-tertiary)", textAlign: "center", fontSize: 13 }}>Sem imagem</div>
              )}
            </div>
            {/* info */}
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
                {zoom.tecido && <div><span style={{ color: "var(--label-tertiary)" }}>Tecido: </span><span style={{ color: "var(--label-secondary)", fontWeight: 500 }}>{zoom.tecido}</span></div>}
                {zoom.composicao && <div><span style={{ color: "var(--label-tertiary)" }}>Comp.: </span><span style={{ color: "var(--label-secondary)" }}>{zoom.composicao}</span></div>}
                {zoom.forn_tecido && <div><span style={{ color: "var(--label-tertiary)" }}>Forn. Tecido: </span><span style={{ color: "var(--label-secondary)" }}>{zoom.forn_tecido}</span></div>}
                {zoom.fornecedor && <div><span style={{ color: "var(--label-tertiary)" }}>Fornecedor: </span><span style={{ color: "var(--system-blue)", fontWeight: 600 }}>{zoom.fornecedor}</span></div>}
                {zoom.colecao && <div><span style={{ color: "var(--label-tertiary)" }}>Coleção: </span><span style={{ color: "var(--label-secondary)" }}>{zoom.colecao}</span></div>}
                {zoom.grupo && <div><span style={{ color: "var(--label-tertiary)" }}>Grupo: </span><span style={{ color: "var(--label-secondary)" }}>{zoom.grupo}</span></div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 20, padding: "14px 0", borderBottom: "1px solid var(--separator)" }}>

        {/* Image mode toggle */}
        <div style={{ display: "flex", background: "var(--bg-secondary)", borderRadius: 8, border: "1px solid var(--separator)", padding: 2, gap: 2 }}>
          {(["desenho", "foto"] as const).map(mode => (
            <button key={mode} onClick={() => setImageMode(mode)} style={{
              fontSize: 12, fontWeight: 600, padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer", transition: "all .15s",
              background: imageMode === mode ? "var(--bg-primary)" : "transparent",
              color: imageMode === mode ? "var(--system-blue)" : "var(--label-tertiary)",
              boxShadow: imageMode === mode ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
            }}>
              {mode === "desenho" ? "✏️ Desenho" : "📷 Foto"}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 24, background: "var(--separator)" }} />

        <select className="apple-select" value={filterColecao} onChange={e => setFilterColecao(e.target.value)} style={{ minWidth: 160 }}>
          <option value="">Todas as coleções</option>
          {colecoes.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select className="apple-select" value={filterFornecedor} onChange={e => setFilterFornecedor(e.target.value)} style={{ minWidth: 180 }}>
          <option value="">Todos os fornecedores</option>
          {fornecedores.map(f => <option key={f} value={f}>{f}</option>)}
        </select>

        <select className="apple-select" value={filterGrupo} onChange={e => setFilterGrupo(e.target.value)} style={{ minWidth: 160 }}>
          <option value="">Todos os grupos</option>
          {grupos.map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        <select className="apple-select" value={filterLinha} onChange={e => setFilterLinha(e.target.value)} style={{ minWidth: 140 }}>
          <option value="">Todas as linhas</option>
          {linhas.map(l => <option key={l} value={l}>{l}</option>)}
        </select>

        {/* Status multi-select dropdown */}
        <div style={{ position: "relative" }}>
          <button
            className="apple-select"
            onClick={() => setStatusDropOpen(o => !o)}
            style={{
              minWidth: 180, textAlign: "left", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6,
              background: filterStatuses.length > 0 ? "var(--system-blue-tint, #e8f0fe)" : undefined,
              borderColor: filterStatuses.length > 0 ? "var(--system-blue)" : undefined,
              color: filterStatuses.length > 0 ? "var(--system-blue)" : undefined,
              fontWeight: filterStatuses.length > 0 ? 600 : undefined,
            }}
          >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12 }}>
              {filterStatuses.length === 0 ? "Todos os status" : `Status (${filterStatuses.length})`}
            </span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, transform: statusDropOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }}><polyline points="6 9 12 15 18 9"/></svg>
          </button>

          {statusDropOpen && (
            <div
              style={{
                position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 1000,
                background: "var(--bg-primary)", border: "1px solid var(--separator)",
                borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
                minWidth: 240, padding: "6px 0", maxHeight: 320, overflowY: "auto",
              }}
            >
              {/* Select all / clear */}
              <div style={{ display: "flex", gap: 6, padding: "4px 10px 6px", borderBottom: "1px solid var(--separator)" }}>
                <button onClick={() => setFilterStatuses(statuses)} style={{ fontSize: 11, color: "var(--system-blue)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Selecionar todos</button>
                <span style={{ color: "var(--separator)" }}>·</span>
                <button onClick={() => setFilterStatuses([])} style={{ fontSize: 11, color: "var(--label-tertiary)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Limpar</button>
              </div>
              {statuses.map(s => {
                const checked = filterStatuses.includes(s);
                const color = s === "(SEM STATUS)" ? "#aaa" : statusColor(s);
                return (
                  <label key={s} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", cursor: "pointer", background: checked ? "var(--bg-secondary)" : "transparent" }}
                    onMouseEnter={e => { if (!checked) (e.currentTarget as HTMLElement).style.background = "var(--bg-secondary)"; }}
                    onMouseLeave={e => { if (!checked) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <input type="checkbox" checked={checked} onChange={() => {
                      setFilterStatuses(prev => checked ? prev.filter(x => x !== s) : [...prev, s]);
                    }} style={{ accentColor: "var(--system-blue)", width: 13, height: 13 }} />
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "var(--label-primary)" }}>{s}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Close dropdown on outside click */}
        {statusDropOpen && <div onClick={() => setStatusDropOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 999 }} />}

        {(filterColecao || filterFornecedor || filterGrupo || filterLinha || filterStatuses.length > 0) && (
          <button className="apple-btn-secondary" onClick={() => { setFilterColecao(""); setFilterFornecedor(""); setFilterGrupo(""); setFilterLinha(""); setFilterStatuses([]); }} style={{ fontSize: 12, padding: "5px 12px" }}>
            Limpar
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
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Exportar PDF (Paisagem)</>
            )}
          </button>
        </div>
      </div>

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
                  {/* Status dot */}
                  <div style={{ position: "absolute", top: 9, right: 9, width: 10, height: 10, borderRadius: "50%", background: statusColor(item.status), border: "1.5px solid rgba(255,255,255,0.9)", zIndex: 2 }} title={item.status} />

                  {/* Zoom hint */}
                  <div style={{ position: "absolute", top: 9, left: 9, zIndex: 2, opacity: 0, transition: "opacity .15s" }} className="zoom-hint">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                  </div>

                  {/* Image */}
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

                  {/* Info */}
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
