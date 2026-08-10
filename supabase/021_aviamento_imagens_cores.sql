-- ═══════════════════════════════════════════════════════════════════════
-- Foto por cor no cadastro de aviamento. Hoje `imagem` é uma foto única por
-- item — para aviamentos com várias cores (ex. botão em bege/marrom/preto),
-- isso força uma foto composta com as 3 cores juntas numa imagem só, o que
-- impede mostrar na ficha apenas a(s) cor(es) que a peça realmente usa.
-- `imagens_cores` guarda uma foto por cor: {"PRETO": "https://...", ...}.
-- Itens com uma cor só (ou nenhuma foto por cor ainda) continuam usando o
-- campo `imagem` genérico como está hoje.
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE aviamentos
  ADD COLUMN IF NOT EXISTS imagens_cores JSONB DEFAULT '{}'::jsonb;

NOTIFY pgrst, 'reload schema';
