-- ═══════════════════════════════════════════════════════════════════════
-- Dados técnicos do tecido, preenchidos no cadastro (Cadastros > Tecidos).
-- NUMERIC (e não texto) porque são grandezas: servem para cálculo de
-- consumo/rendimento depois. Todas ficam NULL até alguém preencher.
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE tecidos
  ADD COLUMN IF NOT EXISTS gramatura            NUMERIC(10,2),  -- g/m²
  ADD COLUMN IF NOT EXISTS largura              NUMERIC(10,2),  -- metros
  ADD COLUMN IF NOT EXISTS encolhimento_largura NUMERIC(10,2),  -- %
  ADD COLUMN IF NOT EXISTS encolhimento_altura  NUMERIC(10,2),  -- %
  ADD COLUMN IF NOT EXISTS rendimento           NUMERIC(10,2);  -- m/kg

NOTIFY pgrst, 'reload schema';
