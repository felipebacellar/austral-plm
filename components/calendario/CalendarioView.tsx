"use client";

import { useState, useMemo } from "react";

interface TarefaCalendario {
  id: string;
  tarefa: string;
  colecao: string;
  responsavel: string;
  status: "CONCLUÍDO" | "EM ANDAMENTO" | "PENDENTE";
  dataInicio: string; // formato YYYY-MM-DD
  dataFim: string;
  progresso: number;
  descricao?: string;
}

const CALENDARIO_DATA: TarefaCalendario[] = [
  { id: "1", tarefa: "Campanha - Planejamento Inicial", colecao: "Inverno 25", responsavel: "Criação", status: "CONCLUÍDO", dataInicio: "2026-01-20", dataFim: "2026-01-24", progresso: 100, descricao: "Definição de localização e janela de captação" },
  { id: "2", tarefa: "Pesquisa de tendências e comportamento", colecao: "Inverno 26", responsavel: "Produto", status: "CONCLUÍDO", dataInicio: "2026-01-20", dataFim: "2026-01-24", progresso: 100 },
  { id: "3", tarefa: "Definição do Tema", colecao: "Inverno 26", responsavel: "Criação", status: "CONCLUÍDO", dataInicio: "2026-01-27", dataFim: "2026-01-31", progresso: 100 },
  { id: "4", tarefa: "Pesquisa de tendências", colecao: "Inverno 26", responsavel: "Produto", status: "CONCLUÍDO", dataInicio: "2026-02-03", dataFim: "2026-02-07", progresso: 100 },
  { id: "5", tarefa: "Campanha - Pré Produção", colecao: "Inverno 25", responsavel: "Criação", status: "CONCLUÍDO", dataInicio: "2026-01-27", dataFim: "2026-02-14", progresso: 100 },
  { id: "6", tarefa: "Campanha - Captação", colecao: "Inverno 25", responsavel: "Marketing", status: "CONCLUÍDO", dataInicio: "2026-02-17", dataFim: "2026-02-21", progresso: 100 },
  { id: "7", tarefa: "Desenvolvimento de Aviamentos", colecao: "Inverno 26", responsavel: "", status: "CONCLUÍDO", dataInicio: "2026-03-10", dataFim: "2026-03-14", progresso: 100 },
  { id: "8", tarefa: "Desenvolvimento de fichas técnicas", colecao: "Inverno 26", responsavel: "", status: "CONCLUÍDO", dataInicio: "2026-02-03", dataFim: "2026-03-07", progresso: 100 },
  { id: "9", tarefa: "Campanha - Planejamento Criativo", colecao: "Collab Gaia", responsavel: "Criação", status: "EM ANDAMENTO", dataInicio: "2026-03-17", dataFim: "2026-03-21", progresso: 80 },
  { id: "10", tarefa: "Preparação para lançamento", colecao: "Collab Gaia", responsavel: "Marketing", status: "EM ANDAMENTO", dataInicio: "2026-03-10", dataFim: "2026-03-14", progresso: 70 },
  { id: "11", tarefa: "Desenvolvimento de aviamentos", colecao: "Inverno 27", responsavel: "Produto", status: "EM ANDAMENTO", dataInicio: "2026-03-24", dataFim: "2026-03-28", progresso: 75 },
  { id: "12", tarefa: "Recebimento de desenvolvimentos", colecao: "Inverno 27", responsavel: "Produto", status: "EM ANDAMENTO", dataInicio: "2026-03-31", dataFim: "2026-04-04", progresso: 60 },
  { id: "13", tarefa: "Cadastro e compra de aviamentos", colecao: "Inverno 27", responsavel: "Compras", status: "PENDENTE", dataInicio: "2026-04-07", dataFim: "2026-04-11", progresso: 20 },
  { id: "14", tarefa: "Lançamento de coleção", colecao: "Collab Gaia", responsavel: "Marketing", status: "PENDENTE", dataInicio: "2026-04-14", dataFim: "2026-04-18", progresso: 0 },
  { id: "15", tarefa: "Liberação de mostruário", colecao: "Inverno 27", responsavel: "Produto", status: "PENDENTE", dataInicio: "2026-04-21", dataFim: "2026-04-25", progresso: 0 },
];

