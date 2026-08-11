-- =============================================
-- AUSTRAL PLM — Migration 024: Comentários e fotos do Laudo de Pré-Produção
--
-- Complementa ficha_laudo_pp (023): guarda os comentários em tópicos e as
-- fotos anexadas ao laudo — dados do laudo como um todo, não por ponto de
-- medida, por isso ficam numa tabela própria (1 linha por ficha).
-- =============================================

CREATE TABLE IF NOT EXISTS ficha_laudo_pp_info (
  ficha_id    BIGINT PRIMARY KEY REFERENCES fichas_tecnicas(id) ON DELETE CASCADE,
  comentarios TEXT DEFAULT '',
  fotos       JSONB DEFAULT '[]',
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- RLS no mesmo padrão de ficha_laudo_pp (023).
ALTER TABLE ficha_laudo_pp_info ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_select" ON ficha_laudo_pp_info;
DROP POLICY IF EXISTS "authenticated_write" ON ficha_laudo_pp_info;
DROP POLICY IF EXISTS "authenticated_update" ON ficha_laudo_pp_info;
DROP POLICY IF EXISTS "admin_delete" ON ficha_laudo_pp_info;
CREATE POLICY "authenticated_select" ON ficha_laudo_pp_info FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_write"  ON ficha_laudo_pp_info FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update" ON ficha_laudo_pp_info FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_delete"         ON ficha_laudo_pp_info FOR DELETE TO authenticated USING (public.is_admin());

-- Realtime (ADD TABLE não é idempotente — o guarda evita erro ao rodar de novo)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'ficha_laudo_pp_info'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE ficha_laudo_pp_info;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
