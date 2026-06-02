"use client";
import { useEffect, useState, useMemo } from "react";
import { fetchControleFluxo } from "@/lib/db";

type Props = { rows: any[]; variantes: Record<string, string[]> };

/* ── Paleta ── */
const B900 = "#00254D"; const B800 = "#003A75"; const B700 = "#00509E";
const B600 = "#0066CC"; const B500 = "#007AFF"; const B400 = "#3395FF";
const B300 = "#66B0FF"; const B200 = "#99CAFF"; const B100 = "#CCE5FF"; const B50 = "#E8F2FF";
const SCALE = [B500, B700, B400, B800, B300, B600, B200, B900];

const STATUS_CFG: Record<string, { color: string }> = {
  "DESENVOLVIMENTO":      { color: B400 },
  "MOSTRUÁRIO LIBERADO":  { color: B600 },
  "PRODUÇÃO LIBERADA":    { color: B800 },
  "REPILOTANDO PRODUÇÃO": { color: B700 },
  "CANCELADO":            { color: B200 },
};
const STAT_BG = [B900, B700, B600, B500, B400, B300, B200];

const FLUXO_STAGES = [
  { label: "Pilotagem",      field: "status_mostruario",   options: ["AGUARDANDO PILOTO","PILOTO RECEBIDA - AGUARDANDO PROVA","MOSTRUÁRIO LIBERADO","INCLUÍDO DIRETO P/ MOSTRUÁRIO"] },
  { label: "Produção",       field: "status_producao",     options: ["AGUARDANDO MOSTRUÁRIO","MOSTRUÁRIO RECEBIDO - AGUARDANDO PROVA DE PRODUÇÃO","PRODUÇÃO REPROVADA - AGUARDANDO REPILOTAGEM","PRODUÇÃO LIBERADA"] },
  { label: "Pré-Produção",   field: "status_pre_producao", options: ["PRÉ-PRODUÇÃO LIBERADA","PRÉ PRODUÇÃO REPROVADA"] },
];

const FLUXO_COLORS: Record<string, string> = {
  "AGUARDANDO PILOTO": B400, "PILOTO RECEBIDA - AGUARDANDO PROVA": B600,
  "MOSTRUÁRIO LIBERADO": B500, "INCLUÍDO DIRETO P/ MOSTRUÁRIO": B300,
  "AGUARDANDO MOSTRUÁRIO": B400, "MOSTRUÁRIO RECEBIDO - AGUARDANDO PROVA DE PRODUÇÃO": B600,
  "PRODUÇÃO REPROVADA - AGUARDANDO REPILOTAGEM": B800, "PRODUÇÃO LIBERADA": B700,
  "PRÉ-PRODUÇÃO LIBERADA": B500, "PRÉ PRODUÇÃO REPROVADA": B800,
};

const GROUPS = [
  { id: "estilo",  label: "Estilo",  tabs: [
    { id: "desenvolvimento", label: "Desenvolvimento" },
    { id: "fluxo",           label: "Controle de Fluxo" },
    { id: "variantes",       label: "Variantes" },
  ]},
  { id: "compras", label: "Compras", tabs: [
    { id: "desenvolvimento", label: "Desenvolvimento" },
    { id: "variantes",       label: "Variantes" },
  ]},
];

const DEV_FILTERS = [
  { key: "colecao", label: "Coleção" }, { key: "grupo", label: "Grupo" },
  { key: "subgrupo", label: "Subgrupo" }, { key: "status", label: "Status" },
  { key: "linha", label: "Linha" }, { key: "estilista", label: "Estilista" },
  { key: "fornecedor", label: "Fornecedor" }, { key: "operacao", label: "Operação" },
];