export default function CalendarioView() {
  const [tarefas, setTarefas] = useState<TarefaCalendario[]>(CALENDARIO_DATA);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<TarefaCalendario>>({
    tarefa: "",
    colecao: "",
    responsavel: "",
    status: "PENDENTE",
    dataInicio: "",
    dataFim: "",
    progresso: 0,
  });

  const colecoes = useMemo(() => Array.from(new Set(tarefas.map(t => t.colecao).filter(Boolean))).sort(), [tarefas]);
  const responsaveis = useMemo(() => Array.from(new Set(tarefas.map(t => t.responsavel).filter(Boolean))).sort(), [tarefas]);

  // Ordena tarefas por data
  const tarefasOrdenadas = useMemo(() => {
    return [...tarefas].sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime());
  }, [tarefas]);

  // Agrupa por semana
  const tarefasPorSemana = useMemo(() => {
    const semanas: Record<string, TarefaCalendario[]> = {};
    tarefasOrdenadas.forEach(tarefa => {
      const dataInicio = new Date(tarefa.dataInicio);
      const semanaDe = dataInicio.toLocaleDateString("pt-BR", { month: "short", day: "numeric" });
      const semanaAte = new Date(new Date(tarefa.dataFim).getTime() + 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR", { month: "short", day: "numeric" });
      const chave = `${semanaDe} → ${semanaAte}`;
      if (!semanas[chave]) semanas[chave] = [];
      semanas[chave].push(tarefa);
    });
    return semanas;
  }, [tarefasOrdenadas]);

  const handleSave = () => {
    if (!formData.tarefa || !formData.dataInicio || !formData.dataFim) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    if (editingId) {
      setTarefas(prev => prev.map(t => t.id === editingId ? { ...t, ...formData } as TarefaCalendario : t));
    } else {
      const newId = String(Math.max(...tarefas.map(t => parseInt(t.id)), 0) + 1);
      setTarefas(prev => [...prev, { ...formData, id: newId } as TarefaCalendario]);
    }
    setShowModal(false);
    setFormData({ tarefa: "", colecao: "", responsavel: "", status: "PENDENTE", dataInicio: "", dataFim: "", progresso: 0 });
    setEditingId(null);
  };

  const handleCopy = (tarefa: TarefaCalendario) => {
    setEditingId(null);
    setFormData({
      tarefa: tarefa.tarefa,
      colecao: tarefa.colecao,
      responsavel: tarefa.responsavel,
      status: "PENDENTE",
      dataInicio: "",
      dataFim: "",
      progresso: 0,
      descricao: tarefa.descricao,
    });
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    if (status === "CONCLUÍDO") return "bg-[var(--bg-success)] text-[var(--text-success)]";
    if (status === "EM ANDAMENTO") return "bg-[var(--bg-warning)] text-[var(--text-warning)]";
    return "bg-[var(--bg-secondary)] text-[var(--text-secondary)]";
  };

  const formatData = (date: string) => new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

  return (
    <div className="flex flex-col gap-5 min-h-[600px]">
      <div className="apple-card p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[18px] font-bold tracking-[-0.02em]">Calendário 2026</h2>
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({ tarefa: "", colecao: "", responsavel: "", status: "PENDENTE", dataInicio: "", dataFim: "", progresso: 0 });
              setShowModal(true);
            }}
            className="apple-btn-primary px-4 py-2 text-[13px]"
          >
            + Nova Tarefa
          </button>
        </div>

        {/* Timeline Visual */}
        <div className="space-y-6">
          {Object.entries(tarefasPorSemana).map(([semana, semanasTarefas]) => (
            <div key={semana} className="border border-[var(--separator)] rounded-xl p-4">
              <div className="text-[13px] font-semibold text-[var(--label-secondary)] mb-4 uppercase tracking-[0.5px]">
                📅 Semana de {semana}
              </div>

              <div className="space-y-3">
                {semanasTarefas.map(tarefa => (
                  <div
                    key={tarefa.id}
                    className="border border-[var(--separator)] rounded-lg p-4 hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[13px] text-[var(--label-primary)] mb-2">
                          {tarefa.tarefa}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {tarefa.colecao && (
                            <span className="inline-block bg-[var(--bg-accent)] text-[var(--text-accent)] px-2.5 py-1 rounded text-[11px] font-semibold">
                              {tarefa.colecao}
                            </span>
                          )}
                          {tarefa.responsavel && (
                            <span className="inline-block bg-[var(--bg-secondary)] text-[var(--text-secondary)] px-2.5 py-1 rounded text-[11px]">
                              {tarefa.responsavel}
                            </span>
                          )}
                          <span className={`inline-block px-2.5 py-1 rounded text-[11px] font-semibold ${getStatusColor(tarefa.status)}`}>
                            {tarefa.status}
                          </span>
                        </div>

                        {tarefa.descricao && (
                          <div className="text-[12px] text-[var(--label-secondary)] mb-3 italic">
                            {tarefa.descricao}
                          </div>
                        )}

                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[11px] text-[var(--label-tertiary)]">
                            📆 {formatData(tarefa.dataInicio)} → {formatData(tarefa.dataFim)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden max-w-[200px]">
                            <div
                              className="h-full bg-[var(--system-blue)] transition-all"
                              style={{ width: `${tarefa.progresso}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-semibold tabnum text-[var(--label-secondary)] w-8 text-right">
                            {tarefa.progresso}%
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingId(tarefa.id);
                            setFormData(tarefa);
                            setShowModal(true);
                          }}
                          className="px-2.5 py-1 text-[11px] rounded border border-[var(--separator)] text-[var(--label-secondary)] hover:bg-[var(--bg-secondary)]"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleCopy(tarefa)}
                          className="px-2.5 py-1 text-[11px] rounded border border-[var(--separator)] text-[var(--label-secondary)] hover:bg-[var(--bg-secondary)]"
                          title="Copiar"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-[12px] text-[var(--label-tertiary)]">
          Total: <span className="font-semibold">{tarefas.length}</span> tarefas
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[var(--separator)] shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[var(--separator)]">
              <h3 className="text-[16px] font-bold">
                {editingId ? "Editar Tarefa" : "Nova Tarefa"}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-[12px] font-semibold text-[var(--label-secondary)] uppercase">Tarefa *</label>
                <input
                  type="text"
                  value={formData.tarefa || ""}
                  onChange={e => setFormData({ ...formData, tarefa: e.target.value })}
                  className="apple-input w-full mt-1"
                  placeholder="Nome da tarefa"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-semibold text-[var(--label-secondary)] uppercase">Coleção</label>
                  <input
                    type="text"
                    list="colecoes-list"
                    value={formData.colecao || ""}
                    onChange={e => setFormData({ ...formData, colecao: e.target.value })}
                    className="apple-input w-full mt-1 text-[13px]"
                    placeholder="Ex: Inverno 27"
                  />
                  <datalist id="colecoes-list">
                    {colecoes.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-[var(--label-secondary)] uppercase">Responsável</label>
                  <input
                    type="text"
                    list="responsaveis-list"
                    value={formData.responsavel || ""}
                    onChange={e => setFormData({ ...formData, responsavel: e.target.value })}
                    className="apple-input w-full mt-1 text-[13px]"
                    placeholder="Ex: Produto"
                  />
                  <datalist id="responsaveis-list">
                    {responsaveis.map(r => <option key={r} value={r} />)}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-semibold text-[var(--label-secondary)] uppercase">Data Início *</label>
                  <input
                    type="date"
                    value={formData.dataInicio || ""}
                    onChange={e => setFormData({ ...formData, dataInicio: e.target.value })}
                    className="apple-input w-full mt-1"
                  />
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-[var(--label-secondary)] uppercase">Data Fim *</label>
                  <input
                    type="date"
                    value={formData.dataFim || ""}
                    onChange={e => setFormData({ ...formData, dataFim: e.target.value })}
                    className="apple-input w-full mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-semibold text-[var(--label-secondary)] uppercase">Status</label>
                  <select
                    value={formData.status || "PENDENTE"}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="apple-input w-full mt-1 text-[13px]"
                  >
                    <option value="PENDENTE">Pendente</option>
                    <option value="EM ANDAMENTO">Em andamento</option>
                    <option value="CONCLUÍDO">Concluído</option>
                  </select>
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-[var(--label-secondary)] uppercase">Progresso %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progresso || 0}
                    onChange={e => setFormData({ ...formData, progresso: parseInt(e.target.value) || 0 })}
                    className="apple-input w-full mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-[var(--label-secondary)] uppercase">Descrição</label>
                <textarea
                  value={formData.descricao || ""}
                  onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                  className="apple-input w-full mt-1 text-[13px] resize-none"
                  rows={3}
                  placeholder="Detalhes da tarefa"
                />
              </div>
            </div>

            <div className="p-6 border-t border-[var(--separator)] flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="apple-btn-secondary px-4 py-2 text-[13px] flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="apple-btn-primary px-4 py-2 text-[13px] flex-1"
              >
                {editingId ? "Atualizar" : "Criar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
