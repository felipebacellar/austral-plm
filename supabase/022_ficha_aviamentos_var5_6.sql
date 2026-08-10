-- ═══════════════════════════════════════════════════════════════════════
-- ficha_aviamentos só tinha var01..var04, mas a ficha admite produtos com
-- até 6 variantes (cores). Pra produtos de grade 5-6 cores, a cor do
-- aviamento escolhida pra 5ª/6ª variante nunca era salva (a tela deixava
-- escolher, mas o salvamento descartava, silenciosamente).
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE ficha_aviamentos
  ADD COLUMN IF NOT EXISTS var05 TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS var06 TEXT DEFAULT '';

NOTIFY pgrst, 'reload schema';
