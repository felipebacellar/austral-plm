-- ═══════════════════════════════════════════════════════════════════════
-- Foto do tecido no cadastro. Mesmo padrão do aviamento (`aviamentos.imagem`):
-- guarda a URL pública do arquivo no bucket "fichas-imagens", em
-- tecidos/{nome}/{timestamp}.jpg.
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE tecidos
  ADD COLUMN IF NOT EXISTS imagem TEXT DEFAULT '';

NOTIFY pgrst, 'reload schema';
