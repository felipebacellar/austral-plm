"use client";
import { useState, useMemo } from "react";

type Props = { rows: any[]; variantes: Record<string, string[]> };

/* ── Paleta monocromática: marinho → azul → cinza ── */
const NAVY    = "#1B2A4A";
const BLUE_D  = "#2B4570";
const BLUE_M  = "#3B6098";
const BLUE_L  = "#5A82B4";
const STEEL   = "#7A9ABF";
const SLATE   = "#94A8BE";
const SILVER  = "#B0BEC5";
const GRAY    = "#CFD8DC";

/* Gradiente de 8 tons para donuts, barras, etc. */
const SCALE = [NAVY, BLUE_D, BLUE_M, BLUE_L, STEEL, SLATE, SILVER, GRAY];

/* Status usa 4 tons da escala */
const STATUS_CFG: Record<string, { color: string; label: string }> = {
  "DESENVOLVIMENTO":     { color: BLUE_L, label: "Desenvolvimento" },
  "MOSTRUÁRIO LIBERADO": { color: BLUE_D, label: "Mostruário lib." },
  "PRODUÇÃO LIBERADA":   { color: NAVY,   label: "Produção lib." },
  "CANCELADO":           { color: SLATE,  label: "Cancelado" },
};

/* Stat cards — gradiente do marinho ao cinza */
const STAT_BG = [NAVY, BLUE_D, BLUE_M, BLUE_L, STEEL, SLATE];

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
  const byOperacao   = useMemo(() => byKey("operacao"),        [filtered]);

  const toSegments = (items: [string, number][]) =>
    items.map(([l, n], i) => ({ label: l, value: n, color: SCALE[i % SCALE.length] }));

  const statusSegments = byStatus.map(([s, n]) => ({
    label: STATUS_CFG[s]?.label || s,
    value: n,
    color: STATUS_CFG[s]?.color || SILVER,
  }));

  const operacaoSegments = toSegments(byOperacao);
  const operacaoTotal = byOperacao.reduce((s, [, n]) => s + n, 0);

  const stats = [
    { label: "Total SKUs",      value: total },
    { label: "Var. de cor",     value: totalVar },
    { label: "Desenvolvimento", value: sc("DESENVOLVIMENTO") },
    { label: "Mostr. liberado", value: sc("MOSTRUÁRIO LIBERADO") },
    { label: "Produção lib.",   value: sc("PRODUÇÃO LIBERADA") },
    { label: "Cancelado",       value: sc("CANCELADO") },
  ];

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[var(--label-primary)]">Visão Geral</h2>
      </div>

      {/* ── Filtros ── */}
      <div className="dash-card p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--label-secondary)]">Filtros</span>
          {ac > 0 && (
            <button onClick={() => setFl({})} className="text-[12px] font-medium flex items-center gap-1 hover:opacity-70 transition-opacity" style={{ color: BLUE_M }}>
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
                className={`apple-select w-full text-[12px] py-1.5 ${fl[f.key] ? "font-semibold" : ""}`}
                style={fl[f.key] ? { borderColor: BLUE_M, background: "rgba(59,96,152,0.06)", color: BLUE_D } : {}}
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
                <span key={k} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-medium"
                  style={{ background: "rgba(43,69,112,0.08)", color: BLUE_D }}>
                  <span className="text-[11px]" style={{ color: STEEL }}>{f?.label}:</span>{v}
                  <button onClick={() => sf(k, "")} className="hover:opacity-70 leading-none" style={{ color: STEEL }}>×</button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Cards de resumo ── */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {stats.map((s, i) => (
          <StatCard key={s.label} label={s.label} value={s.value} bg={STAT_BG[i]} />
        ))}
      </div>

      {/* ── Gráficos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <ChartCard title="Por status">
          <DonutChart segments={statusSegments} total={total} />
        </ChartCard>

        <ChartCard title="Tipo de operação">
          <DonutChart segments={operacaoSegments} total={operacaoTotal} />
        </ChartCard>

        <ChartCard title="Por grupo">
          <BarChart items={byGrupo} />
        </ChartCard>

        <ChartCard title="Por coleção">
          <BarChart items={byColecao} />
        </ChartCard>

        <ChartCard title="Por estilista">
          <BarChart items={byEstilista} />
        </ChartCard>

        <ChartCard title="Por fornecedor (confecção)">
          <BarChart items={byFornecedor} />
        </ChartCard>

        <ChartCard title="Tecidos mais usados">
          <BarChart items={byTecido} />
        </ChartCard>

        <ChartCard title="Por linha">
          <DonutChart segments={toSegments(byLinha)} total={filtered.filter((r: any) => r.linha).length} />
        </ChartCard>

        <ChartCard title="Variantes de cor por grupo">
          {(() => {
            const items = byGrupo.map(([grupo]) => {
              const count = filtered.filter((r: any) => r.grupo === grupo)
                .reduce((s, r) => s + (variantes[r.ref]?.length || 0), 0);
              return [grupo, count] as [string, number];
            }).filter(([, c]) => c > 0).sort((a, b) => b[1] - a[1]);
            return <BarChart items={items} />;
          })()}
        </ChartCard>

      </div>
    </div>
  );
}

/* ── Sub-components ── */

function StatCard({ label, value, bg }: { label: string; value: number; bg: string }) {
  return (
    <div
      className="rounded-2xl px-4 py-4 transition-all duration-200 hover:scale-[1.02] hover:brightness-110"
      style={{ background: bg }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] font-medium leading-tight" style={{ color: "rgba(255,255,255,0.7)" }}>{label}</div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      </div>
      <div className="text-[28px] font-bold tabnum tracking-[-0.04em] leading-none text-white">{value.toLocaleString("pt-BR")}</div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="dash-card p-5">
      <div className="text-[14px] font-semibold mb-5 tracking-[-0.01em]" style={{ color: NAVY }}>{title}</div>
      {children}
    </div>
  );
}

function DonutChart({ segments, total }: { segments: { label: string; value: number; color: string }[]; total: number }) {
  if (!segments.length || total === 0) return <Empty />;

  const size = 140;
  const stroke = 28;
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;

  return (
    <div className="flex items-center gap-8">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          {segments.map((s, i) => {
            const pct = s.value / total;
            const dash = pct * circumference;
            const gap = circumference - dash;
            const currentOffset = offset;
            offset += dash;
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={s.color}
                strokeWidth={stroke}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-currentOffset}
                strokeLinecap="butt"
                className="transition-all duration-700"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[22px] font-bold tabnum tracking-[-0.03em]" style={{ color: NAVY }}>{total}</span>
          <span className="text-[10px] text-[var(--label-tertiary)]">total</span>
        </div>
      </div>
      <div className="flex-1 space-y-3">
        {segments.map(s => (
          <div key={s.label} className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded shrink-0" style={{ background: s.color }} />
            <span className="text-[13px] text-[var(--label-primary)] flex-1 truncate">{s.label}</span>
            <span className="text-[13px] font-bold tabnum" style={{ color: NAVY }}>{s.value}</span>
            <span className="text-[11px] text-[var(--label-tertiary)] w-10 text-right tabnum">
              {((s.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ items }: { items: [string, number][] }) {
  if (!items.length) return <Empty />;
  const max = items[0][1] || 1;

  return (
    <div className="space-y-3">
      {items.map(([label, count], i) => {
        const color = SCALE[i % SCALE.length];
        const pct = (count / max) * 100;
        return (
          <div key={label} className="group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] text-[var(--label-secondary)] font-medium truncate max-w-[200px]" title={label}>{label}</span>
              <span className="text-[13px] tabnum font-bold" style={{ color: NAVY }}>{count}</span>
            </div>
            <div className="w-full rounded-lg h-[20px] overflow-hidden" style={{ background: "rgba(176,190,197,0.2)" }}>
              <div
                className="h-full rounded-lg transition-all duration-700 ease-out group-hover:brightness-110"
                style={{ width: `${pct}%`, background: color, minWidth: count > 0 ? 4 : 0 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Empty() {
  return <div className="py-8 text-center text-[13px] text-[var(--label-tertiary)]">Sem dados</div>;
}
