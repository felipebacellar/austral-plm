"use client";

import { useState, useMemo } from "react";
import StatusPill from "@/components/ui/StatusPill";

interface CalendarioRow {
  tarefa: string;
  colecao: string;
  responsavel: string;
  status: "CONCLUÍDO" | "EM ANDAMENTO" | "PENDENTE";
  descricao?: string;
  progresso: number;
}

const CALENDARIO_DATA: CalendarioRow[] = [
  { tarefa: "Campanha - Planejamento Inicial", colecao: "Inverno 25 / Raw", responsavel: "Criação", status: "CONCLUÍDO", progresso: 100, descricao: "Definição de localização, definição de janela de captação, alinhamento de objetivos, definição de range de orçamento." },
  { tarefa: "Campanha - Planejamento Criativo", colecao: "Inverno 25 / Raw", responsavel: "Criação", status: "CONCLUÍDO", progresso: 100, descricao: "Pesquisa de acessórios e elementos de composição - vitrine, Pesquisa de acessórios e elementos de composição, campanha, moodboard, Escopo de equipe, definição de storytelling." },
  { tarefa: "Pesquisa de tendências e comportamento", colecao: "Inverno 26", responsavel: "Produto", status: "CONCLUÍDO", progresso: 100, descricao: "Pesquisa de tendências de moda e comportamento." },
  { tarefa: "Definição do Tema", colecao: "Inverno 26", responsavel: "Criação", status: "CONCLUÍDO", progresso: 100 },
  { tarefa: "Acompanhamento estamparia mostruário", colecao: "Fluvial", responsavel: "Produto / Criação", status: "CONCLUÍDO", progresso: 100, descricao: "Viagem Heitor para Santa Catarina" },
  { tarefa: "Campanha - Pré Produção", colecao: "Inverno 25 / Raw", responsavel: "Criação", status: "CONCLUÍDO", progresso: 100 },
  { tarefa: "Pesquisa de tendências", colecao: "Inverno 26", responsavel: "Produto", status: "CONCLUÍDO", progresso: 100 },
  { tarefa: "Definição de bases já disponíveis", colecao: "Inverno 26", responsavel: "Produto", status: "CONCLUÍDO", progresso: 100 },
  { tarefa: "Campanha - Captação", colecao: "Inverno 25 / Raw", responsavel: "Marketing / Criação", status: "CONCLUÍDO", progresso: 100 },
  { tarefa: "Apresentação do Moodboard, Cartela de Cores", colecao: "Inverno 26", responsavel: "", status: "CONCLUÍDO", progresso: 100 },
  { tarefa: "Desenvolvimento de Aviamentos", colecao: "Inverno 26", responsavel: "", status: "CONCLUÍDO", progresso: 100 },
  { tarefa: "Campanha - Pós produção e entrega", colecao: "Aukai", responsavel: "", status: "CONCLUÍDO", progresso: 100 },
  { tarefa: "Início pesquisa estampas", colecao: "Inverno 26", responsavel: "", status: "CONCLUÍDO", progresso: 100 },
  { tarefa: "Preparação para lançamento", colecao: "Aukai", responsavel: "", status: "CONCLUÍDO", progresso: 100 },
  { tarefa: "Recebimento do mostruário", colecao: "Fluvial", responsavel: "", status: "CONCLUÍDO", progresso: 100 },
  { tarefa: "Desenvolvimento de fichas técnicas - Produtos diferenciados", colecao: "Inverno 26", responsavel: "", status: "CONCLUÍDO", progresso: 100 },
  { tarefa: "Prova de modelagem", colecao: "Verão 27", responsavel: "Produto", status: "CONCLUÍDO", progresso: 100 },
  { tarefa: "Desenvolvimento de Logomarca e moodboard", colecao: "Verão 27", responsavel: "", status: "CONCLUÍDO", progresso: 100 },
  { tarefa: "Campanha - Planejamento Criativo", colecao: "Collab Gaia", responsavel: "Criação", status: "EM ANDAMENTO", progresso: 80, descricao: "Pesquisa de acessórios e elementos de composição - vitrine" },
  { tarefa: "Campanha - Pós produção e entrega do material", colecao: "Collab Gaia", responsavel: "Criação", status: "EM ANDAMENTO", progresso: 70, descricao: "Entrega do material - Foto e vídeo da campanha" },
  { tarefa: "Preparação para lançamento", colecao: "Collab Gaia", responsavel: "Marketing", status: "EM ANDAMENTO", progresso: 65, descricao: "Montagem de vitrine, score dos produtos, preparação de materiais" },
  { tarefa: "Desenvolvimento de aviamentos", colecao: "Inverno 27", responsavel: "Produto", status: "EM ANDAMENTO", progresso: 75, descricao: "Desenvolvimento de aviamentos, lacre e assinatura nova" },
  { tarefa: "Recebimento de desenvolvimentos", colecao: "Inverno 27", responsavel: "Produto", status: "EM ANDAMENTO", progresso: 60 },
  { tarefa: "Prova das inclusões", colecao: "Inverno 27", responsavel: "Produto", status: "EM ANDAMENTO", progresso: 50 },
  { tarefa: "Lookbook - Pré produção lookbook", colecao: "Verão 27", responsavel: "Marketing", status: "EM ANDAMENTO", progresso: 55 },
  { tarefa: "Cadastro e compra de aviamentos - Mostruário", colecao: "Inverno 27", responsavel: "Compras", status: "PENDENTE", progresso: 20, descricao: "Cadastro e compra de aviamentos - Mostruário" },
  { tarefa: "Lançamento de coleção", colecao: "Collab Gaia", responsavel: "Marketing", status: "PENDENTE", progresso: 0 },
  { tarefa: "Cadastro e compra de mostruário - Inclusões", colecao: "", responsavel: "Compras", status: "PENDENTE", progresso: 10 },
  { tarefa: "Liberação de mostruário pós prova: Inclusões", colecao: "Inverno 27", responsavel: "Produto", status: "PENDENTE", progresso: 0 },
  { tarefa: "Desenvolvimento de fichas técnicas - Camisetas Gráficas", colecao: "Inverno 27", responsavel: "Produto", status: "PENDENTE", progresso: 15 },
];

