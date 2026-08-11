-- =============================================
-- AUSTRAL PLM — Migration 025: Laudo de Pré-Produção por PEDIDO
--
-- Uma referência pode ter vários pedidos de produção, cada um medido em
-- cores diferentes e aprovado/reprovado separadamente. Isso promove o
-- "laudo" de 1 registro por ficha pra uma lista de laudos (1 por pedido)
-- por ficha — ficha_laudo_pp_pedidos é o cabeçalho de cada laudo/pedido;
-- ficha_laudo_pp (medidas) passa a apontar pro pedido, não mais pra ficha.
-- =============================================

-- ── Cabeçalho de cada laudo/pedido ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS ficha_laudo_pp_pedidos (
  id             BIGSERIAL PRIMARY KEY,
  ficha_id       BIGINT REFERENCES fichas_tecnicas(id) ON DELETE CASCADE,
  numero_pedido  TEXT DEFAULT '',
  status         TEXT DEFAULT '',
  comentarios    TEXT DEFAULT '',
  fotos          JSONB DEFAULT '[]',
  cores_tamanho  JSONB DEFAULT '{}',
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ficha_laudo_pp_pedidos_ficha_id ON ficha_laudo_pp_pedidos(ficha_id);

ALTER TABLE ficha_laudo_pp_pedidos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_select" ON ficha_laudo_pp_pedidos;
DROP POLICY IF EXISTS "authenticated_write" ON ficha_laudo_pp_pedidos;
DROP POLICY IF EXISTS "authenticated_update" ON ficha_laudo_pp_pedidos;
DROP POLICY IF EXISTS "admin_delete" ON ficha_laudo_pp_pedidos;
CREATE POLICY "authenticated_select" ON ficha_laudo_pp_pedidos FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_write"  ON ficha_laudo_pp_pedidos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update" ON ficha_laudo_pp_pedidos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_delete"         ON ficha_laudo_pp_pedidos FOR DELETE TO authenticated USING (public.is_admin());

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'ficha_laudo_pp_pedidos'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE ficha_laudo_pp_pedidos;
  END IF;
END $$;

-- ── Repontua ficha_laudo_pp (medidas) pro pedido, não mais pra ficha ────
ALTER TABLE ficha_laudo_pp ADD COLUMN IF NOT EXISTS laudo_pedido_id BIGINT REFERENCES ficha_laudo_pp_pedidos(id) ON DELETE CASCADE;

-- Migra o que já existia (deploy recente, volume mínimo): 1 pedido em
-- branco por ficha que já tinha laudo salvo, carregando os comentários/
-- fotos da tabela antiga (se existir), e aponta as medidas pra ele.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ficha_laudo_pp_info') THEN
    INSERT INTO ficha_laudo_pp_pedidos (ficha_id, numero_pedido, comentarios, fotos)
    SELECT DISTINCT fp.ficha_id, '', COALESCE(fi.comentarios, ''), COALESCE(fi.fotos, '[]'::jsonb)
    FROM ficha_laudo_pp fp
    LEFT JOIN ficha_laudo_pp_info fi ON fi.ficha_id = fp.ficha_id
    WHERE fp.laudo_pedido_id IS NULL;
  ELSE
    INSERT INTO ficha_laudo_pp_pedidos (ficha_id, numero_pedido)
    SELECT DISTINCT fp.ficha_id, ''
    FROM ficha_laudo_pp fp
    WHERE fp.laudo_pedido_id IS NULL;
  END IF;
END $$;

UPDATE ficha_laudo_pp fp
SET laudo_pedido_id = pp.id
FROM ficha_laudo_pp_pedidos pp
WHERE pp.ficha_id = fp.ficha_id AND fp.laudo_pedido_id IS NULL;

-- Troca a chave única de (ficha_id, ponto_cod) pra (laudo_pedido_id, ponto_cod)
ALTER TABLE ficha_laudo_pp DROP CONSTRAINT IF EXISTS ficha_laudo_pp_ficha_id_ponto_cod_key;
ALTER TABLE ficha_laudo_pp DROP COLUMN IF EXISTS ficha_id;
ALTER TABLE ficha_laudo_pp ALTER COLUMN laudo_pedido_id SET NOT NULL;
ALTER TABLE ficha_laudo_pp ADD CONSTRAINT ficha_laudo_pp_pedido_ponto_key UNIQUE (laudo_pedido_id, ponto_cod);
CREATE INDEX IF NOT EXISTS idx_ficha_laudo_pp_pedido_id ON ficha_laudo_pp(laudo_pedido_id);

-- ficha_laudo_pp_info foi absorvida por ficha_laudo_pp_pedidos
DROP TABLE IF EXISTS ficha_laudo_pp_info;

NOTIFY pgrst, 'reload schema';
