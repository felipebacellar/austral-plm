-- =============================================
-- AUSTRAL PLM — Migration 008: Tabela real de tarefas do Calendário
-- Execute no SQL Editor do Supabase (depois da 004, que cria is_admin()):
-- https://supabase.com/dashboard/project/notcdmsqbbtuhsgtupck/sql
--
-- CONTEXTO: o Calendário deixa de usar uma lista de tarefas fixa no código
-- (CALENDARIO_DATA em CalendarioView.tsx) e passa a buscar tudo desta
-- tabela — permitindo criar, editar e excluir tarefas direto pela tela do
-- PLM, sem precisar mexer em código. Datas são reais (data_inicio/data_fim),
-- não mais um índice de semana preso a uma lista fixa, então a grade do
-- Gantt se ajusta sozinha conforme as tarefas cadastradas.
--
-- A tabela calendario_status (migração 007) fica obsoleta com esta mudança
-- — o status agora é uma coluna direto na própria tarefa — por isso é
-- removida aqui.
-- =============================================

DROP TABLE IF EXISTS calendario_status;

CREATE TABLE IF NOT EXISTS calendario_tarefas (
  id           BIGSERIAL PRIMARY KEY,
  tarefa       TEXT NOT NULL,
  colecao      TEXT NOT NULL,
  responsavel  TEXT DEFAULT '',
  status       TEXT NOT NULL DEFAULT 'PENDENTE',
  data_inicio  DATE NOT NULL,
  data_fim     DATE NOT NULL,
  descricao    TEXT DEFAULT '',
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_calendario_tarefas_colecao ON calendario_tarefas(colecao);
CREATE INDEX IF NOT EXISTS idx_calendario_tarefas_datas ON calendario_tarefas(data_inicio, data_fim);

ALTER TABLE calendario_tarefas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select" ON calendario_tarefas;
DROP POLICY IF EXISTS "authenticated_write" ON calendario_tarefas;
DROP POLICY IF EXISTS "authenticated_update" ON calendario_tarefas;
DROP POLICY IF EXISTS "admin_delete" ON calendario_tarefas;

CREATE POLICY "authenticated_select" ON calendario_tarefas FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_write"  ON calendario_tarefas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update" ON calendario_tarefas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_delete"         ON calendario_tarefas FOR DELETE TO authenticated USING (public.is_admin());