export default function DashboardView({ rows, variantes }: Props) {
  const [group,  setGroup]  = useState("estilo");
  const [subTab, setSubTab] = useState("desenvolvimento");
  const [fluxo,  setFluxo]  = useState<any[]>([]);
  const [fl, setFl] = useState<Record<string, string>>({});

  useEffect(() => { fetchControleFluxo().then(setFluxo); }, []);

  // switch group → reset subtab
  const handleGroup = (g: string) => {
    setGroup(g);
    const grp = GROUPS.find(x => x.id === g);
    setSubTab(grp?.tabs[0].id || "desenvolvimento");
  };

  const currentGroup = GROUPS.find(g => g.id === group)!;

  /* filtered rows for dev sections */
  const filtered = useMemo(() => {
    let r = rows;
    Object.entries(fl).forEach(([k, v]) => { if (v) r = r.filter((x: any) => x[k] === v); });
    return r;
  }, [rows, fl]);

  const uv = (k: string) => [...new Set(rows.map((r: any) => r[k]).filter(Boolean))].sort() as string[];
  const sf = (k: string, v: string) => setFl(p => { const n = { ...p }; if (v) n[k] = v; else delete n[k]; return n; });
  const ac = Object.values(fl).filter(Boolean).length;

  /* compras rows = rows that have purchase intent (fornecedor set) */
  const comprasRows = useMemo(() => rows.filter((r: any) => r.fornecedor), [rows]);
  const comprasFiltered = useMemo(() => {
    let r = comprasRows;
    Object.entries(fl).forEach(([k, v]) => { if (v) r = r.filter((x: any) => x[k] === v); });
    return r;
  }, [comprasRows, fl]);

  const byKey = (src: any[], key: string, limit = 10) => {
    const c: Record<string, number> = {};
    src.forEach((r: any) => { if (r[key]) c[r[key]] = (c[r[key]] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, limit);
  };

  /* ── Estilo > Desenvolvimento ── */
  const total    = filtered.length;
  const totalVar = filtered.reduce((s, r) => s + (variantes[r.ref]?.length || 0), 0);
  const sc = (s: string) => filtered.filter((r: any) => r.status === s).length;

  const byStatus     = useMemo(() => byKey(filtered, "status"),      [filtered]);
  const byGrupo      = useMemo(() => byKey(filtered, "grupo"),       [filtered]);
  const byColecao    = useMemo(() => byKey(filtered, "colecao"),     [filtered]);
  const byEstilista  = useMemo(() => byKey(filtered, "estilista"),   [filtered]);
  const byFornecedor = useMemo(() => byKey(filtered, "fornecedor"),  [filtered]);
  const byTecido     = useMemo(() => byKey(filtered, "tecido", 8),   [filtered]);
  const byLinha      = useMemo(() => byKey(filtered, "linha"),       [filtered]);
  const byOperacao   = useMemo(() => byKey(filtered, "operacao"),    [filtered]);

  const devStats = [
    { label: "Total SKUs",      value: total },
    { label: "Var. de cor",     value: totalVar },
    { label: "Desenvolvimento", value: sc("DESENVOLVIMENTO") },
    { label: "Mostr. liberado", value: sc("MOSTRUÁRIO LIBERADO") },
    { label: "Produção lib.",   value: sc("PRODUÇÃO LIBERADA") },
    { label: "Repilotando",     value: sc("REPILOTANDO PRODUÇÃO") },
    { label: "Cancelado",       value: sc("CANCELADO") },
  ];

  const statusSegments = byStatus.map(([s, n]) => ({
    label: s, value: n, color: STATUS_CFG[s]?.color || B200,
  }));

  /* ── Estilo > Variantes ── */
  const varByGrupo = useMemo(() => byGrupo.map(([g]) => {
    const c = filtered.filter((r: any) => r.grupo === g)
      .reduce((s, r) => s + (variantes[r.ref]?.length || 0), 0);
    return [g, c] as [string, number];
  }).filter(([, c]) => c > 0).sort((a, b) => b[1] - a[1]), [byGrupo, filtered, variantes]);

  const varByColecao = useMemo(() => byColecao.map(([col]) => {
    const c = filtered.filter((r: any) => r.colecao === col)
      .reduce((s, r) => s + (variantes[r.ref]?.length || 0), 0);
    return [col, c] as [string, number];
  }).filter(([, c]) => c > 0).sort((a, b) => b[1] - a[1]), [byColecao, filtered, variantes]);

  const topVarSku = useMemo(() => {
    return filtered.map(r => [r.ref, variantes[r.ref]?.length || 0] as [string, number])
      .filter(([, c]) => c > 0).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [filtered, variantes]);

  const totalColors = useMemo(() => {
    const allColors: string[] = [];
    filtered.forEach(r => (variantes[r.ref] || []).forEach(c => allColors.push(c)));
    const c: Record<string, number> = {};
    allColors.forEach(x => { c[x] = (c[x] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [filtered, variantes]);

  /* ── Estilo > Fluxo ── */
  const fluxoJoined = useMemo(() =>
    filtered.map(r => ({ ...r, ...(fluxo.find(f => f.produto_ref === r.ref) || {}) })),
  [filtered, fluxo]);

  /* ── Compras > Desenvolvimento ── */
  const cTotal    = comprasFiltered.length;
  const cTotalVar = comprasFiltered.reduce((s, r) => s + (variantes[r.ref]?.length || 0), 0);
  const byFornDev  = useMemo(() => byKey(comprasFiltered, "fornecedor"),  [comprasFiltered]);
  const byOpDev    = useMemo(() => byKey(comprasFiltered, "operacao"),    [comprasFiltered]);
  const byGrupoDev = useMemo(() => byKey(comprasFiltered, "grupo"),       [comprasFiltered]);
  const byColDev   = useMemo(() => byKey(comprasFiltered, "colecao"),     [comprasFiltered]);

  /* ── Compras > Variantes ── */
  const varByForn = useMemo(() => byFornDev.map(([f]) => {
    const c = comprasFiltered.filter((r: any) => r.fornecedor === f)
      .reduce((s, r) => s + (variantes[r.ref]?.length || 0), 0);
    return [f, c] as [string, number];
  }).filter(([, c]) => c > 0).sort((a, b) => b[1] - a[1]), [byFornDev, comprasFiltered, variantes]);

  const varByGrupoCmp = useMemo(() => byGrupoDev.map(([g]) => {
    const c = comprasFiltered.filter((r: any) => r.grupo === g)
      .reduce((s, r) => s + (variantes[r.ref]?.length || 0), 0);
    return [g, c] as [string, number];
  }).filter(([, c]) => c > 0).sort((a, b) => b[1] - a[1]), [byGrupoDev, comprasFiltered, variantes]);

  /* ── Render helpers ── */
  const toSeg = (items: [string, number][]) =>
    items.map(([l, n], i) => ({ label: l, value: n, color: SCALE[i % SCALE.length] }));

  const filterBar = (
    <div className="dash-card p-4 mb-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--label-secondary)]">Filtros</span>
        {ac > 0 && (
          <button onClick={() => setFl({})} className="text-[12px] text-[var(--system-blue)] font-medium flex items-center gap-1 hover:opacity-70 transition-opacity">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Limpar
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2.5">
        {DEV_FILTERS.map(f => (
          <div key={f.key}>
            <label className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[var(--label-tertiary)] mb-1 block">{f.label}</label>
            <select value={fl[f.key] || ""} onChange={e => sf(f.key, e.target.value)}
              className={`apple-select w-full text-[12px] py-1.5 ${fl[f.key] ? "!border-[var(--system-blue)] font-semibold" : ""}`}
              style={fl[f.key] ? { background: B50, color: B700 } : {}}>
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
            const f = DEV_FILTERS.find(x => x.key === k);
            return (
              <span key={k} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-medium" style={{ background: B100, color: B700 }}>
                <span className="text-[11px]" style={{ color: B400 }}>{f?.label}:</span>{v}
                <button onClick={() => sf(k, "")} className="hover:opacity-70 leading-none" style={{ color: B400 }}>×</button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-5">

      {/* ── Group + SubTab selector ── */}
      <div className="flex flex-col gap-3">
        {/* Group pills */}
        <div className="flex items-center gap-2">
          {GROUPS.map(g => (
            <button key={g.id} onClick={() => handleGroup(g.id)}
              className="px-5 py-2 rounded-xl text-[13px] font-semibold transition-all duration-150"
              style={{
                background: group === g.id ? B600 : "var(--bg-secondary)",
                color: group === g.id ? "#fff" : "var(--label-secondary)",
                border: `1px solid ${group === g.id ? B600 : "var(--separator)"}`,
              }}>
              {g.label}
            </button>
          ))}
        </div>
        {/* Sub-tabs */}
        <div className="flex items-center gap-1" style={{ borderBottom: `2px solid var(--separator)`, paddingBottom: 0 }}>
          {currentGroup.tabs.map(t => (
            <button key={t.id} onClick={() => setSubTab(t.id)}
              className="px-4 py-2 text-[13px] font-medium transition-all duration-150 relative"
              style={{
                color: subTab === t.id ? B600 : "var(--label-tertiary)",
                fontWeight: subTab === t.id ? 600 : 400,
                borderBottom: subTab === t.id ? `2px solid ${B600}` : "2px solid transparent",
                marginBottom: -2,
                background: "none", border: "none", borderBottom: subTab === t.id ? `2px solid ${B600}` : "2px solid transparent",
                cursor: "pointer",
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══ ESTILO > DESENVOLVIMENTO ══ */}
      {group === "estilo" && subTab === "desenvolvimento" && (<>
        {filterBar}
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-3">
          {devStats.map((s, i) => <StatCard key={s.label} label={s.label} value={s.value} bg={STAT_BG[i]} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartCard title="Por status"><DonutChart segments={statusSegments} total={total} /></ChartCard>
          <ChartCard title="Tipo de operação"><DonutChart segments={toSeg(byOperacao)} total={byOperacao.reduce((s,[,n])=>s+n,0)} /></ChartCard>
          <ChartCard title="Por grupo"><BarChart items={byGrupo} /></ChartCard>
          <ChartCard title="Por coleção"><BarChart items={byColecao} /></ChartCard>
          <ChartCard title="Por estilista"><BarChart items={byEstilista} /></ChartCard>
          <ChartCard title="Por fornecedor"><BarChart items={byFornecedor} /></ChartCard>
          <ChartCard title="Tecidos mais usados"><BarChart items={byTecido} /></ChartCard>
          <ChartCard title="Por linha"><DonutChart segments={toSeg(byLinha)} total={filtered.filter((r:any)=>r.linha).length} /></ChartCard>
        </div>
      </>)}

      {/* ══ ESTILO > CONTROLE DE FLUXO ══ */}
      {group === "estilo" && subTab === "fluxo" && (<>
        {filterBar}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {FLUXO_STAGES.map(stage => {
            const counts = stage.options.map(opt => ({
              label: opt,
              value: fluxoJoined.filter((r: any) => r[stage.field] === opt).length,
              color: FLUXO_COLORS[opt] || B300,
            })).filter(s => s.value > 0);
            const sem = fluxoJoined.filter((r: any) => !r[stage.field]).length;
            if (sem > 0) counts.push({ label: "Sem status", value: sem, color: B100 });
            const tot = counts.reduce((s, c) => s + c.value, 0);
            return (
              <ChartCard key={stage.field} title={stage.label}>
                <DonutChart segments={counts} total={tot} />
              </ChartCard>
            );
          })}
        </div>
        {/* Timeline: pending deliveries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartCard title="Pilotagem — entregas previstas por fornecedor">
            <BarChart items={byKey(fluxoJoined.filter((r:any) => r.prev_entrega_piloto), "fornecedor")} />
          </ChartCard>
          <ChartCard title="Produção — entregas liberadas por fornecedor">
            <BarChart items={byKey(fluxoJoined.filter((r:any) => r.status_producao === "PRODUÇÃO LIBERADA"), "fornecedor")} />
          </ChartCard>
        </div>
      </>)}

      {/* ══ ESTILO > VARIANTES ══ */}
      {group === "estilo" && subTab === "variantes" && (<>
        {filterBar}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {[
            { label: "Total SKUs",    value: total },
            { label: "Total variantes", value: totalVar },
            { label: "Média cores/SKU", value: total > 0 ? Math.round(totalVar / total * 10) / 10 : 0 },
            { label: "SKUs sem cor",   value: filtered.filter(r => !variantes[r.ref]?.length).length },
          ].map((s, i) => <StatCard key={s.label} label={s.label} value={s.value} bg={STAT_BG[i]} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartCard title="Variantes por grupo"><BarChart items={varByGrupo} /></ChartCard>
          <ChartCard title="Variantes por coleção"><BarChart items={varByColecao} /></ChartCard>
          <ChartCard title="Cores mais frequentes"><BarChart items={totalColors} /></ChartCard>
          <ChartCard title="Top SKUs por nº de cores"><BarChart items={topVarSku} /></ChartCard>
        </div>
      </>)}

      {/* ══ COMPRAS > DESENVOLVIMENTO ══ */}
      {group === "compras" && subTab === "desenvolvimento" && (<>
        {filterBar}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {[
            { label: "SKUs com fornecedor", value: cTotal },
            { label: "Variantes",           value: cTotalVar },
            { label: "Fornecedores",        value: byFornDev.length },
            { label: "Grupos",              value: byGrupoDev.length },
          ].map((s, i) => <StatCard key={s.label} label={s.label} value={s.value} bg={STAT_BG[i]} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartCard title="Por fornecedor"><BarChart items={byFornDev} /></ChartCard>
          <ChartCard title="Tipo de operação"><DonutChart segments={toSeg(byOpDev)} total={byOpDev.reduce((s,[,n])=>s+n,0)} /></ChartCard>
          <ChartCard title="Por grupo"><BarChart items={byGrupoDev} /></ChartCard>
          <ChartCard title="Por coleção"><BarChart items={byColDev} /></ChartCard>
        </div>
      </>)}

      {/* ══ COMPRAS > VARIANTES ══ */}
      {group === "compras" && subTab === "variantes" && (<>
        {filterBar}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {[
            { label: "SKUs com fornecedor", value: cTotal },
            { label: "Total variantes",     value: cTotalVar },
            { label: "Fornecedores",        value: byFornDev.length },
            { label: "Média cores/SKU",     value: cTotal > 0 ? Math.round(cTotalVar / cTotal * 10) / 10 : 0 },
          ].map((s, i) => <StatCard key={s.label} label={s.label} value={s.value} bg={STAT_BG[i]} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartCard title="Variantes por fornecedor"><BarChart items={varByForn} /></ChartCard>
          <ChartCard title="Variantes por grupo"><BarChart items={varByGrupoCmp} /></ChartCard>
          <ChartCard title="Cores mais frequentes (compras)">
            {(() => {
              const allColors: string[] = [];
              comprasFiltered.forEach(r => (variantes[r.ref] || []).forEach(c => allColors.push(c)));
              const c: Record<string, number> = {};
              allColors.forEach(x => { c[x] = (c[x] || 0) + 1; });
              return <BarChart items={Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,10)} />;
            })()}
          </ChartCard>
          <ChartCard title="Top SKUs por nº de cores (compras)">
            <BarChart items={comprasFiltered.map(r => [r.ref, variantes[r.ref]?.length || 0] as [string,number])
              .filter(([,c])=>c>0).sort((a,b)=>b[1]-a[1]).slice(0,10)} />
          </ChartCard>
        </div>
      </>)}

    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────── */

function StatCard({ label, value, bg }: { label: string; value: number; bg: string }) {
  return (
    <div className="rounded-2xl px-4 py-4 transition-all duration-200 hover:scale-[1.02] hover:brightness-110" style={{ background: bg }}>
      <div className="text-[11px] font-medium leading-tight mb-3" style={{ color: "rgba(255,255,255,0.7)" }}>{label}</div>
      <div className="text-[28px] font-bold tabnum tracking-[-0.04em] leading-none text-white">
        {typeof value === "number" && !Number.isInteger(value) ? value.toFixed(1) : Number(value).toLocaleString("pt-BR")}
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="dash-card p-5">
      <div className="text-[14px] font-semibold mb-5 tracking-[-0.01em]" style={{ color: B800 }}>{title}</div>
      {children}
    </div>
  );
}

function DonutChart({ segments, total }: { segments: { label: string; value: number; color: string }[]; total: number }) {
  if (!segments.length || total === 0) return <Empty />;
  const size = 140, stroke = 28, radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <div className="flex items-center gap-8">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          {segments.map((s, i) => {
            const dash = (s.value / total) * circumference;
            const cur = offset; offset += dash;
            return <circle key={i} cx={size/2} cy={size/2} r={radius} fill="none" stroke={s.color}
              strokeWidth={stroke} strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-cur} strokeLinecap="butt" className="transition-all duration-700" />;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[22px] font-bold tabnum tracking-[-0.03em]" style={{ color: B800 }}>{total}</span>
          <span className="text-[10px] text-[var(--label-tertiary)]">total</span>
        </div>
      </div>
      <div className="flex-1 space-y-2">
        {segments.map(s => (
          <div key={s.label} className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded shrink-0" style={{ background: s.color }} />
            <span className="text-[12px] text-[var(--label-primary)] flex-1 truncate leading-tight" title={s.label}>{s.label}</span>
            <span className="text-[13px] font-bold tabnum" style={{ color: B800 }}>{s.value}</span>
            <span className="text-[11px] text-[var(--label-tertiary)] w-9 text-right tabnum">{((s.value/total)*100).toFixed(0)}%</span>
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
      {items.map(([label, count], i) => (
        <div key={label} className="group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[12px] text-[var(--label-secondary)] font-medium truncate max-w-[200px]" title={label}>{label}</span>
            <span className="text-[13px] tabnum font-bold" style={{ color: B800 }}>{count}</span>
          </div>
          <div className="w-full rounded-lg h-[20px] overflow-hidden" style={{ background: B50 }}>
            <div className="h-full rounded-lg transition-all duration-700 ease-out group-hover:brightness-110"
              style={{ width: `${(count/max)*100}%`, background: SCALE[i % SCALE.length], minWidth: count > 0 ? 4 : 0 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Empty() {
  return <div className="py-8 text-center text-[13px] text-[var(--label-tertiary)]">Sem dados</div>;
}
