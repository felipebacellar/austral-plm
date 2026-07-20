"use client";

import { useState, useMemo } from "react";

interface TarefaCalendario {
  id: string;
  tarefa: string;
  colecao: string;
  responsavel: string;
  status: "CONCLUÍDO" | "EM ANDAMENTO" | "PENDENTE";
  dataInicio: string;
  dataFim: string;
  progresso: number;
  descricao?: string;
}

const CALENDARIO_DATA: TarefaCalendario[] = [
  { id: "1", tarefa: "Campanha - Planejamento", colecao: "Inverno 25", responsavel: "Criação", status: "CONCLUÍDO", dataInicio: "2026-01-20", dataFim: "2026-01-24", progresso: 100, descricao: "Definição de localização" },
  { id: "2", tarefa: "Pesquisa de tendências", colecao: "Inverno 26", responsavel: "Produto", status: "CONCLUÍDO", dataInicio: "2026-01-20", dataFim: "2026-01-24", progresso: 100 },
  { id: "3", tarefa: "Definição do Tema", colecao: "Inverno 26", responsavel: "Criação", status: "CONCLUÍDO", dataInicio: "2026-01-27", dataFim: "2026-01-31", progresso: 100 },
  { id: "4", tarefa: "Pesquisa de tendências", colecao: "Inverno 26", responsavel: "Produto", status: "CONCLUÍDO", dataInicio: "2026-02-03", dataFim: "2026-02-07", progresso: 100 },
  { id: "5", tarefa: "Campanha - Pré Produção", colecao: "Inverno 25", responsavel: "Criação", status: "CONCLUÍDO", dataInicio: "2026-01-27", dataFim: "2026-02-14", progresso: 100 },
  { id: "6", tarefa: "Campanha - Captação", colecao: "Inverno 25", responsavel: "Marketing", status: "CONCLUÍDO", dataInicio: "2026-02-17", dataFim: "2026-02-21", progresso: 100 },
  { id: "7", tarefa: "Desenvolvimento de Aviamentos", colecao: "Inverno 26", responsavel: "", status: "CONCLUÍDO", dataInicio: "2026-03-10", dataFim: "2026-03-14", progresso: 100 },
  { id: "8", tarefa: "Desenvolvimento fichas técnicas", colecao: "Inverno 26", responsavel: "", status: "CONCLUÍDO", dataInicio: "2026-02-03", dataFim: "2026-03-07", progresso: 100 },
  { id: "9", tarefa: "Planejamento Criativo", colecao: "Collab Gaia", responsavel: "Criação", status: "EM ANDAMENTO", dataInicio: "2026-03-17", dataFim: "2026-03-21", progresso: 80 },
  { id: "10", tarefa: "Preparação lançamento", colecao: "Collab Gaia", responsavel: "Marketing", status: "EM ANDAMENTO", dataInicio: "2026-03-10", dataFim: "2026-03-14", progresso: 70 },
  { id: "11", tarefa: "Desenvolvimento aviamentos", colecao: "Inverno 27", responsavel: "Produto", status: "EM ANDAMENTO", dataInicio: "2026-03-24", dataFim: "2026-03-28", progresso: 75 },
  { id: "12", tarefa: "Recebimento desenvolv.", colecao: "Inverno 27", responsavel: "Produto", status: "EM ANDAMENTO", dataInicio: "2026-03-31", dataFim: "2026-04-04", progresso: 60 },
  { id: "13", tarefa: "Cadastro e compra", colecao: "Inverno 27", responsavel: "Compras", status: "PENDENTE", dataInicio: "2026-04-07", dataFim: "2026-04-11", progresso: 20 },
  { id: "14", tarefa: "Lançamento coleção", colecao: "Collab Gaia", responsavel: "Marketing", status: "PENDENTE", dataInicio: "2026-04-14", dataFim: "2026-04-18", progresso: 0 },
  { id: "15", tarefa: "Liberação mostruário", colecao: "Inverno 27", responsavel: "Produto", status: "PENDENTE", dataInicio: "2026-04-21", dataFim: "2026-04-25", progresso: 0 },
];

