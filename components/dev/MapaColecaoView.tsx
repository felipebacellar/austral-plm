"use client";
import { useEffect, useMemo, useState } from "react";
import { fetchMapaColecao } from "@/lib/db";
import { exportMapaColecaoPDF } from "@/lib/export-pdf-mapa";

const STATUS_COLORS: Record<string, string> = {
  DESENVOLVIMENTO: "#4464AF",
  MOSTRUÁRIO: "#EDCA35",
  "MOSTRUÁRIO LIBERADO": "#EDCA35",
  PRODUÇÃO: "#2DB564",
  "PRODUÇÃO LIBERADA": "#2DB564",
  CANCELADO: "#EA2F46",
};

function statusColor(status: string): string {
  if (!status) return "#ccc";
  const key = Object.keys(STATUS_COLORS).find(k => status.toUpperCase().includes(k));
  return key ? STATUS_COLORS[key] : "#aaa";
}

interface Props { rows: any[] }

export default function MapaColecaoView({ rows: _rows }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filterColecao, setFilterColecao] = useState("");
  const [filterFornecedor, setFilterFornecedor] = useState("");

  useEffect(() => {
    fetchMapaColecao().then(data => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const colecoes = useMemo(() => Array.from(new Set(items.map(i => i.colecao).filter(Boolean))).sort(), [items]);
  const fornecedores = useMemo(() => Array.from(new Set(items.map(i => i.fornecedor).filter(Boolean))).sort(), [items]);

  const filtered = useMemo(() => items.filter(i => {
    if (filterColecao && i.colecao !== filterColecao) return false;
    if (filterFornecedor && i.fornecedor !== filterFornecedor) return false;
    return true;
  }), [items, filterColecao, filterFornecedor]);

  const groups = useMemo(() => {
    const g: Record<string, any[]> = {};
    for (const it of filtered) {
      const key = it.grupo || "SEM GRUPO";
      if (!g[key]) g[key] = [];
      g[key].push(it);
    }
    return Object.entries(g).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportMapaColecaoPDF(filtered, { colecao: filterColecao, fornecedor: filterFornecedor }, "mapa-colecao");
    } finally {
      setExporting(false);
    }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
      <div className="plm-loading"><div className="plm-loading-spinner" /><span>Carregando mapa...</span></div>
    </div>
  );

  return (
    <div style={{ padding: "0 0 32px" }}>
      {/* ── Toolbar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 20, padding: "14px 0 14px", borderBottom: "1px solid var(--separator)" }}>
        <select
          className="apple-select"
          value={filterColecao}
          onChange={e => setFilterColecao(e.target.value)}
          style={{ minWidth: 160 }}
        >
          <option value="">Todas as coleções</option>
          {colecoes.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          className="apple-select"
          value={filterFornecedor}
          onChange={e => setFilterFornecedor(e.target.value)}
          style={{ minWidth: 180 }}
        >
          <option value="">Todos os fornecedores</option>
          {fornecedores.map(f => <option key={f} value={f}>{f}</option>)}
        </select>

        {(filterColecao || filterFornecedor) && (
          <button
            className="apple-btn-secondary"
            onClick={() => { setFilterColecao(""); setFilterFornecedor(""); }}
            style={{ fontSize: 12, padding: "5px 12px" }}
          >
            Limpar
          </button>
        )}

        <span style={{ fontSize: 12, color: "var(--label-tertiary)", marginLeft: 4 }}>
          {filtered.length} produto{filtered.length !== 1 ? "s" : ""} · {groups.length} grupo{groups.length !== 1 ? "s" : ""}
        </span>

        <div style={{ marginLeft: "auto" }}>
          <button
            className="apple-btn-primary"
            onClick={handleExport}
            disabled={exporting || filtered.length === 0}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, padding: "7px 16px" }}
          >
            {exporting ? (
              <>
                <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                Gerando...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Exportar PDF (Paisagem)
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Groups ── */}
      {groups.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--label-tertiary)", fontSize: 14 }}>
          Nenhum produto encontrado com os filtros selecionados.
        </div>
      ) : groups.map(([grupo, gItems]) => (
        <div key={grupo} style={{ marginBottom: 32 }}>
          {/* Group header */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "var(--bg-secondary)",
            borderLeft: "4px solid var(--system-blue)",
            borderRadius: "0 6px 6px 0",
            padding: "8px 14px",
            marginBottom: 14,
          }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: "var(--label-primary)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              {grupo}
            </span>
            <span style={{ fontSize: 12, color: "var(--label-tertiary)", fontWeight: 500 }}>
              · {gItems.length} peça{gItems.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Card grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
            gap: 12,
          }}>
            {gItems.map(item => (
              <div key={item.ref} style={{
                background: "var(--bg-primary)",
                border: "1px solid var(--separator)",
                borderRadius: 10,
                overflow: "hidden",
                position: "relative",
                transition: "box-shadow .15s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)"}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"}
              >
                {/* Status dot */}
                <div style={{
                  position: "absolute", top: 8, right: 8,
                  width: 9, height: 9, borderRadius: "50%",
                  background: statusColor(item.status),
                  border: "1.5px solid rgba(255,255,255,0.8)",
                  zIndex: 2,
                }} title={item.status} />

                {/* Image area */}
                <div style={{
                  width: "100%", aspectRatio: "4/3",
                  background: "var(--bg-secondary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden",
                }}>
                  {item.imagem_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imagem_url}
                      alt={item.ref}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  ) : (
                    <div style={{ textAlign: "center", color: "var(--label-tertiary)" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <div style={{ fontSize: 10, marginTop: 4, opacity: 0.5 }}>{item.ref}</div>
                    </div>
                  )}
                </div>

                {/* Info block */}
                <div style={{ padding: "10px 10px 10px", borderTop: "1px solid var(--separator)" }}>
                  <div style={{ fontWeight: 700, fontSize: 11, color: "var(--label-primary)", marginBottom: 2 }}>
                    {item.ref}
                  </div>
                  <div style={{
                    fontSize: 11.5, color: "var(--label-primary)",
                    overflow: "hidden", display: "-webkit-box",
                    WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                    lineHeight: 1.35, marginBottom: 6,
                  }}>
                    {item.desc}
                  </div>

                  {(item.tecido || item.composicao) && (
                    <div style={{ fontSize: 10, color: "var(--label-secondary)", marginBottom: 1, lineHeight: 1.35 }}>
                      {[item.tecido, item.composicao].filter(Boolean).join("  ")}
                    </div>
                  )}
                  {item.forn_tecido && (
                    <div style={{ fontSize: 10, color: "var(--label-tertiary)", marginBottom: 1 }}>
                      {item.forn_tecido}
                    </div>
                  )}

                  {(item.fornecedor || item.colecao) && (
                    <div style={{ marginTop: 5, paddingTop: 5, borderTop: "1px solid var(--separator)" }}>
                      {item.fornecedor && (
                        <div style={{ fontSize: 10, color: "var(--system-blue)", fontWeight: 600, marginBottom: 1 }}>
                          {item.fornecedor}
                        </div>
                      )}
                      {item.colecao && (
                        <div style={{ fontSize: 10, color: "var(--label-tertiary)" }}>
                          Coleção: {item.colecao}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
