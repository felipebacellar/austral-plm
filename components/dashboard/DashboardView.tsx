"use client";
import { useState, useMemo } from "react";

type Props = { rows: any[]; variantes: Record<string, string[]> };

const STATUS_CFG: Record<string, { color: string; label: string }> = {
  "DESENVOLVIMENTO":     { color: "#B87000", label: "Desenvolvimento" },
  "MOSTRUÁRIO LIBERADO": { color: "#248040", label: "Mostruário lib." },
  "PRODUÇÃO LIBERADA":   { color: "#1A5FB4", label: "Produção lib." },
  "CANCELADO":           { color: "#C42828", label: "Cancelado" },
};

/* Paleta Apple HIG — tons dessaturados para visualização de dados */
const PALETTE = ["#4A84C0","#7A65A8","#3D9A8C","#B87840","#4A96BC","#3D9E6A","#8B6070","#7A8E4A"];

const FILTERS = [
  { key: "colecao",    label: "Coleção" },
  { key: "grupo",      label: "Grupo" },
  { key: "subgrupo",   label: "Subgrupo" },
  { key: "status",     label: "Status" },
  { key: "linha",      label: "Linha" },
  { key: "estilista",  label: "Estilista" },
  { key: "fornecedor", label: "Fornecedor" },
  { key: "operacao",   label: "Operação" },
];

