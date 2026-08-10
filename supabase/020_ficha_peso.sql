-- ═══════════════════════════════════════════════════════════════════════
-- Guarda o resultado do botão "Calcular peso" na própria ficha técnica,
-- do jeito que saiu na hora do cálculo (área, gramatura, origem, fator de
-- encolhimento e o peso final). Assim ele sobrevive a reabrir a ficha e
-- pode ser impresso no PDF, sem depender de recalcular toda vez a partir
-- do tecido/tabela de medidas (que podem mudar depois).
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE fichas_tecnicas
  ADD COLUMN IF NOT EXISTS peso_calculo JSONB;

NOTIFY pgrst, 'reload schema';
