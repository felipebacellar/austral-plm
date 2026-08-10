-- ═══════════════════════════════════════════════════════════════════════
-- Área média da modelagem, em m² por peça.
-- Vive na tabela de medidas (a modelagem), ao lado dos tamanhos e da base.
-- NUMERIC(10,4): as áreas têm 4 casas relevantes (ex. 0,9958 m²).
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE tabelas_medidas
  ADD COLUMN IF NOT EXISTS area_media NUMERIC(10,4);  -- m² por peça

NOTIFY pgrst, 'reload schema';
