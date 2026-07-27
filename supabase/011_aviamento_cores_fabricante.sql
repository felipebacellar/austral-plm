-- =============================================
-- AUSTRAL PLM — Migration 011: ref. de cor do fabricante por aviamento
-- Execute no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/notcdmsqbbtuhsgtupck/sql
--
-- Guarda, por aviamento, as cores com a referência de cor do fabricante.
-- Formato: [{ "cor": "PRETO", "ref": "BT-900" }, ...].
-- A "referência do fornecedor" (referencia_fabricante) usa a coluna
-- codigo_fornecedor que já existe — não precisa de coluna nova pra ela.
-- =============================================

ALTER TABLE aviamentos ADD COLUMN IF NOT EXISTS cores_fabricante JSONB DEFAULT '[]'::jsonb;
