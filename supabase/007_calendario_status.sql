-- =============================================
-- AUSTRAL PLM — Migration 007: Persistência de status do Calendário
-- Execute no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/notcdmsqbbtuhsgtupck/sql
--
-- CONTEXTO: clicar no status de uma tarefa no Calendário (components/
-- calendario/CalendarioView.tsx) hoje só muda um useState local — some ao
-- dar F5 e nenhum outro usuário vê a mudança. Esta tabela guarda o status
-- atual de cada tarefa (as tarefas em si continuam definidas no código,
-- só o status passa a ser persistido).
-- =============================================

CREATE TABLE IF NOT EXISTS calendario_status (
  tarefa_id   TEXT PRIMARY KEY,
  status      TEXT NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE calendario_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select" ON calendario_status;
DROP POLICY IF EXISTS "authenticated_write" ON calendario_status;
DROP POLICY IF EXISTS "authenticated_update" ON calendario_status;
DROP POLICY IF EXISTS "admin_delete" ON calendario_status;

CREATE POLICY "authenticated_select" ON calendario_status FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_write"  ON calendario_status FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update" ON calendario_status FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_delete"         ON calendario_status FOR DELETE TO authenticated USING (public.is_admin());