export default function CalendarioView() {
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterColecao, setFilterColecao] = useState<string>("");
  const [filterResponsavel, setFilterResponsavel] = useState<string>("");

  const colecoes = useMemo(() => Array.from(new Set(CALENDARIO_DATA.map(r => r.colecao).filter(Boolean))).sort(), []);
  const responsaveis = useMemo(() => Array.from(new Set(CALENDARIO_DATA.map(r => r.responsavel).filter(Boolean))).sort(), []);

  const filtered = useMemo(() => {
    return CALENDARIO_DATA.filter(row =>
      (!filterStatus || row.status === filterStatus) &&
      (!filterColecao || row.colecao === filterColecao) &&
      (!filterResponsavel || row.responsavel === filterResponsavel)
    );
  }, [filterStatus, filterColecao, filterResponsavel]);

  const getStatusColor = (status: string) => {
    if (status === "CONCLUÍDO") return "bg-[var(--bg-success)] text-[var(--text-success)]";
    if (status === "EM ANDAMENTO") return "bg-[var(--bg-warning)] text-[var(--text-warning)]";
    return "bg-[var(--bg-secondary)] text-[var(--text-secondary)]";
  };

  return (
    <div className="flex flex-col gap-5 min-h-[400px]">
      <div className="apple-card p-5">
        <h2 className="text-[18px] font-bold tracking-[-0.02em] mb-4">Calendário 2026</h2>

        <div className="flex flex-wrap gap-3 mb-5">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold uppercase text-[var(--label-tertiary)]">Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="apple-input w-40">
              <option value="">Todos</option>
              <option value="CONCLUÍDO">✓ Concluído</option>
              <option value="EM ANDAMENTO">⚙ Em andamento</option>
              <option value="PENDENTE">⏳ Pendente</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold uppercase text-[var(--label-tertiary)]">Coleção</label>
            <select value={filterColecao} onChange={e => setFilterColecao(e.target.value)} className="apple-input w-40">
              <option value="">Todas ({colecoes.length})</option>
              {colecoes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold uppercase text-[var(--label-tertiary)]">Responsável</label>
            <select value={filterResponsavel} onChange={e => setFilterResponsavel(e.target.value)} className="apple-input w-40">
              <option value="">Todos ({responsaveis.length})</option>
              {responsaveis.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div className="border border-[var(--separator)] rounded-xl overflow-hidden">
          <table className="plm-table w-full">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-[13px]">Tarefa</th>
                <th className="w-32 px-4 py-3 text-left font-semibold text-[13px]">Coleção</th>
                <th className="w-28 px-4 py-3 text-left font-semibold text-[13px]">Responsável</th>
                <th className="w-28 px-4 py-3 text-center font-semibold text-[13px]">Status</th>
                <th className="w-32 px-4 py-3 text-left font-semibold text-[13px]">Progresso</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[var(--label-tertiary)] text-[13px]">
                    Nenhum resultado para os filtros selecionados
                  </td>
                </tr>
              ) : (
                filtered.map((row, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 text-[13px]">
                      <div className="font-medium text-[var(--label-primary)]">{row.tarefa}</div>
                      {row.descricao && <div className="text-[12px] text-[var(--label-secondary)] mt-1">{row.descricao}</div>}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[var(--label-secondary)]">
                      <span className="inline-block bg-[var(--bg-secondary)] px-2.5 py-1 rounded-lg">{row.colecao || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[var(--label-secondary)]">{row.responsavel || "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-[12px] font-semibold ${getStatusColor(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--system-blue)] transition-all"
                            style={{ width: `${row.progresso}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold tabnum text-[var(--label-secondary)] w-8 text-right">{row.progresso}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-[12px] text-[var(--label-tertiary)]">
          Mostrando <span className="font-semibold">{filtered.length}</span> de <span className="font-semibold">{CALENDARIO_DATA.length}</span> tarefas
        </div>
      </div>
    </div>
  );
}
