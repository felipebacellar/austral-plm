"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  fetchCalendarioTarefas, createCalendarioTarefa, updateCalendarioTarefa, deleteCalendarioTarefa,
  type CalendarioTarefa,
} from "@/lib/db";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { getColecaoColor } from "@/lib/collection-colors";
import { parseISO, addDays, startOfWeekMonday, fmtDiaMes } from "@/lib/calendario-utils";
import CalendarioResumoView from "./CalendarioResumoView";

const STATUS_OPTIONS = ["PENDENTE", "EM ANDAMENTO", "CONCLUÍDO"] as const;
const STATUS_ORDER: Record<string, string> = { PENDENTE: "EM ANDAMENTO", "EM ANDAMENTO": "CONCLUÍDO", CONCLUÍDO: "PENDENTE" };

type Semana = { start: Date; end: Date; label: string };

const emptyForm = {
  tarefa: "", colecao: "", responsavel: "", status: "PENDENTE" as string,
  data_inicio: "", data_fim: "", descricao: "",
};

export default function CalendarioView() {
  const [subTab, setSubTab] = useState<"gantt" | "resumo">("gantt");
  const [tarefas, setTarefas] = useState<CalendarioTarefa[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterColecao, setFilterColecao] = useState("");
  const [filterResponsavel, setFilterResponsavel] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CalendarioTarefa | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  const { error: showError, success, Container: ToastContainer } = useToast();
  const { confirm, Dialog: ConfirmDialogEl } = useConfirm();
  const todayColRef = useRef<HTMLTableCellElement | null>(null);
  const scrolledRef = useRef(false);

  // Scroll horizontal duplicado (topo + fundo) sincronizado — evita ter que
  // descer até o fim da tabela (que pode ter centenas de linhas) só para
  // rolar a grade de semanas.
  const topScrollRef = useRef<HTMLDivElement>(null);
  const bottomScrollRef = useRef<HTMLDivElement>(null);
  const [tableScrollWidth, setTableScrollWidth] = useState(0);
  const syncingRef = useRef(false);

  const onTopScroll = () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    if (bottomScrollRef.current && topScrollRef.current) bottomScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    syncingRef.current = false;
  };
  const onBottomScroll = () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    if (topScrollRef.current && bottomScrollRef.current) topScrollRef.current.scrollLeft = bottomScrollRef.current.scrollLeft;
    syncingRef.current = false;
  };

  const load = async () => {
    setLoading(true);
    const data = await fetchCalendarioTarefas();
    setTarefas(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const colecoes = useMemo(() => Array.from(new Set(tarefas.map(t => t.colecao).filter(Boolean))).sort(), [tarefas]);
  const responsaveis = useMemo(() => Array.from(new Set(tarefas.map(t => t.responsavel).filter(Boolean))).sort(), [tarefas]);

  const filtered = useMemo(() => {
    return tarefas.filter(t =>
      (!filterColecao || t.colecao === filterColecao) &&
      (!filterResponsavel || t.responsavel === filterResponsavel) &&
      (!filterStatus || t.status === filterStatus)
    );
  }, [tarefas, filterColecao, filterResponsavel, filterStatus]);

  // Grade de semanas calculada a partir do intervalo real das tarefas — nunca fica
  // presa a um período fixo, e sempre inclui a semana atual para referência.
  const semanas: Semana[] = useMemo(() => {
    const hoje = new Date();
    let minD = hoje, maxD = hoje;
    if (tarefas.length) {
      minD = tarefas.reduce((min, t) => { const d = parseISO(t.data_inicio); return d < min ? d : min; }, parseISO(tarefas[0].data_inicio));
      maxD = tarefas.reduce((max, t) => { const d = parseISO(t.data_fim); return d > max ? d : max; }, parseISO(tarefas[0].data_fim));
    }
    // Garante que a semana atual sempre apareça, mesmo sem tarefas cobrindo-a
    if (hoje < minD) minD = hoje;
    if (hoje > maxD) maxD = addDays(hoje, 7 * 8);

    let cursor = startOfWeekMonday(addDays(minD, -7));
    const fim = startOfWeekMonday(addDays(maxD, 7));
    const out: Semana[] = [];
    while (cursor <= fim) {
      const end = addDays(cursor, 6);
      out.push({ start: cursor, end, label: `${fmtDiaMes(cursor)} - ${fmtDiaMes(end)}` });
      cursor = addDays(cursor, 7);
    }
    return out;
  }, [tarefas]);

  const hojeIdx = useMemo(() => {
    const hoje = new Date();
    return semanas.findIndex(s => hoje >= s.start && hoje <= s.end);
  }, [semanas]);

  useEffect(() => {
    if (!scrolledRef.current && todayColRef.current) {
      todayColRef.current.scrollIntoView({ inline: "center", block: "nearest" });
      scrolledRef.current = true;
    }
  }, [semanas]);

  // Mede a largura real da tabela para a barra de rolagem "fantasma" do topo
  // ter o mesmo tamanho da barra de baixo.
  useEffect(() => {
    const el = bottomScrollRef.current;
    if (!el) return;
    const measure = () => setTableScrollWidth(el.scrollWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [semanas, filtered]);

  const weekRangeFor = (t: CalendarioTarefa) => {
    const ini = parseISO(t.data_inicio);
    const fim = parseISO(t.data_fim);
    const iniIdx = semanas.findIndex(s => ini >= s.start && ini <= s.end);
    const fimIdx = semanas.findIndex(s => fim >= s.start && fim <= s.end);
    return { iniIdx: iniIdx === -1 ? 0 : iniIdx, fimIdx: fimIdx === -1 ? semanas.length - 1 : fimIdx };
  };

  const toggleStatus = async (t: CalendarioTarefa) => {
    const novoStatus = STATUS_ORDER[t.status] || "PENDENTE";
    setTarefas(prev => prev.map(x => x.id === t.id ? { ...x, status: novoStatus } : x));
    const err = await updateCalendarioTarefa(t.id, { status: novoStatus });
    if (err) {
      showError(`Erro ao salvar status: ${err}`);
      setTarefas(prev => prev.map(x => x.id === t.id ? { ...x, status: t.status } : x));
    }
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setFormErr(null); setShowModal(true); };
  const openEdit = (t: CalendarioTarefa) => {
    setEditing(t);
    setForm({
      tarefa: t.tarefa, colecao: t.colecao, responsavel: t.responsavel || "",
      status: t.status, data_inicio: t.data_inicio, data_fim: t.data_fim, descricao: t.descricao || "",
    });
    setFormErr(null);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setFormErr(null);
    if (!form.tarefa.trim()) { setFormErr("Informe o nome da tarefa."); return; }
    if (!form.colecao.trim()) { setFormErr("Informe a coleção."); return; }
    if (!form.data_inicio || !form.data_fim) { setFormErr("Informe as datas de início e fim."); return; }
    if (form.data_fim < form.data_inicio) { setFormErr("A data de fim não pode ser antes da data de início."); return; }

    setSaving(true);
    const payload = {
      tarefa: form.tarefa.trim(), colecao: form.colecao.trim(), responsavel: form.responsavel.trim(),
      status: form.status, data_inicio: form.data_inicio, data_fim: form.data_fim, descricao: form.descricao.trim(),
    };
    if (editing) {
      const err = await updateCalendarioTarefa(editing.id, payload);
      setSaving(false);
      if (err) { setFormErr(err); return; }
      success("Tarefa atualizada");
    } else {
      const { error } = await createCalendarioTarefa(payload);
      setSaving(false);
      if (error) { setFormErr(error); return; }
      success("Tarefa criada");
    }
    setShowModal(false);
    load();
  };

  const handleDelete = async (t: CalendarioTarefa) => {
    const confirmed = await confirm({
      title: "Excluir tarefa?",
      message: `"${t.tarefa}" será removida do calendário. Esta ação não pode ser desfeita.`,
      confirmLabel: "Excluir",
      cancelLabel: "Cancelar",
      variant: "danger",
    });
    if (!confirmed) return;
    const err = await deleteCalendarioTarefa(t.id);
    if (err) { showError(`Erro ao excluir: ${err}`); return; }
    success("Tarefa excluída");
    load();
  };

  const getStatusColor = (status: string) => {
    if (status === "CONCLUÍDO") return "bg-[#4caf50] text-white";
    if (status === "EM ANDAMENTO") return "bg-[#fbc02d] text-[#000]";
    return "bg-[#9e9e9e] text-white";
  };

  const inputCls = "apple-input w-full";

  return (
    <div className="flex flex-col gap-5 min-h-screen pb-10">
      <div className="apple-card p-5">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h2 className="text-[18px] font-bold tracking-[-0.02em]">Calendário</h2>
            <div className="text-[12px] text-[var(--label-tertiary)] mt-1">
              {tarefas.length} tarefa{tarefas.length !== 1 ? "s" : ""} cadastrada{tarefas.length !== 1 ? "s" : ""}
            </div>
          </div>
          <button onClick={openAdd} className="apple-btn-primary text-[13px]">+ Nova tarefa</button>
        </div>

        {/* Sub-navegação: Gantt / Resumo */}
        <div className="flex gap-1 mb-5 bg-[var(--surface-1)] rounded-lg p-1 w-fit border border-[var(--separator)]">
          <button
            onClick={() => setSubTab("gantt")}
            className="px-3 py-1.5 rounded-md text-[12px] font-semibold transition-colors"
            style={subTab === "gantt" ? { background: "var(--system-blue)", color: "white" } : { color: "var(--label-secondary)" }}
          >
            Gantt
          </button>
          <button
            onClick={() => setSubTab("resumo")}
            className="px-3 py-1.5 rounded-md text-[12px] font-semibold transition-colors"
            style={subTab === "resumo" ? { background: "var(--system-blue)", color: "white" } : { color: "var(--label-secondary)" }}
          >
            Resumo
          </button>
        </div>

        {subTab === "resumo" ? (
          <CalendarioResumoView tarefas={tarefas} loading={loading} onEditTask={openEdit} />
        ) : (
        <>
        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold uppercase text-[var(--label-tertiary)]">Coleção</label>
            <select value={filterColecao} onChange={e => setFilterColecao(e.target.value)} className="apple-input w-48">
              <option value="">Todas ({colecoes.length})</option>
              {colecoes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold uppercase text-[var(--label-tertiary)]">Responsável</label>
            <select value={filterResponsavel} onChange={e => setFilterResponsavel(e.target.value)} className="apple-input w-48">
              <option value="">Todos ({responsaveis.length})</option>
              {responsaveis.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold uppercase text-[var(--label-tertiary)]">Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="apple-input w-48">
              <option value="">Todos</option>
              <option value="PENDENTE">⏳ Pendente</option>
              <option value="EM ANDAMENTO">⚙ Em andamento</option>
              <option value="CONCLUÍDO">✓ Concluído</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="plm-loading" style={{ padding: "48px 0" }}><div className="plm-loading-spinner" /></div>
        ) : (
          <>
            {/* Gantt Chart */}
            <div className="border border-[var(--separator)] rounded-xl overflow-hidden">
              {/* Scrollbar "fantasma" no topo — sincronizada com a de baixo, para não
                  precisar descer até o fim de uma tabela com centenas de linhas só
                  para rolar horizontalmente. */}
              <div ref={topScrollRef} onScroll={onTopScroll} style={{ overflowX: "auto", overflowY: "hidden" }}>
                <div style={{ width: tableScrollWidth, height: 1 }} />
              </div>
              <div ref={bottomScrollRef} onScroll={onBottomScroll} className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[var(--surface-1)] border-b border-[var(--separator)]">
                      <th className="px-4 py-3 text-left font-semibold text-[12px] w-64 sticky left-0 bg-[var(--surface-1)] z-10">
                        Tarefa
                      </th>
                      {semanas.map((semana, idx) => (
                        <th
                          key={idx}
                          ref={idx === hojeIdx ? todayColRef : undefined}
                          className={`px-2 py-3 text-center font-semibold text-[11px] min-w-[100px] border-r border-[var(--separator)] whitespace-nowrap ${idx === hojeIdx ? "bg-[var(--system-blue)]/10 text-[var(--system-blue)]" : ""}`}
                        >
                          {semana.label}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={semanas.length + 1} className="px-4 py-8 text-center text-[var(--label-tertiary)] text-[13px]">
                          Nenhuma tarefa encontrada para os filtros selecionados
                        </td>
                      </tr>
                    ) : (
                      filtered.map(tarefa => {
                        const cor = getColecaoColor(tarefa.colecao);
                        const { iniIdx, fimIdx } = weekRangeFor(tarefa);
                        return (
                          <tr key={tarefa.id} className="border-b border-[var(--separator)] hover:bg-[var(--bg-secondary)] transition-colors">
                            <td className="px-4 py-3 sticky left-0 bg-white z-10 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <div className="font-semibold text-[12px] text-[var(--label-primary)] truncate">
                                    {tarefa.tarefa}
                                  </div>
                                  <span
                                    className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold truncate max-w-full"
                                    style={{ background: cor.bg, color: cor.text }}
                                  >
                                    {tarefa.colecao}
                                  </span>
                                  {tarefa.responsavel && (
                                    <div className="text-[10px] text-[var(--label-tertiary)] mt-1">
                                      {tarefa.responsavel}
                                    </div>
                                  )}
                                  <div className="mt-1 flex items-center gap-1">
                                    <button
                                      onClick={() => toggleStatus(tarefa)}
                                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${getStatusColor(tarefa.status)}`}
                                      title="Clique para mudar status"
                                    >
                                      {tarefa.status}
                                    </button>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1 flex-shrink-0">
                                  <button onClick={() => openEdit(tarefa)} title="Editar" className="w-5 h-5 flex items-center justify-center text-[var(--label-tertiary)] hover:text-[var(--system-blue)]">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                                  </button>
                                  <button onClick={() => handleDelete(tarefa)} title="Excluir" className="w-5 h-5 flex items-center justify-center text-[var(--label-tertiary)] hover:text-[var(--system-red)]">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                                  </button>
                                </div>
                              </div>
                            </td>

                            {semanas.map((_, semanaIdx) => {
                              const isInRange = semanaIdx >= iniIdx && semanaIdx <= fimIdx;
                              const isStart = semanaIdx === iniIdx;
                              const isEnd = semanaIdx === fimIdx;
                              const isOnly = isStart && isEnd;

                              return (
                                <td
                                  key={semanaIdx}
                                  className={`px-2 py-3 text-center border-r border-[var(--separator)] min-w-[100px] ${semanaIdx === hojeIdx ? "bg-[var(--system-blue)]/5" : ""}`}
                                >
                                  {isInRange && (
                                    <div
                                      className="py-1 px-1 text-[10px] font-semibold text-center truncate"
                                      title={tarefa.descricao || tarefa.tarefa}
                                      style={{
                                        background: cor.bar,
                                        color: cor.text,
                                        borderRadius: isOnly ? 6 : isStart ? "6px 0 0 6px" : isEnd ? "0 6px 6px 0" : 0,
                                        marginLeft: isStart ? 0 : -8,
                                        marginRight: isEnd ? 0 : -8,
                                        paddingLeft: isStart ? 8 : 0,
                                        paddingRight: isEnd ? 8 : 0,
                                        width: isOnly ? undefined : "calc(100% + 16px)",
                                      }}
                                    >
                                      {isStart ? "●" : ""}
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 text-[12px] text-[var(--label-tertiary)]">
              Mostrando <span className="font-semibold">{filtered.length}</span> de <span className="font-semibold">{tarefas.length}</span> tarefas
            </div>

            {/* Legenda de coleções */}
            <div className="mt-6 p-4 bg-[var(--surface-1)] rounded-lg border border-[var(--separator)]">
              <div className="text-[12px] font-semibold text-[var(--label-secondary)] mb-3 uppercase">Coleções</div>
              <div className="flex flex-wrap gap-3">
                {colecoes.map(c => {
                  const cor = getColecaoColor(c);
                  return (
                    <span key={c} className="px-2 py-0.5 rounded text-[11px] font-semibold" style={{ background: cor.bg, color: cor.text }}>
                      {c}
                    </span>
                  );
                })}
              </div>
              <div className="text-[12px] text-[var(--label-secondary)] mt-3">
                • Clique no status da tarefa para mudar (Pendente → Em andamento → Concluído)
              </div>
            </div>
          </>
        )}
        </>
        )}
      </div>

      {/* Modal de criar/editar tarefa */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div className="apple-card" style={{ width: 480, maxHeight: "85vh", overflowY: "auto", padding: 24 }}>
            <div className="text-[16px] font-bold mb-4">{editing ? "Editar tarefa" : "Nova tarefa"}</div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-semibold uppercase text-[var(--label-tertiary)] block mb-1">Tarefa</label>
                <input value={form.tarefa} onChange={e => setForm(f => ({ ...f, tarefa: e.target.value }))} className={inputCls} placeholder="Ex: Campanha - Captação estúdio" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase text-[var(--label-tertiary)] block mb-1">Coleção</label>
                  <input value={form.colecao} onChange={e => setForm(f => ({ ...f, colecao: e.target.value }))} className={inputCls} placeholder="Ex: Inverno 27" list="colecoes-list" />
                  <datalist id="colecoes-list">
                    {colecoes.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase text-[var(--label-tertiary)] block mb-1">Responsável</label>
                  <input value={form.responsavel} onChange={e => setForm(f => ({ ...f, responsavel: e.target.value }))} className={inputCls} placeholder="Ex: Criação" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase text-[var(--label-tertiary)] block mb-1">Início</label>
                  <input type="date" value={form.data_inicio} onChange={e => setForm(f => ({ ...f, data_inicio: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase text-[var(--label-tertiary)] block mb-1">Fim</label>
                  <input type="date" value={form.data_fim} onChange={e => setForm(f => ({ ...f, data_fim: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase text-[var(--label-tertiary)] block mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="apple-select w-full">
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase text-[var(--label-tertiary)] block mb-1">Descrição (opcional)</label>
                <textarea value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} className={inputCls} rows={3} />
              </div>

              {formErr && (
                <div style={{ background: "rgba(255,59,48,0.08)", border: "1px solid rgba(255,59,48,0.2)", color: "var(--system-red)", borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
                  {formErr}
                </div>
              )}

              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setShowModal(false)} className="apple-btn-secondary text-[13px]">Cancelar</button>
                <button onClick={handleSubmit} disabled={saving} className="apple-btn-primary text-[13px]" style={{ opacity: saving ? 0.6 : 1 }}>
                  {saving ? "Salvando…" : editing ? "Salvar alterações" : "Criar tarefa"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialogEl />
      <ToastContainer />
    </div>
  );
}
