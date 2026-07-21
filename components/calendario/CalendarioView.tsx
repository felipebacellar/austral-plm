"use client";

import { useState, useMemo, useEffect } from "react";
import { fetchCalendarioStatus, upsertCalendarioStatus } from "@/lib/db";
import { useToast } from "@/components/ui/Toast";

interface TarefaCalendario {
  id: string;
  tarefa: string;
  colecao: string;
  responsavel: string;
  status: "CONCLUÍDO" | "EM ANDAMENTO" | "PENDENTE";
  semanaInicio: number; // índice da semana
  semanaFim: number;
  descricao?: string;
}

// Semanas geradas dinamicamente a partir da mesma âncora original (20/01/2026,
// uma terça-feira) — os índices semanaInicio/semanaFim das tarefas abaixo
// continuam válidos, mas a grade agora cobre o ano inteiro em vez de parar
// em junho, então o calendário nunca fica "preso" num período que já passou.
const SEMANA_ANCHOR = new Date(2026, 0, 20); // 20/01/2026
const TOTAL_SEMANAS = 52;
function fmtDiaMes(d: Date) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function gerarSemanas(count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const inicio = new Date(SEMANA_ANCHOR);
    inicio.setDate(inicio.getDate() + i * 7);
    const fim = new Date(inicio);
    fim.setDate(fim.getDate() + 4);
    return `${fmtDiaMes(inicio)} - ${fmtDiaMes(fim)}`;
  });
}
const SEMANAS = gerarSemanas(TOTAL_SEMANAS);

const CALENDARIO_DATA: TarefaCalendario[] = [
  { id: "1", tarefa: "Campanha - Planejamento Inicial", colecao: "Inverno 25 / Raw", responsavel: "Criação", status: "CONCLUÍDO", semanaInicio: 0, semanaFim: 0 },
  { id: "2", tarefa: "Pesquisa de tendências e comportamento", colecao: "Inverno 26", responsavel: "Produto", status: "CONCLUÍDO", semanaInicio: 0, semanaFim: 0 },
  { id: "3", tarefa: "Definição do Tema", colecao: "Inverno 26", responsavel: "Criação", status: "CONCLUÍDO", semanaInicio: 1, semanaFim: 1 },
  { id: "4", tarefa: "Acompanhamento estamparia mostruário", colecao: "Fluvial", responsavel: "Produto / Criação", status: "CONCLUÍDO", semanaInicio: 1, semanaFim: 1 },
  { id: "5", tarefa: "Campanha - Pré Produção", colecao: "Inverno 25 / Raw", responsavel: "Criação", status: "CONCLUÍDO", semanaInicio: 1, semanaFim: 3 },
  { id: "6", tarefa: "Pesquisa de tendências", colecao: "Inverno 26", responsavel: "Produto", status: "CONCLUÍDO", semanaInicio: 2, semanaFim: 2 },
  { id: "7", tarefa: "Definição de bases já disponíveis", colecao: "Inverno 26", responsavel: "Produto", status: "CONCLUÍDO", semanaInicio: 2, semanaFim: 2 },
  { id: "8", tarefa: "Campanha - Captação", colecao: "Inverno 25 / Raw", responsavel: "Marketing / Criação", status: "CONCLUÍDO", semanaInicio: 4, semanaFim: 4 },
  { id: "9", tarefa: "Apresentação do Moodboard, Cartela de Cores e Aviamentos", colecao: "Inverno 26", responsavel: "", status: "CONCLUÍDO", semanaInicio: 6, semanaFim: 6 },
  { id: "10", tarefa: "Desenvolvimento de Aviamentos", colecao: "Inverno 26", responsavel: "", status: "CONCLUÍDO", semanaInicio: 6, semanaFim: 6 },
  { id: "11", tarefa: "Campanha - Pós produção e entrega do material", colecao: "Aukai", responsavel: "", status: "CONCLUÍDO", semanaInicio: 6, semanaFim: 6 },
  { id: "12", tarefa: "Início pesquisa estampas", colecao: "Inverno 26", responsavel: "", status: "CONCLUÍDO", semanaInicio: 7, semanaFim: 7 },
  { id: "13", tarefa: "Preparação para lançamento", colecao: "Aukai", responsavel: "", status: "CONCLUÍDO", semanaInicio: 7, semanaFim: 7 },
  { id: "14", tarefa: "Recebimento do mostruário", colecao: "Fluvial", responsavel: "", status: "CONCLUÍDO", semanaInicio: 8, semanaFim: 8 },
  { id: "15", tarefa: "Campanha - Pré produção lookbook", colecao: "Fluvial", responsavel: "", status: "CONCLUÍDO", semanaInicio: 8, semanaFim: 8 },
  { id: "16", tarefa: "Lançamento de coleção", colecao: "Aukai", responsavel: "", status: "CONCLUÍDO", semanaInicio: 8, semanaFim: 8 },
  { id: "17", tarefa: "Campanha - Pós produção e entrega do material", colecao: "Inverno 25 / Raw", responsavel: "", status: "CONCLUÍDO", semanaInicio: 9, semanaFim: 9 },
  { id: "18", tarefa: "Campanha - Captação estúdio", colecao: "Fluvial", responsavel: "", status: "CONCLUÍDO", semanaInicio: 9, semanaFim: 9 },
  { id: "19", tarefa: "Desenvolvimento estampas e colorações", colecao: "Collab Pan", responsavel: "", status: "CONCLUÍDO", semanaInicio: 9, semanaFim: 9 },
  { id: "20", tarefa: "Apresentação de briefings das estampas", colecao: "Inverno 26", responsavel: "", status: "CONCLUÍDO", semanaInicio: 7, semanaFim: 9 },
  { id: "21", tarefa: "Desenvolvimento de fichas técnicas - produtos diferenciados", colecao: "Inverno 26", responsavel: "", status: "CONCLUÍDO", semanaInicio: 2, semanaFim: 10 },
  { id: "22", tarefa: "Passar desenvolvimento - produtos diferenciados", colecao: "Inverno 26", responsavel: "", status: "CONCLUÍDO", semanaInicio: 8, semanaFim: 8 },
  { id: "23", tarefa: "Impressão Catálogo e montagem showroom", colecao: "Fluvial", responsavel: "", status: "CONCLUÍDO", semanaInicio: 9, semanaFim: 9 },
  { id: "24", tarefa: "Liberação de produção - Mostruário", colecao: "Fluvial", responsavel: "", status: "CONCLUÍDO", semanaInicio: 9, semanaFim: 9 },
  { id: "25", tarefa: "Recebimento e envio para fornecedores dos tecidos de pilotagem", colecao: "Inverno 26", responsavel: "", status: "CONCLUÍDO", semanaInicio: 9, semanaFim: 9 },
  { id: "26", tarefa: "Campanha - Planejamento Inicial", colecao: "Collab Pan", responsavel: "", status: "CONCLUÍDO", semanaInicio: 9, semanaFim: 9 },
  { id: "27", tarefa: "Campanha - Planejamento Criativo", colecao: "Collab Pan", responsavel: "", status: "CONCLUÍDO", semanaInicio: 9, semanaFim: 9 },
];

