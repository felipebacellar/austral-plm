-- ═══════════════════════════════════════════════════════════════════════
-- Peso do tecido em oz (onças por jarda quadrada), a unidade usada em jeans
-- e tecidos planos. Fica ao lado da gramatura: preencher um preenche o outro
-- (1 oz/yd² = 33,9057 g/m²), e guardar os dois evita perder o número redondo
-- que a pessoa digitou (12 oz vira 406,9 g/m², que de volta daria 11,99 oz).
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE tecidos
  ADD COLUMN IF NOT EXISTS oz NUMERIC(10,2);  -- oz/yd²

NOTIFY pgrst, 'reload schema';
