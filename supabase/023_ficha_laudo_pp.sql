-- =============================================
-- AUSTRAL PLM — Migration 023: Laudo de Pré-Produção
--
-- Guarda a medida aferida por PONTO DE MEDIDA e por TAMANHO da grade (uma
-- linha por ponto, valores em JSONB por tamanho — mesmo padrão já usado em
-- graduacoes.valores). É diferente de ficha_provas, que guarda só 1 valor
-- por ponto (prova1/2/3), sem distinguir tamanho — o laudo de pré-produção
-- precisa medir a peça de CADA tamanho da grade, não só o tamanho base.
-- =============================================

CREATE TABLE IF NOT EXISTS ficha_laudo_pp (
  id        BIGSERIAL PRIMARY KEY,
  ficha_id  BIGINT REFERENCES fichas_tecnicas(id) ON DELETE CASCADE,
  ponto_cod TEXT NOT NULL,
  valores   JSONB DEFAULT '{}',
  UNIQUE(ficha_id, ponto_cod)
);
CREATE INDEX IF NOT EXISTS idx_ficha_laudo_pp_ficha_id ON ficha_laudo_pp(ficha_id);

-- RLS no mesmo padrão aplicado às demais tabelas de ficha (004_role_based_rls.sql):
-- leitura/escrita liberadas a qualquer autenticado, DELETE restrito a admin.
ALTER TABLE ficha_laudo_pp ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_select" ON ficha_laudo_pp;
DROP POLICY IF EXISTS "authenticated_write" ON ficha_laudo_pp;
DROP POLICY IF EXISTS "authenticated_update" ON ficha_laudo_pp;
DROP POLICY IF EXISTS "admin_delete" ON ficha_laudo_pp;
CREATE POLICY "authenticated_select" ON ficha_laudo_pp FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_write"  ON ficha_laudo_pp FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update" ON ficha_laudo_pp FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_delete"         ON ficha_laudo_pp FOR DELETE TO authenticated USING (public.is_admin());

-- Realtime, igual ao habilitado para ficha_provas em enable-realtime.sql
-- (ADD TABLE não é idempotente — o guarda evita erro ao rodar de novo)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'ficha_laudo_pp'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE ficha_laudo_pp;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