export default function CalendarioView() {
  const [tarefas, setTarefas] = useState<TarefaCalendario[]>(CALENDARIO_DATA);
  const [mesAtual, setMesAtual] = useState(new Date(2026, 2)); // Março 2026
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

  // Gera dias do calendário
  const diasCalendario = useMemo(() => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diasDaSemanaInicio = primeiroDia.getDay();

    const dias: (number | null)[] = [];
    for (let i = 0; i < diasDaSemanaInicio; i++) dias.push(null);
    for (let i = 1; i <= ultimoDia.getDate(); i++) dias.push(i);
    return dias;
  }, [mesAtual]);

  const getTarefasDoDia = (dia: number) => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const dataStr = new Date(ano, mes, dia).toISOString().split("T")[0];
    return tarefas.filter(t => {
      const inicio = new Date(t.dataInicio);
      const fim = new Date(t.dataFim);
      const data = new Date(dataStr);
      return data >= inicio && data <= fim;
    });
  };

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
    if (status === "CONCLUÍDO") return "bg-[#dcf3dc] border-[#4caf50] text-[#2e7d32]";
    if (status === "EM ANDAMENTO") return "bg-[#fff9c4] border-[#fbc02d] text-[#f57f17]";
    return "bg-[#f5f5f5] border-[#9e9e9e] text-[#616161]";
  };

  const diasSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  return (
    <div className="flex flex-col gap-5 min-h-[600px]">
      <div className="apple-card p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[24px] font-bold tracking-[-0.02em] text-[var(--label-primary)]">
              {meses[mesAtual.getMonth()]} {mesAtual.getFullYear()}
            </h2>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1))}
              className="apple-btn-secondary px-4 py-2 text-[13px]"
            >
              ← Anterior
            </button>
            <button
              onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1))}
              className="apple-btn-secondary px-4 py-2 text-[13px]"
            >
              Próximo →
            </button>
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({ tarefa: "", colecao: "", responsavel: "", status: "PENDENTE", dataInicio: "", dataFim: "", progresso: 0 });
                setShowModal(true);
              }}
              className="apple-btn-primary px-4 py-2 text-[13px]"
            >
              + Nova
            </button>
          </div>
        </div>

        {/* Grid de dias da semana */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {diasSemana.map(dia => (
            <div key={dia} className="text-center py-3 font-semibold text-[12px] text-[var(--label-secondary)] uppercase tracking-[0.5px]">
              {dia}
            </div>
          ))}
        </div>

        {/* Grid do calendário */}
        <div className="grid grid-cols-7 gap-2 bg-[var(--surface-1)] p-2 rounded-lg border border-[var(--separator)]">
          {diasCalendario.map((dia, idx) => (
            <div
              key={idx}
              className={`min-h-[140px] rounded-lg border-2 p-2 ${
                dia ? "border-[var(--separator)] bg-white" : "border-transparent bg-[var(--surface-1)]"
              }`}
            >
              {dia && (
                <>
                  <div className="text-[14px] font-bold text-[var(--label-primary)] mb-2">
                    {dia}
                  </div>

                  <div className="space-y-1 max-h-[100px] overflow-y-auto">
                    {getTarefasDoDia(dia).map(tarefa => (
                      <div
                        key={tarefa.id}
                        className={`text-[10px] p-1.5 rounded border-l-4 cursor-pointer hover:opacity-80 group ${getStatusColor(tarefa.status)}`}
                        title={tarefa.tarefa}
                        onClick={() => {
                          setEditingId(tarefa.id);
                          setFormData(tarefa);
                          setShowModal(true);
                        }}
                      >
                        <div className="font-semibold line-clamp-2">{tarefa.tarefa}</div>
                        <div className="text-[9px] opacity-70 mt-0.5">{tarefa.colecao}</div>
                        {tarefa.progresso > 0 && (
                          <div className="w-full h-0.5 bg-black/10 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-black/40" style={{ width: `${tarefa.progresso}%` }} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
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
