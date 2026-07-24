-- =============================================
-- AUSTRAL PLM — Migration 009: fotos frente/costas do produto na ficha
-- Execute no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/notcdmsqbbtuhsgtupck/sql
--
-- Guarda as URLs das fotos de frente e costas do produto (vindas do site VTEX)
-- para exibir lado a lado na ficha técnica > liberação. São só URLs — as
-- imagens continuam hospedadas no site, não copiamos os arquivos.
-- =============================================

ALTER TABLE fichas_tecnicas ADD COLUMN IF NOT EXISTS imagem_frente TEXT;
ALTER TABLE fichas_tecnicas ADD COLUMN IF NOT EXISTS imagem_costas TEXT;
