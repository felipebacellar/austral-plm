-- =============================================
-- AUSTRAL PLM — Migration 005: FK fichas_tecnicas → produtos
-- Execute no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/notcdmsqbbtuhsgtupck/sql
--
-- CONTEXTO: fichas_tecnicas.produto_ref é hoje um texto solto, sem vínculo
-- formal com produtos.ref. Consequência: excluir um produto NÃO apaga sua
-- ficha (fica órfã); se depois alguém criar um produto novo reaproveitando a
-- mesma referência, a ficha antiga (tecidos, preços, fotos) "ressuscita"
-- automaticamente nesse produto novo e diferente.
--
-- Esta migração:
--   1. Reporta (RAISE NOTICE) quantas fichas já estão órfãs hoje.
--   2. Remove essas fichas órfãs — elas são inalcançáveis pelo app (a UI só
--      abre ficha a partir de um produto existente) e são exatamente o dado
--      "fantasma" que este bug produziu.
--   3. Adiciona a foreign key com ON DELETE CASCADE, para o bug não se
--      repetir daqui pra frente. As tabelas filhas (ficha_tecidos,
--      ficha_aviamentos, ficha_pilotagem, ficha_provas, ficha_anotacoes) já
--      têm cascade a partir de fichas_tecnicas.id, então tudo é limpo em
--      cadeia automaticamente.
-- =============================================

DO $$
DECLARE
  orphan_count INT;
BEGIN
  SELECT COUNT(*) INTO orphan_count
  FROM fichas_tecnicas f
  WHERE NOT EXISTS (SELECT 1 FROM produtos p WHERE p.ref = f.produto_ref);

  RAISE NOTICE 'Fichas técnicas órfãs encontradas (produto_ref sem produto correspondente): %', orphan_count;
END $$;

-- Remove fichas órfãs (e suas filhas, via cascade já existente) antes de criar a FK
DELETE FROM fichas_tecnicas f
WHERE NOT EXISTS (SELECT 1 FROM produtos p WHERE p.ref = f.produto_ref);

-- Cria a foreign key, se ainda não existir
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fichas_tecnicas_produto_ref_fkey'
  ) THEN
    ALTER TABLE fichas_tecnicas
      ADD CONSTRAINT fichas_tecnicas_produto_ref_fkey
      FOREIGN KEY (produto_ref) REFERENCES produtos(ref) ON DELETE CASCADE;
  END IF;
END $$;
