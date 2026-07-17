-- =============================================
-- AUSTRAL PLM — Migration 003: Tecido no Produto
-- Execute no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/notcdmsqbbtuhsgtupck/sql
-- =============================================

-- 1. Adiciona colunas tecido e composicao em produtos
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS tecido     TEXT NOT NULL DEFAULT '';
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS composicao TEXT NOT NULL DEFAULT '';

-- 2. Migra o primeiro tecido de cada ficha para o produto
--    Tenta casar artigo da ficha com nome do cadastro de tecidos para pegar composição
UPDATE produtos p
SET
  tecido     = COALESCE(ft.artigo, ''),
  composicao = COALESCE(t.composicao, '')
FROM fichas_tecnicas f
JOIN ficha_tecidos ft ON ft.ficha_id = f.id
LEFT JOIN tecidos t   ON LOWER(t.nome) = LOWER(ft.artigo)
WHERE f.produto_ref = p.ref
  AND ft.id = (
    SELECT MIN(id) FROM ficha_tecidos WHERE ficha_id = f.id
  )
  AND (p.tecido = '' OR p.tecido IS NULL);

-- 3. Verifica resultado
SELECT ref, tecido, composicao
FROM produtos
WHERE tecido <> ''
ORDER BY ref
LIMIT 30;
