"use client";

import { useMemo } from "react";
import type { CalendarioTarefa } from "@/lib/db";
import { getColecaoColor } from "@/lib/collection-colors";
import { parseISO } from "@/lib/calendario-utils";

const B900 = "#00254D"; const B800 = "#003A75"; const B700 = "#00509E";
const B600 = "#0066CC"; const B500 = "#007AFF"; const B400 = "#3395FF";
const B300 = "#66B0FF"; const B50 = "#E8F2FF";
const RED = "#D9432E"; const AMBER = "#B87400"; const GREEN = "#1F8B3D";

type Props = {
  tarefas: CalendarioTarefa[];
  loading: boolean;
  onEditTask: (t: CalendarioTarefa) => void;
};

type Atraso = { tarefa: CalendarioTarefa; dias: number };

function diasEntre(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

export default function CalendarioControleView({ tarefas, loading, onEditTask }: Props) {
  const hoje = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);

  const atrasadas: Atraso[] = useMemo(() => {
    return tarefas
      .filter(t => t.status !== "CONCLUÍDO" && parseISO(t.data_fim) < hoje)
      .map(t => ({ tarefa: t, dias: diasEntre(hoje, parseISO(t.data_fim)) }))
      .sort((a, b) => b.dias - a.dias);
  }, [tarefas, hoje]);

  const vencendoEmBreve = useMemo(() => {
    const limite = new Date(hoje); limite.setDate(limite.getDate() + 7);
    return tarefas
      .filter(t => t.status !== "CONCLUÍDO" && parseISO(t.data_fim) >= hoje && parseISO(t.data_fim) <= limite)
      .sort((a, b) => a.data_fim.localeCompare(b.data_fim));
  }, [tarefas, hoje]);

  const stats = useMemo(() => {
    const total = tarefas.length;
    const concluidas = tarefas.filter(t => t.status === "CONCLUÍDO").length;
    const emAndamento = tarefas.filter(t => t.status === "EM ANDAMENTO").length;
    const pendentes = tarefas.filter(t => t.status === "PENDENTE").length;
    return { total, concluidas, emAndamento, pendentes, atrasadas: atrasadas.length };
  }, [tarefas, atrasadas]);

  const porSetor = useMemo(() => {
    const m = new Map<string, { total: number; concluidas: number; emAndamento: number; pendentes: number; atrasadas: number }>();
    for (const t of tarefas) {
      const setor = t.responsavel?.trim() || "Sem responsável";
      if (!m.has(setor)) m.set(setor, { total: 0, concluidas: 0, emAndamento: 0, pendentes: 0, atrasadas: 0 });
      const e = m.get(setor)!;
      e.total++;
      if (t.status === "CONCLUÍDO") e.concluidas++;
      else if (t.status === "EM ANDAMENTO") e.emAndamento++;
      else e.pendentes++;
      if (t.status !== "CONCLUÍDO" && parseISO(t.data_fim) < hoje) e.atrasadas++;
    }
    return Array.from(m.entries())
      .map(([setor, v]) => ({ setor, ...v }))
      .sort((a, b) => b.atrasadas - a.atrasadas || b.total - a.total);
  }, [tarefas, hoje]);

  const fmtData = (iso: string) => { const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}`; };

  if (loading) {
    return <div className="plm-loading" style={{ padding: "48px 0" }}><div className="plm-loading-spinner" /></div>;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Stat tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label="Total" value={stats.total} bg={B800} />
        <StatCard label="Atrasadas" value={stats.atrasadas} bg={RED} />
        <StatCard label="Em andamento" value={stats.emAndamento} bg={AMBER} />
        <StatCard label="Pendentes" value={stats.pendentes} bg={B500} />
        <StatCard label="Concluídas" value={stats.concluidas} bg={GREEN} />
      </div>

      {/* Por setor */}
      <div className="apple-card p-5">
        <div className="text-[14px] font-semibold mb-4" style={{ color: B800 }}>Tarefas por setor</div>
        {porSetor.length === 0 ? (
          <div className="py-8 text-center text-[13px] text-[var(--label-tertiary)]">Sem dados</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-[var(--separator)]">
                  <th className="text-left py-2 pr-3 font-semibold text-[var(--label-secondary)]">Setor</th>
                  <th className="text-center py-2 px-2 font-semibold text-[var(--label-secondary)]">Total</th>
                  <th className="text-center py-2 px-2 font-semibold" style={{ color: RED }}>Atrasadas</th>
                  <th className="text-center py-2 px-2 font-semibold text-[var(--label-secondary)]">Em andamento</th>
                  <th className="text-center py-2 px-2 font-semibold text-[var(--label-secondary)]">Pendentes</th>
                  <th className="text-left py-2 pl-3 font-semibold text-[var(--label-secondary)] w-40">Progresso</th>
                </tr>
              </thead>
              <tbody>
                {porSetor.map(s => {
                  const pct = s.total > 0 ? Math.round((s.concluidas / s.total) * 100) : 0;
                  return (
                    <tr key={s.setor} className="border-b border-[var(--separator)]">
                      <td className="py-2 pr-3 font-medium text-[var(--label-primary)]">{s.setor}</td>
                      <td className="text-center py-2 px-2 tabnum">{s.total}</td>
                      <td className="text-center py-2 px-2 tabnum font-bold" style={{ color: s.atrasadas > 0 ? RED : "var(--label-quaternary)" }}>
                        {s.atrasadas || "—"}
                      </td>
                      <td className="text-center py-2 px-2 tabnum">{s.emAndamento}</td>
                      <td className="text-center py-2 px-2 tabnum">{s.pendentes}</td>
                      <td className="py-2 pl-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 rounded-full h-[8px] overflow-hidden" style={{ background: B50 }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct === 100 ? GREEN : B500 }} />
                          </div>
                          <span className="tabnum text-[11px] text-[var(--label-tertiary)] w-8 text-right">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tarefas atrasadas */}
      <div className="apple-card p-5">
        <div className="text-[14px] font-semibold mb-4 flex items-center gap-2" style={{ color: B800 }}>
          Tarefas atrasadas
          {atrasadas.length > 0 && (
            <span className="text-[11px] font-bold text-white rounded-full px-2 py-0.5" style={{ background: RED }}>{atrasadas.length}</span>
          )}
        </div>
        {atrasadas.length === 0 ? (
          <div className="py-8 text-center text-[13px] text-[var(--label-tertiary)]">Nenhuma tarefa atrasada 🎉</div>
        ) : (
          <div className="flex flex-col gap-2">
            {atrasadas.map(({ tarefa, dias }) => {
              const cor = getColecaoColor(tarefa.colecao);
              return (
                <button
                  key={tarefa.id}
                  onClick={() => onEditTask(tarefa)}
                  className="flex items-center gap-3 p-2.5 rounded-lg border border-[var(--separator)] hover:bg-[var(--bg-secondary)] text-left transition-colors"
                >
                  <span className="text-[11px] font-bold text-white rounded-full px-2 py-1 flex-shrink-0" style={{ background: RED }}>
                    {dias}d
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-semibold text-[var(--label-primary)] truncate">{tarefa.tarefa}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ background: cor.bg, color: cor.text }}>{tarefa.colecao}</span>
                      {tarefa.responsavel && <span className="text-[10px] text-[var(--label-tertiary)]">{tarefa.responsavel}</span>}
                      <span className="text-[10px] text-[var(--label-tertiary)]">venceu em {fmtData(tarefa.data_fim)}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Vencendo em breve */}
      {vencendoEmBreve.length > 0 && (
        <div className="apple-card p-5">
          <div className="text-[14px] font-semibold mb-4" style={{ color: B800 }}>Vencendo nos próximos 7 dias</div>
          <div className="flex flex-col gap-2">
            {vencendoEmBreve.map(t => {
              const cor = getColecaoColor(t.colecao);
              return (
                <button
                  key={t.id}
                  onClick={() => onEditTask(t)}
                  className="flex items-center gap-3 p-2.5 rounded-lg border border-[var(--separator)] hover:bg-[var(--bg-secondary)] text-left transition-colors"
                >
                  <span className="text-[11px] font-bold rounded-full px-2 py-1 flex-shrink-0" style={{ background: B50, color: B700 }}>
                    {fmtData(t.data_fim)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-semibold text-[var(--label-primary)] truncate">{t.tarefa}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ background: cor.bg, color: cor.text }}>{t.colecao}</span>
                      {t.responsavel && <span className="text-[10px] text-[var(--label-tertiary)]">{t.responsavel}</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, bg }: { label: string; value: number; bg: string }) {
  return (
    <div className="rounded-2xl px-4 py-4" style={{ background: bg }}>
      <div className="text-[11px] font-medium leading-tight mb-3" style={{ color: "rgba(255,255,255,0.7)" }}>{label}</div>
      <div className="text-[24px] font-bold tabnum tracking-[-0.04em] leading-none text-white">{value}</div>
    </div>
  );
}
