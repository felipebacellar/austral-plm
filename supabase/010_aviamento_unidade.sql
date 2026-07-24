-- =============================================
-- AUSTRAL PLM — Migration 010: unidade do aviamento
-- Execute no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/notcdmsqbbtuhsgtupck/sql
--
-- Guarda a unidade de medida do aviamento (UN, PC, MT...) vinda do Linx.
-- =============================================

ALTER TABLE aviamentos ADD COLUMN IF NOT EXISTS unidade TEXT DEFAULT '';