export default function CalendarioView() {
  const [tarefas, setTarefas] = useState<TarefaCalendario[]>(CALENDARIO_DATA);
  const [filterColecao, setFilterColecao] = useState("");
  const [filterResponsavel, setFilterResponsavel] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const { error: showError, Container: ToastContainer } = useToast();

  useEffect(() => {
    let active = true;
    fetchCalendarioStatus().then(saved => {
      if (!active || Object.keys(saved).length === 0) return;
      setTarefas(prev => prev.map(t => saved[t.id] ? { ...t, status: saved[t.id] as any } : t));
    });
    return () => { active = false; };
  }, []);

  const colecoes = useMemo(() => Array.from(new Set(tarefas.map(t => t.colecao).filter(Boolean))).sort(), [tarefas]);
  const responsaveis = useMemo(() => Array.from(new Set(tarefas.map(t => t.responsavel).filter(Boolean))).sort(), [tarefas]);

  const filtered = useMemo(() => {
    return tarefas.filter(t =>
      (!filterColecao || t.colecao === filterColecao) &&
      (!filterResponsavel || t.responsavel === filterResponsavel) &&
      (!filterStatus || t.status === filterStatus)
    );
  }, [tarefas, filterColecao, filterResponsavel, filterStatus]);

  const toggleStatus = async (id: string) => {
    const atual = tarefas.find(t => t.id === id);
    if (!atual) return;
    const statusOrder = { "PENDENTE": "EM ANDAMENTO", "EM ANDAMENTO": "CONCLUÍDO", "CONCLUÍDO": "PENDENTE" };
    const novoStatus = statusOrder[atual.status] as TarefaCalendario["status"];

    setTarefas(prev => prev.map(t => t.id === id ? { ...t, status: novoStatus } : t));
    const err = await upsertCalendarioStatus(id, novoStatus);
    if (err) {
      showError(`Erro ao salvar status: ${err}`);
      setTarefas(prev => prev.map(t => t.id === id ? { ...t, status: atual.status } : t));
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "CONCLUÍDO") return "bg-[#4caf50] text-white";
    if (status === "EM ANDAMENTO") return "bg-[#fbc02d] text-[#000]";
    return "bg-[#9e9e9e] text-white";
  };

  const getStatusBg = (status: string) => {
    if (status === "CONCLUÍDO") return "bg-[#e8f5e9]";
    if (status === "EM ANDAMENTO") return "bg-[#fffde7]";
    return "bg-[#f5f5f5]";
  };

  return (
    <div className="flex flex-col gap-5 min-h-screen pb-10">
      <div className="apple-card p-5">
        <h2 className="text-[18px] font-bold tracking-[-0.02em] mb-5">Calendário 2026 - Gantt Chart</h2>

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

        {/* Gantt Chart */}
        <div className="border border-[var(--separator)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Header com semanas */}
              <thead>
                <tr className="bg-[var(--surface-1)] border-b border-[var(--separator)]">
                  <th className="px-4 py-3 text-left font-semibold text-[12px] w-64 sticky left-0 bg-[var(--surface-1)] z-10">
                    Tarefa
                  </th>
                  {SEMANAS.map((semana, idx) => (
                    <th key={idx} className="px-2 py-3 text-center font-semibold text-[11px] min-w-[100px] border-r border-[var(--separator)] whitespace-nowrap">
                      {semana}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Linhas de tarefas */}
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={SEMANAS.length + 1} className="px-4 py-8 text-center text-[var(--label-tertiary)] text-[13px]">
                      Nenhuma tarefa encontrada para os filtros selecionados
                    </td>
                  </tr>
                ) : (
                  filtered.map(tarefa => (
                    <tr key={tarefa.id} className="border-b border-[var(--separator)] hover:bg-[var(--bg-secondary)] transition-colors">
                      <td className="px-4 py-3 sticky left-0 bg-white z-10 min-w-0">
                        <div className="font-semibold text-[12px] text-[var(--label-primary)] truncate">
                          {tarefa.tarefa}
                        </div>
                        <div className="text-[11px] text-[var(--label-secondary)] truncate">
                          {tarefa.colecao}
                        </div>
                        {tarefa.responsavel && (
                          <div className="text-[10px] text-[var(--label-tertiary)]">
                            {tarefa.responsavel}
                          </div>
                        )}
                        <div className="mt-1">
                          <button
                            onClick={() => toggleStatus(tarefa.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${getStatusColor(tarefa.status)}`}
                            title="Clique para mudar status"
                          >
                            {tarefa.status}
                          </button>
                        </div>
                      </td>

                      {/* Células das semanas */}
                      {SEMANAS.map((_, semanaIdx) => {
                        const isInRange = semanaIdx >= tarefa.semanaInicio && semanaIdx <= tarefa.semanaFim;
                        const isStart = semanaIdx === tarefa.semanaInicio;
                        const isEnd = semanaIdx === tarefa.semanaFim;
                        const isOnly = isStart && isEnd;

                        return (
                          <td
                            key={semanaIdx}
                            className={`px-2 py-3 text-center border-r border-[var(--separator)] min-w-[100px] ${
                              isInRange ? getStatusBg(tarefa.status) : ""
                            }`}
                          >
                            {isInRange && (
                              <div
                                className={`py-1 px-1 rounded text-[10px] font-semibold text-center ${
                                  isOnly
                                    ? `${getStatusColor(tarefa.status)} rounded`
                                    : isStart
                                    ? `${getStatusColor(tarefa.status)} rounded-l`
                                    : isEnd
                                    ? `${getStatusColor(tarefa.status)} rounded-r`
                                    : `${getStatusColor(tarefa.status)}`
                                }`}
                                style={
                                  !isOnly
                                    ? {
                                        borderRadius: isStart ? "6px 0 0 6px" : isEnd ? "0 6px 6px 0" : "0",
                                        marginLeft: isStart ? "0" : "-8px",
                                        marginRight: isEnd ? "0" : "-8px",
                                        paddingLeft: isStart ? "8px" : "0",
                                        paddingRight: isEnd ? "8px" : "0",
                                        width: "calc(100% + 16px)",
                                      }
                                    : {}
                                }
                              >
                                {isOnly || isStart ? "●" : ""}
                                {isStart && !isEnd && "→"}
                                {isEnd && !isStart && "→"}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-[12px] text-[var(--label-tertiary)]">
          Mostrando <span className="font-semibold">{filtered.length}</span> de <span className="font-semibold">{tarefas.length}</span> tarefas
        </div>

        {/* Legenda */}
        <div className="mt-6 p-4 bg-[var(--surface-1)] rounded-lg border border-[var(--separator)]">
          <div className="text-[12px] font-semibold text-[var(--label-secondary)] mb-3 uppercase">Legenda</div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#4caf50]"></div>
              <span className="text-[12px]">Concluído</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#fbc02d]"></div>
              <span className="text-[12px]">Em andamento</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#9e9e9e]"></div>
              <span className="text-[12px]">Pendente</span>
            </div>
            <div className="text-[12px] text-[var(--label-secondary)]">
              • Clique no status para mudar
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