export default function DashboardView({ rows, variantes }: Props) {
  const [fl, setFl] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    let r = rows;
    Object.entries(fl).forEach(([k, v]) => { if (v) r = r.filter((x: any) => x[k] === v); });
    return r;
  }, [rows, fl]);

  const uv = (k: string) => [...new Set(rows.map((r: any) => r[k]).filter(Boolean))].sort() as string[];
  const sf = (k: string, v: string) => setFl(p => { const n = { ...p }; if (v) n[k] = v; else delete n[k]; return n; });
  const ac = Object.values(fl).filter(Boolean).length;

  const total    = filtered.length;
  const totalVar = filtered.reduce((s, r) => s + (variantes[r.ref]?.length || 0), 0);
  const sc = (s: string) => filtered.filter((r: any) => r.status === s).length;

  const byKey = (key: string, limit = 10) => {
    const c: Record<string, number> = {};
    filtered.forEach((r: any) => { if (r[key]) c[r[key]] = (c[r[key]] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, limit);
  };

  const byStatus     = useMemo(() => byKey("status"),          [filtered]);
  const byGrupo      = useMemo(() => byKey("grupo"),           [filtered]);
  const byColecao    = useMemo(() => byKey("colecao"),         [filtered]);
  const byEstilista  = useMemo(() => byKey("estilista"),       [filtered]);
  const byFornecedor = useMemo(() => byKey("fornecedor"),      [filtered]);
  const byTecido     = useMemo(() => byKey("tecido", 8),       [filtered]);
  const byLinha      = useMemo(() => byKey("linha"),           [filtered]);

  /* Donut: status com cores semânticas */
  const statusSegments = byStatus.map(([s, n]) => ({
    label: STATUS_CFG[s]?.label || s,
    value: n,
    color: STATUS_CFG[s]?.color || "#888",
  }));

  /* Donut: linha com paleta genérica */
  const linhaSegments = byLinha.map(([l, n], i) => ({
    label: l, value: n, color: PALETTE[i % PALETTE.length],
  }));

  return (
    <div className="space-y-5">

      {/* ── Filtros ── */}
      <div className="apple-card p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--label-secondary)]">Filtros</span>
          {ac > 0 && (
            <button onClick={() => setFl({})} className="text-[12px] text-[var(--system-blue)] font-medium flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Limpar filtros
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2.5">
          {FILTERS.map(f => (
            <div key={f.key}>
              <label className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[var(--label-tertiary)] mb-1 block">{f.label}</label>
              <select
                value={fl[f.key] || ""}
                onChange={e => sf(f.key, e.target.value)}
                className={`apple-select w-full text-[12px] py-1.5 ${fl[f.key] ? "!border-[var(--system-blue)] !bg-blue-50/60 text-[var(--system-blue)] font-semibold" : ""}`}
              >
                <option value="">Todos</option>
                {uv(f.key).map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
          ))}
        </div>
        {ac > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[var(--separator)]">
            {Object.entries(fl).map(([k, v]) => {
              if (!v) return null;
              const f = FILTERS.find(x => x.key === k);
              return (
                <span key={k} className="inline-flex items-center gap-1.5 bg-blue-50 text-[var(--system-blue)] rounded-lg px-2.5 py-1 text-[12px] font-medium">
                  <span className="text-blue-300 text-[11px]">{f?.label}:</span>{v}
                  <button onClick={() => sf(k, "")} className="text-blue-300 hover:text-[var(--system-blue)] leading-none">×</button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Cards de resumo ── */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        <StatCard label="Total SKUs"       value={total}                         color="var(--label-primary)" />
        <StatCard label="Var. de cor"      value={totalVar}                      color="#4A84C0" />
        <StatCard label="Desenvolvimento"  value={sc("DESENVOLVIMENTO")}         color="#B87000" />
        <StatCard label="Mostr. liberado"  value={sc("MOSTRUÁRIO LIBERADO")}     color="#248040" />
        <StatCard label="Produção lib."    value={sc("PRODUÇÃO LIBERADA")}       color="#1A5FB4" />
        <StatCard label="Cancelado"        value={sc("CANCELADO")}               color="#C42828" />
      </div>

      {/* ── Gráficos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Status — donut */}
        <ChartCard title="Por status">
          <DonutChart segments={statusSegments} total={total} />
        </ChartCard>

        {/* Grupo — barras */}
        <ChartCard title="Por grupo">
          <BarList items={byGrupo} max={byGrupo[0]?.[1] || 1} color={PALETTE[0]} />
        </ChartCard>

        {/* Coleção — barras */}
        <ChartCard title="Por coleção">
          <BarList items={byColecao} max={byColecao[0]?.[1] || 1} color={PALETTE[1]} />
        </ChartCard>

        {/* Estilista — barras */}
        <ChartCard title="Por estilista">
          <BarList items={byEstilista} max={byEstilista[0]?.[1] || 1} color={PALETTE[2]} />
        </ChartCard>

        {/* Fornecedor — barras */}
        <ChartCard title="Por fornecedor (confecção)">
          <BarList items={byFornecedor} max={byFornecedor[0]?.[1] || 1} color={PALETTE[3]} />
        </ChartCard>

        {/* Tecido — barras */}
        <ChartCard title="Tecidos mais usados">
          <BarList items={byTecido} max={byTecido[0]?.[1] || 1} color={PALETTE[4]} />
        </ChartCard>

        {/* Linha — donut */}
        <ChartCard title="Por linha">
          <DonutChart segments={linhaSegments} total={filtered.filter((r: any) => r.linha).length} />
        </ChartCard>

        {/* Variantes por grupo — barras */}
        <ChartCard title="Variantes de cor por grupo">
          {(() => {
            const items = byGrupo.map(([grupo]) => {
              const count = filtered.filter((r: any) => r.grupo === grupo)
                .reduce((s, r) => s + (variantes[r.ref]?.length || 0), 0);
              return [grupo, count] as [string, number];
            }).filter(([, c]) => c > 0).sort((a, b) => b[1] - a[1]);
            return <BarList items={items} max={items[0]?.[1] || 1} color={PALETTE[5]} />;
          })()}
        </ChartCard>

      </div>
    </div>
  );
}

/* ── Sub-components ── */

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="apple-card px-4 py-4">
      <div className="text-[30px] font-bold tabnum tracking-[-0.04em] leading-none mb-1" style={{ color }}>{value}</div>
      <div className="text-[11px] text-[var(--label-secondary)] leading-tight">{label}</div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="apple-card p-5">
      <div className="text-[13px] font-semibold text-[var(--label-primary)] mb-4 tracking-[-0.01em]">{title}</div>
      {children}
    </div>
  );
}

function DonutChart({ segments, total }: { segments: { label: string; value: number; color: string }[]; total: number }) {
  if (!segments.length || total === 0) return <Empty />;

  let deg = 0;
  const gradient = segments.map(s => {
    const from = deg;
    deg += (s.value / total) * 360;
    return `${s.color} ${from.toFixed(2)}deg ${deg.toFixed(2)}deg`;
  }).join(", ");

  return (
    <div className="flex items-center gap-6">
      {/* Donut */}
      <div className="relative shrink-0" style={{ width: 108, height: 108 }}>
        <div className="w-full h-full rounded-full" style={{ background: `conic-gradient(${gradient})` }} />
        {/* Hole */}
        <div className="absolute rounded-full bg-[var(--bg-primary)]"
          style={{ inset: 28 }} />
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[16px] font-bold tabnum tracking-[-0.03em] text-[var(--label-primary)]">{total}</span>
        </div>
      </div>
      {/* Legend */}
      <div className="flex-1 space-y-2.5">
        {segments.map(s => (
          <div key={s.label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-[12px] text-[var(--label-primary)] flex-1 truncate">{s.label}</span>
            <span className="text-[12px] font-bold tabnum">{s.value}</span>
            <span className="text-[11px] text-[var(--label-quaternary)] w-8 text-right tabnum">
              {((s.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarList({ items, max, color }: { items: [string, number][]; max: number; color: string }) {
  if (!items.length) return <Empty />;
  return (
    <div className="space-y-2.5">
      {items.map(([label, count]) => (
        <div key={label} className="flex items-center gap-3">
          <span className="text-[12px] text-[var(--label-primary)] font-medium w-32 shrink-0 truncate" title={label}>{label}</span>
          <div className="flex-1 bg-[var(--bg-secondary)] rounded-full h-1.5 overflow-hidden">
            <div className="h-1.5 rounded-full transition-all duration-700"
              style={{ width: `${(count / max) * 100}%`, background: color }} />
          </div>
          <span className="text-[13px] tabnum font-bold w-6 text-right">{count}</span>
        </div>
      ))}
    </div>
  );
}

function Empty() {
  return <div className="py-6 text-center text-[13px] text-[var(--label-tertiary)]">Sem dados</div>;
}
